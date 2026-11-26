import assert from "node:assert/strict"
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  readdir,
  access,
} from "node:fs/promises"
import path from "node:path"
import { tmpdir } from "node:os"
import { spawn } from "node:child_process"
import { createRequire } from "node:module"

const root = process.cwd()
const reports = JSON.parse(
  await readFile(path.join(root, ".release/pack-report.json"), "utf8")
)
assert.equal(reports.length, 1, "Publish one combined package")
assert.equal(reports[0].name, "@ankvalelabs/ui")
assert(reports[0].files.some(({ path: file }) => file === "cli/index.mjs"))
for (const report of reports) {
  assert(
    !report.files.some(({ path: file }) =>
      /^(?:apps\/|src\/|docs\/internal\/|tests\/|scripts\/|node_modules\/)/.test(
        file
      )
    )
  )
  assert(
    !report.files.some(({ path: file }) =>
      /(?:^|\/)\.env|dependency-inventory|licensing-audit|homepage|site-header|package-lock/.test(
        file
      )
    )
  )
  assert(report.files.some(({ path: file }) => file === "LICENSE"))
  assert(
    report.files.some(({ path: file }) => file === "THIRD_PARTY_NOTICES.txt")
  )
}
const tarball = (name) =>
  path.join(
    root,
    ".release/tarballs",
    reports.find((item) => item.name === name).filename
  )
const uiTarball = tarball("@ankvalelabs/ui")
const fixture = await mkdtemp(path.join(tmpdir(), "ankvale-consumers-"))
async function put(file, content) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
}
async function run(command, args, cwd, expectFailure = false) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    })
    let output = ""
    child.stdout.on("data", (data) => (output += data))
    child.stderr.on("data", (data) => (output += data))
    child.on("error", reject)
    child.on("close", (code) => resolve({ code, output }))
  })
  await writeFile(
    path.join(cwd, `last-${path.basename(command)}.log`),
    result.output
  )
  if (expectFailure) assert.notEqual(result.code, 0, result.output)
  else assert.equal(result.code, 0, result.output.slice(-6000))
  return result.output
}
const nextRoot = path.join(fixture, "next-app")
await mkdir(nextRoot)
await put(
  path.join(nextRoot, "package.json"),
  JSON.stringify(
    {
      name: "ankvale-next-consumer",
      private: true,
      type: "module",
      scripts: { build: "next build" },
      dependencies: { next: "16.4.6", react: "19.3.1", "react-dom": "19.3.1" },
      devDependencies: {
        typescript: "5.9.3",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@types/node": "^22",
      },
    },
    null,
    2
  )
)
const originalLayout =
  'import type { ReactNode } from "react"\nexport default function Layout({children}:{children:ReactNode}) { return <html lang="en"><body><div data-product="keep">{children}</div></body></html> }\n'
await put(path.join(nextRoot, "app/layout.tsx"), originalLayout)
await put(
  path.join(nextRoot, "AGENTS.md"),
  "# Product instructions\nPreserve our authentication and billing conventions.\n"
)
console.log(`Installing isolated Next.js consumer at ${nextRoot}`)
await run(
  "npm",
  ["install", "--ignore-scripts", "--no-audit", "--no-fund", uiTarball],
  nextRoot
)
const cli = path.join(nextRoot, "node_modules/@ankvalelabs/ui/cli/index.mjs")
const invoke = (args, expectFailure = false) =>
  run(
    process.execPath,
    [cli, ...args, "--cwd", nextRoot],
    nextRoot,
    expectFailure
  )
