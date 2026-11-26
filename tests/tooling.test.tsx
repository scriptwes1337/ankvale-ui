import assert from "node:assert/strict"
import { mkdtemp, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import {
  createDesignSystem,
  validateDesignSystem,
  exportDesignSystem,
  applyDesignPatch,
  extractBrand,
  contrast,
  exportInterface,
  validateInterface,
} from "../packages/design-system/src"
import { DesignStudio } from "../apps/web/components/design-studio"
import { InterfaceBuilder } from "../apps/web/components/interface-builder"
import {
  isPublicAddress,
  fetchPublicWebsite,
} from "../apps/web/lib/public-website"
import { createAnkvaleServer } from "../mcp/server"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
export async function run() {
  const design = createDesignSystem()
  assert.equal(validateDesignSystem(design).light.primary, "#0d6efd")
  assert(contrast(design.light.foreground, design.light.background) > 10)
  assert(contrast(design.light.primaryForeground, design.light.primary) > 4.5)
  assert.throws(() =>
    validateDesignSystem({
      ...design,
      light: { ...design.light, primary: "red;display:none" },
    })
  )
  assert.throws(() =>
    validateDesignSystem({ ...design, components: { button: { radius: -1 } } })
  )
  assert.throws(() =>
    validateDesignSystem({
      ...design,
      light: {
        ...design.light,
        injected: "red; background:url(https://example.com)",
      },
    })
  )
  design.locked = ["light.primary"]
  const updated = applyDesignPatch(design, {
    mode: "light",
    tokens: { primary: "#ff0000", spacing: 6 },
  })
  assert.equal(updated.light.primary, "#0d6efd")
  assert.equal(updated.light.spacing, 6)
  assert.equal(design.light.spacing, 4)
  assert(exportDesignSystem(updated, "web-css").includes("--spacing: 6px"))
  assert.equal(
    JSON.parse(exportDesignSystem(updated, "native-theme")).light.primary,
    "#0d6efd"
  )
  assert(exportDesignSystem(updated, "design-md").includes("6px"))
  console.log("✓ design validation, contrast, locked patches, and exports")
  const brand = extractBrand(
    '<title>Example &amp; Co</title><meta name="description" content="A product"><link rel="icon" href="/icon.png"><style>body{color:#191919;font-family:Arial,sans-serif}</style>',
    "https://example.com"
  )
  assert.equal(brand.name, "Example & Co")
  assert.equal(brand.logo, "https://example.com/icon.png")
  assert.deepEqual(brand.colors, ["#191919"])
  console.log("✓ static website brand extraction")
  for (const address of [
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
  ])
    assert.equal(isPublicAddress(address), false, address)
  assert.equal(isPublicAddress("93.184.216.34"), true)
  await assert.rejects(fetchPublicWebsite("http://127.0.0.1"))
  await assert.rejects(fetchPublicWebsite("file:///etc/passwd"))
  console.log("✓ website importer rejects private and non-HTTP destinations")

  const doc = validateInterface({
    version: 1,
    name: "Form",
    layout: "stack",
    nodes: [
      { id: "title", type: "heading", text: "</h1><script>alert(1)</script>" },
      { id: "button", type: "button", text: "Save" },
    ],
  })
  const code = exportInterface(doc)
  assert(code.includes('{"</h1><script>alert(1)</script>"}'))
  assert.throws(() =>
    validateInterface({ ...doc, nodes: [...doc.nodes, doc.nodes[0]] })
  )
  console.log("✓ interface export escapes content and rejects duplicate nodes")
  localStorage.clear()
  const legacySystems = JSON.stringify([createDesignSystem("Saved brand")])
  localStorage.setItem("anchor-design-systems-v1", legacySystems)
  render(<DesignStudio />)
  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Name") as HTMLInputElement).value,
      "Saved brand"
    )
  )
  await waitFor(() =>
    assert.equal(
      localStorage.getItem("ankvale-design-systems-v1"),
      legacySystems
    )
  )
  assert.equal(localStorage.getItem("anchor-design-systems-v1"), legacySystems)
  cleanup()
  localStorage.clear()
  const legacyInterface = JSON.stringify(doc)
  localStorage.setItem("anchor-interface-v1", legacyInterface)
  render(<InterfaceBuilder />)
  await waitFor(() =>
    assert.equal(localStorage.getItem("ankvale-interface-v1"), legacyInterface)
  )
  assert.equal(localStorage.getItem("anchor-interface-v1"), legacyInterface)
  cleanup()
  localStorage.clear()
  console.log(
    "✓ rebrand preserves saved designs and interfaces from legacy browser storage"
  )
  render(<DesignStudio />)
  await waitFor(() => assert(screen.getByLabelText("Name")))
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Test brand" },
  })
  await waitFor(() =>
    assert(
      localStorage.getItem("ankvale-design-systems-v1")?.includes("Test brand")
    )
  )
  fireEvent.click(screen.getByRole("button", { name: "Undo" }))
  assert.equal(
    (screen.getByLabelText("Name") as HTMLInputElement).value,
    "Ankvale"
  )
  fireEvent.click(screen.getByRole("button", { name: "Redo" }))
  assert.equal(
    (screen.getByLabelText("Name") as HTMLInputElement).value,
    "Test brand"
  )
  cleanup()
  console.log("✓ studio autosave, undo and redo")
  render(<InterfaceBuilder />)
  fireEvent.click(screen.getByRole("button", { name: "card", exact: true }))
  assert(screen.getByText("card: Your content"))
  await waitFor(() =>
    assert(
      localStorage.getItem("ankvale-interface-v1")?.includes("Your content")
    )
  )
  fireEvent.click(screen.getByRole("button", { name: "Undo" }))
  assert.equal(screen.queryByText("card: Your content"), null)
  cleanup()
  console.log("✓ interface builder insertion, persistence and undo")
  const directory = await mkdtemp(path.join(tmpdir(), "ankvale-mcp-"))
  await writeFile(path.join(directory, "ankvale.json"), JSON.stringify(design))
  const server = createAnkvaleServer(process.cwd(), directory)
  const client = new Client({ name: "ankvale-test", version: "1" })
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair()
  await server.connect(serverTransport)
  await client.connect(clientTransport)
  try {
    const listed = await client.listTools()
    assert.equal(listed.tools.length, 10)
    const recommendations = await client.callTool({
      name: "recommend_patterns",
      arguments: { task: "Build a CRM pipeline" },
    })
    assert(JSON.stringify(recommendations).includes("kanban"))
    const guide = await client.callTool({
      name: "get_guide",
      arguments: { name: "motion" },
    })
    assert(JSON.stringify(guide).includes("reduced-motion"))
    const blocks = await client.callTool({
      name: "list_blocks",
      arguments: { query: "404" },
    })
    assert(JSON.stringify(blocks).includes("not-found-page"))
    const catalog = await client.callTool({
      name: "list_components",
      arguments: { platform: "web", query: "stepper" },
    })
    assert(JSON.stringify(catalog).includes("number-stepper"))
    const component = await client.callTool({
      name: "get_component",
      arguments: { name: "number-stepper", platform: "native" },
    })
    assert(JSON.stringify(component).includes("NumberStepper"))
    const system = await client.callTool({
      name: "get_design_system_export",
      arguments: { name: "ankvale", format: "web-css" },
    })
    assert(JSON.stringify(system).includes("#0d6efd"))
    const denied = await client.callTool({
      name: "get_component",
      arguments: { name: "../package", platform: "web" },
    })
    assert(denied.isError)
    console.log(
      "✓ MCP protocol discovery, component source, design export and path validation"
    )
  } finally {
    await client.close()
    await server.close()
    await rm(directory, { recursive: true, force: true })
  }
}
