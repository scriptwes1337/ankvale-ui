import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
  within,
} from "@testing-library/react"
import { SystemPreview } from "../apps/web/components/system-previews"
import { systemPreviewNames } from "../apps/web/lib/system-preview-names"
import { Form, FormField, useForm } from "../packages/ui/src/components/form"
import { Input } from "../packages/ui/src/components/input"
import {
  parseDateOnly,
  formatDateOnly,
} from "../packages/ui/src/components/date-picker"
import { Popconfirm } from "../packages/ui/src/components/popconfirm"
import { QRCode } from "../packages/ui/src/components/qr-code"
import { Image } from "../packages/ui/src/components/image"
import { CircularProgress } from "../packages/ui/src/components/circular-progress"
import { useMediaQuery } from "../packages/ui/src/hooks/use-media-query"
import { useState } from "react"
import { Cascader } from "../packages/ui/src/components/cascader"
import { PeriodRangePicker } from "../packages/ui/src/components/period-picker"
function MediaExample() {
  const narrow = useMediaQuery("(max-width: 600px)")
  return <p>{narrow ? "Narrow media" : "Wide media"}</p>
}
function AsyncForm({ submit }: { submit: () => Promise<void> }) {
  const form = useForm({ defaultValues: { name: "Existing name" } })
  return (
    <Form form={form} onSubmit={submit}>
      <FormField
        name="name"
        label="Name"
        render={({ field, inputProps }) => <Input {...field} {...inputProps} />}
      />
      <button type="submit">Save</button>
    </Form>
  )
}
export async function run() {
  for (const name of systemPreviewNames.filter(name=>!["animation","ankvale-provider"].includes(name))) {
    const html = renderToString(<SystemPreview name={name} />)
    assert(html.length > 20, name)
    assert(!html.includes("Unknown component"), name)
    assert(!html.includes("undefined"), name)
  }
  console.log(
    `✓ ${systemPreviewNames.filter(name => !["ankvale-provider", "animation"].includes(name)).length} system previews server-render with actual content`
  )
  render(<SystemPreview name="form" />)
  fireEvent.click(screen.getByRole("button", { name: "Save project" }))
  assert(await screen.findByText("Enter a project name."))
  await waitFor(() =>
    assert.equal(document.activeElement, screen.getByLabelText("Project name"))
  )
  fireEvent.change(screen.getByLabelText("Project name"), {
    target: { value: "Launch" },
  })
  fireEvent.change(screen.getByLabelText("Member 1 email"), {
    target: { value: "alex@example.com" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Add member" }))
  fireEvent.change(screen.getByLabelText("Member 2 email"), {
    target: { value: "jamie@example.com" },
  })
  fireEvent.click(screen.getByLabelText("Remove member 1"))
  assert.equal(
    (screen.getByLabelText("Member 1 email") as HTMLInputElement).value,
    "jamie@example.com"
  )
  fireEvent.click(screen.getByRole("button", { name: "Save project" }))
  assert(await screen.findByText("Project saved in this preview."))
  cleanup()
  let reject!: () => void
  let calls = 0
  const pending = new Promise<void>((_, fail) => {
    reject = () => fail(new Error("unavailable"))
  })
  const form = render(
    <AsyncForm
      submit={() => {
        calls++
        return pending
      }}
    />
  )
  fireEvent.submit(form.container.querySelector("form")!)
  fireEvent.submit(form.container.querySelector("form")!)
  await waitFor(() => assert.equal(calls, 1))
  await act(async () => {
    reject()
  })
  assert(await screen.findByRole("alert"))
  assert.equal(
    (screen.getByLabelText("Name") as HTMLInputElement).value,
    "Existing name"
  )
  cleanup()
  console.log(
    "✓ required fields, focus, field arrays, async failure/value retention and duplicate submission guard"
  )
  assert.equal(parseDateOnly("2026-02-29"), undefined)
  assert.equal(parseDateOnly("2024-02-29")?.getDate(), 29)
  assert.equal(parseDateOnly("2026-13-01"), undefined)
  assert.equal(formatDateOnly(parseDateOnly("0099-01-02")!), "0099-01-02")
  render(<SystemPreview name="date-picker" />)
  fireEvent.change(screen.getByLabelText("Start date"), {
    target: { value: "2026-12-10" },
  })
  fireEvent.change(screen.getByLabelText("End date"), {
    target: { value: "2026-12-09" },
  })
  assert(screen.getByText("End date must follow start date."))
  cleanup()
  console.log("✓ strict date-only parsing and date range order validation")
  render(<SystemPreview name="cascader" />)
  let selects = screen.getAllByRole("combobox")
  fireEvent.change(selects[0]!, { target: { value: "studio" } })
  selects = screen.getAllByRole("combobox")
  fireEvent.change(selects[1]!, { target: { value: "design" } })
  assert.equal(screen.getAllByRole("combobox").length, 3)
  fireEvent.change(selects[0]!, { target: { value: "business" } })
  assert.equal(screen.getAllByRole("combobox").length, 2)
  assert.equal(
    (screen.getAllByRole("combobox")[1] as HTMLSelectElement).value,
    ""
  )
  cleanup()
  render(<SystemPreview name="transfer" />)
  fireEvent.click(screen.getByLabelText("Alex Lee"))
  fireEvent.click(screen.getByRole("button", { name: "Move to selected" }))
  assert(screen.getByText("2 selected"))
  assert.equal(document.activeElement, screen.getByLabelText("Alex Lee"))
  assert.equal(
    (screen.getByLabelText("Taylor Brooks") as HTMLInputElement).disabled,
    true
  )
  cleanup()
  render(<SystemPreview name="mentions" />)
  const comment = screen.getByLabelText("Comment") as HTMLTextAreaElement
  fireEvent.change(comment, { target: { value: "Hi @al", selectionStart: 6 } })
  assert(screen.getByRole("listbox"))
  fireEvent.keyDown(comment, { key: "Enter" })
  assert.equal(comment.value, "Hi @alex ")
  assert.equal(screen.queryByRole("listbox"), null)
  cleanup()
  console.log(
    "✓ cascader clears descendants, transfer selection/disabled items, mention keyboard insertion"
  )
  let attempts = 0
  const lazy = async (_path: string[], signal: AbortSignal) => {
    attempts++
    assert.equal(signal.aborted, false)
    if (attempts === 1) throw new Error("retry")
    return [{ value: "leaf", label: "Loaded team" }]
  }
  render(
    <Cascader
      label="Lazy teams"
      options={[{ value: "root", label: "Organization", hasChildren: true }]}
      loadChildren={lazy}
    />
  )
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "root" } })
  assert(await screen.findByText("Could not load options."))
  fireEvent.click(screen.getByRole("button", { name: "Retry" }))
  assert(await screen.findByRole("option", { name: "Loaded team" }))
  assert.equal(attempts, 2)
  cleanup()
  render(
    <PeriodRangePicker
      kind="quarter"
      label="Reporting quarters"
      defaultValue={{ start: "2026-Q4", end: "2026-Q1" }}
    />
  )
  assert(screen.getByText("End period must follow start period."))
  cleanup()
  console.log("✓ lazy cascader error/retry and period range ordering")
  render(<SystemPreview name="tree-select" />)
  fireEvent.click(screen.getByRole("button", { name: /Teams/ }))
  const design = await screen.findByRole("checkbox", { name: "Design" })
  fireEvent.click(design)
  assert.equal((design as HTMLInputElement).checked, true)
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }))
  assert.equal((design as HTMLInputElement).checked, false)
  cleanup()
  render(
    <Popconfirm
      trigger="Delete"
      title="Delete draft?"
      onConfirm={async () => {
        throw new Error("fail")
      }}
    />
  )
  fireEvent.click(screen.getByRole("button", { name: "Delete" }))
  fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
  assert(await screen.findByText("Could not complete the action. Try again."))
  assert(screen.getByRole("button", { name: "Cancel" }))
  cleanup()
  render(<SystemPreview name="notification" />)
  fireEvent.click(
    screen.getByRole("button", { name: "Dismiss Review requested" })
  )
  assert(screen.getByRole("button", { name: "Show notification" }))
  cleanup()
  console.log(
    "✓ tree multi-selection/reset, rejected confirmations, persistent notification dismissal"
  )
  render(<Image src="bad.png" alt="Project reference" />)
  fireEvent.error(screen.getByRole("img", { name: "Project reference" }))
  assert(screen.getByText("Image unavailable"))
  cleanup()
  render(<SystemPreview name="image-list" />)
  fireEvent.click(
    screen.getByRole("button", { name: "Preview Blue circle study" })
  )
  assert(await screen.findByRole("dialog"))
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }))
  assert(
    screen
      .getByRole("button", { name: "Reset zoom" })
      .textContent?.includes("150%")
  )
  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  assert(screen.getByRole("heading", { name: "Arch study" }))
  assert(
    screen
      .getByRole("button", { name: "Reset zoom" })
      .textContent?.includes("100%")
  )
  cleanup()
  render(<QRCode value="https://example.com" label="Workspace link" />)
  assert(
    screen
      .getByRole("img", { name: "Workspace link" })
      .querySelector("path")
      ?.getAttribute("d")?.length
  )
  cleanup()
  render(<QRCode value="x" label="Expired link" status="expired" />)
  assert(screen.getByText("Code expired"))
  assert.equal(screen.queryByRole("img"), null)
  cleanup()
  render(<CircularProgress label="Upload" value={150} />)
  assert.equal(
    screen.getByRole("progressbar").getAttribute("aria-valuenow"),
    "100"
  )
  cleanup()
  console.log(
    "✓ image fallback/gallery navigation, generated/expired QR states and progress bounds"
  )
  render(<SystemPreview name="tour" />)
  fireEvent.click(screen.getByRole("button", { name: "Start tour" }))
  assert(await screen.findByRole("heading", { name: "Your workspace" }))
  assert.equal(screen.getByRole("dialog").style.translate, "none")
  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  assert(screen.getByRole("heading", { name: "You’re ready" }))
  fireEvent.click(screen.getByRole("button", { name: "Finish" }))
  await waitFor(() => assert.equal(screen.queryByRole("dialog"), null))
  cleanup()
  console.log("✓ tour progression, missing-target fallback and completion")
  const original = window.matchMedia
  let matches = false
  const listeners = new Set<() => void>()
  window.matchMedia = (() => ({
    matches,
    addEventListener: (_type: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_type: string, fn: () => void) =>
      listeners.delete(fn),
  })) as unknown as typeof window.matchMedia
  render(<MediaExample />)
  assert(screen.getByText("Wide media"))
  act(() => {
    matches = true
    listeners.forEach((fn) => fn())
  })
  assert(screen.getByText("Narrow media"))
  cleanup()
  assert.equal(listeners.size, 0)
  window.matchMedia = original
  console.log("✓ media query live changes and listener cleanup")
  for (const id of systemPreviewNames) {
    const item = JSON.parse(
      await readFile(`apps/web/public/r/${id}.json`, "utf8")
    )
    assert(item.files.length > 0, id)
    assert(
      !item.files.some((f: { content: string }) =>
        f.content.includes("@workspace/")
      ),
      id
    )
    const api = JSON.parse(
      await readFile(`apps/web/public/api/components/${id}.json`, "utf8")
    )
    assert(api.example, id)
  }
  console.log(
    "✓ all system families have install manifests, source closure and documented examples"
  )
}