assert(
  (
    await run("npx", ["--no-install", "@ankvalelabs/ui", "help"], nextRoot)
  ).includes("Ankvale CLI 0.1.0")
)
const packedManifest = JSON.parse(
  await readFile(
    path.join(nextRoot, "node_modules/@ankvalelabs/ui/package.json"),
    "utf8"
  )
)
assert.equal(packedManifest.bin.ankvale, "./cli/index.mjs")
assert(!packedManifest.dependencies["@ankvalelabs/cli"])
await invoke(["init", "--agent", "both", "--no-install", "--dry-run"])
assert.equal(
  await readFile(path.join(nextRoot, "app/layout.tsx"), "utf8"),
  originalLayout
)
await assert.rejects(access(path.join(nextRoot, ".ankvale/setup.json")))
await run(
  "npx",
  [
    "--no-install",
    "@ankvalelabs/ui",
    "init",
    "--agent",
    "both",
    "--runtime",
    uiTarball,
  ],
  nextRoot
)
const instructions = await readFile(path.join(nextRoot, "AGENTS.md"), "utf8")
assert(
  instructions.startsWith(
    "# Product instructions\nPreserve our authentication and billing conventions."
  )
)
assert.equal(instructions.split("<!-- BEGIN ANKVALE -->").length, 2)
assert(
  (await readFile(path.join(nextRoot, "app/layout.tsx"), "utf8")).includes(
    'data-product="keep"'
  )
)
await invoke(["init", "--no-install"])
assert.equal(
  await readFile(path.join(nextRoot, "AGENTS.md"), "utf8"),
  instructions
)
assert.equal(
  (await readFile(path.join(nextRoot, "app/layout.tsx"), "utf8")).split(
    "<AnkvaleSystemRoot>"
  ).length,
  2
)
await run("npx", ["--no-install", "@ankvalelabs/ui", "doctor"], nextRoot)
const designFile = path.join(nextRoot, ".ankvale/design.md")
const design = await readFile(designFile, "utf8")
await writeFile(designFile, design + "\nProduct-specific local edit.\n")
assert((await invoke(["update", "--no-install"], true)).includes("preserved"))
assert(
  (await readFile(designFile, "utf8")).endsWith(
    "Product-specific local edit.\n"
  )
)
await writeFile(designFile, design)
await invoke([
  "add",
  "dashboard",
  "--path",
  "app/dashboard/page.tsx",
  "--dry-run",
])
await assert.rejects(access(path.join(nextRoot, "app/dashboard/page.tsx")))
await invoke(["add", "dashboard", "--path", "app/dashboard/page.tsx"])
await invoke(["add", "dashboard", "--path", "app/dashboard/page.tsx"], true)
await invoke(["add", "dashboard", "--path", "../outside/page.tsx"], true)
await put(
  path.join(nextRoot, "app/page.tsx"),
  `"use client"\nimport { useState } from "react"\nimport { Button } from "@ankvalelabs/ui/components/button"\nimport { Input } from "@ankvalelabs/ui/components/input"\nimport { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@ankvalelabs/ui/components/dialog"\nimport { Calendar } from "@ankvalelabs/ui/components/calendar"\nimport { Presence } from "@ankvalelabs/ui/components/animation"\nimport { MagnifyingGlassIcon } from "@ankvalelabs/ui/icons"\nexport default function Page(){ const [open,setOpen]=useState(false);return <main><h1>Installed Ankvale</h1><Button onClick={()=>setOpen(!open)}>Toggle notice</Button><Presence present={open}><p>Runtime animation works</p></Presence><Input aria-label="Project name" placeholder="Project name"/><MagnifyingGlassIcon aria-hidden="true"/><Dialog><DialogTrigger render={<Button/>}>Open dialog</DialogTrigger><DialogContent><DialogTitle>Consumer dialog</DialogTitle><DialogDescription>Installed from the tarball</DialogDescription></DialogContent></Dialog><Calendar/></main> }\n`
)
await put(
  path.join(nextRoot, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["dom", "dom.iterable", "esnext"],
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        plugins: [{ name: "next" }],
      },
      include: ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    },
    null,
    2
  )
)
await run("npm", ["run", "build"], nextRoot)
console.log(
  "✓ Next.js production build: isolated runtime, provider, CSS, icons, dialogs, calendar, animation and scaffolded dashboard"
)
const viteRoot = path.join(fixture, "vite-app")
await mkdir(viteRoot)
await put(
  path.join(viteRoot, "package.json"),
  JSON.stringify(
    {
      name: "ankvale-vite-consumer",
      private: true,
      type: "module",
      scripts: { build: "vite build" },
      dependencies: {
        react: "19.3.1",
        "react-dom": "19.3.1",
        "@ankvalelabs/ui": `file:${uiTarball}`,
      },
      devDependencies: {
        vite: "^7",
        typescript: "5.9.3",
        "@types/react": "^19",
        "@types/react-dom": "^19",
      },
    },
    null,
    2
  )
)
await put(
  path.join(viteRoot, "index.html"),
  '<html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>'
)
await put(
  path.join(viteRoot, "main.tsx"),
  'import React from "react";import {createRoot} from "react-dom/client";import "@ankvalelabs/ui/styles.css";import {AnkvaleProvider} from "@ankvalelabs/ui";import {Button} from "@ankvalelabs/ui/components/button";createRoot(document.getElementById("root")!).render(<><button className="bg-primary" id="host-button">Host button</button><AnkvaleProvider><Button id="ankvale-button">Package button</Button><p>Built with Ankvale UI by Ankvale Labs</p></AnkvaleProvider></>);'
)
console.log(`Installing isolated Vite consumer at ${viteRoot}`)
await run(
  "npm",
  ["install", "--ignore-scripts", "--no-audit", "--no-fund"],
  viteRoot
)
await run("npm", ["run", "build"], viteRoot)
const browserChunks = (
  await readdir(path.join(viteRoot, "dist/assets"))
).filter((file) => file.endsWith(".js"))
for (const file of browserChunks) {
  const content = await readFile(
    path.join(viteRoot, "dist/assets", file),
    "utf8"
  )
  assert(
    !content.includes("Ankvale CLI"),
    "Node CLI must not enter browser chunks"
  )
  assert(
    !content.includes("createSourceFile"),
    "TypeScript parser must not enter browser chunks"
  )
}
console.log(
  "✓ Vite production build: browser runtime excludes CLI/parser; no Tailwind/shadcn setup"
)
const catalog = JSON.parse(
  await readFile(path.join(nextRoot, ".ankvale/catalog.json"), "utf8")
)
const consumerRequire = createRequire(path.join(nextRoot, "package.json"))
const ts = consumerRequire("typescript")
const imports = []
let counter = 0
for (const entry of catalog.entries) {
  if (!entry.importPath || !entry.exports.length) continue
  imports.push(
    `import * as Module${counter} from ${JSON.stringify(entry.importPath)};`
  )
  for (const name of entry.exports)
    if (/^[A-Z_a-z][\w]*$/.test(name))
      imports.push(`void Module${counter}.${name};`)
  counter++
}
const allExportsFile = path.join(nextRoot, "all-exports.ts")
await writeFile(allExportsFile, imports.join("\n"))
const typeProgram = ts.createProgram([allExportsFile], {
  noEmit: true,
  strict: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
})
const diagnostics = ts.getPreEmitDiagnostics(typeProgram)
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => nextRoot,
    getCanonicalFileName: (file) => file,
    getNewLine: () => "\n",
  })
)
console.log(
  `✓ ${counter} catalog import/exports resolve against packed declarations`
)
const result = {
  fixture,
  next: nextRoot,
  vite: viteRoot,
  packages: reports.map(({ name, version, filename }) => ({
    name,
    version,
    filename,
  })),
  checks: [
    "single package and npx CLI entry",
    "package allowlists",
    "dry run",
    "AGENTS preservation",
    "idempotence",
    "both agent adapters",
    "doctor",
    "edited-file conflict",
    "route collision/traversal",
    "template scaffold",
    "Next production build",
    "Vite production build",
    "catalog declarations",
  ],
}
await writeFile(
  path.join(root, ".release/verification.json"),
  JSON.stringify(result, null, 2) + "\n"
)
console.log(JSON.stringify(result, null, 2))
