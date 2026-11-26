import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react"
import { useState } from "react"
import { EnhancementPreview } from "../apps/web/components/enhancement-previews"
import names from "../apps/web/lib/enhancement-preview-names.json"
import {
  parseLocalizedNumber,
  NumberField,
} from "../packages/ui/src/components/number-field"
import {
  normalizeHex,
  parseColor,
  formatColor,
} from "../packages/ui/src/components/color-picker"
import {
  SelectionField,
  type SelectionOption,
} from "../packages/ui/src/components/selection-field"
import {
  useUploadQueue,
  type UploadTransport,
} from "../packages/ui/src/components/upload-manager"
import { exportGridCsv } from "../packages/ui/src/components/editable-grid"
import {
  aggregateRows,
  pivotRows,
  calculateFormula,
  parseDelimitedRows,
} from "../packages/ui/src/lib/grid-analysis"
import {
  expandRecurringEvents,
  findEventConflicts,
} from "../packages/ui/src/components/scheduler"
import { DashboardTemplate } from "../packages/ui/src/templates/dashboard"
import { Rating } from "../packages/ui/src/components/rating"
import { Tree } from "../packages/ui/src/components/tree"
import { CollectionList } from "../packages/ui/src/components/collection-list"
import { Textarea } from "../packages/ui/src/components/textarea"
function QueueHarness({ upload }: { upload: UploadTransport }) {
  const queue = useUploadQueue({ upload, concurrency: 1 })
  return (
    <div>
      <button
        onClick={() =>
          queue.add([new File(["a"], "a.txt"), new File(["b"], "b.txt")])
        }
      >
        Add uploads
      </button>
      {queue.items.map((item) => (
        <div key={item.id}>
          <p>
            {item.file.name}: {item.status}
          </p>
          <button onClick={() => queue.cancel(item.id)}>
            Cancel {item.file.name}
          </button>
          <button onClick={() => queue.retry(item.id)}>
            Retry {item.file.name}
          </button>
        </div>
      ))}
    </div>
  )
}
export async function run() {
  for (const name of names) {
    const html = renderToString(<EnhancementPreview name={name} />)
    assert(html.length > 50, name)
    assert(!html.includes("Unknown enhancement"), name)
  }
  console.log(`✓ ${names.length} enhancement previews render`)
  render(<EnhancementPreview name="text-field" />)
  const password = screen.getByLabelText("Password") as HTMLInputElement
  assert.equal(password.type, "password")
  fireEvent.click(screen.getByRole("button", { name: "Show Password" }))
  assert.equal(password.type, "text")
  const search = screen.getByLabelText("Search projects") as HTMLInputElement
  fireEvent.change(search, { target: { value: "launch" } })
  fireEvent.click(screen.getByRole("button", { name: "Clear Search projects" }))
  assert.equal(search.value, "")
  assert.equal(document.activeElement, search)
  cleanup()
  render(
    <SelectionField
      label="Teams"
      options={[{ value: "design", label: "Design" }]}
      multiple
      creatable
    />
  )
  const combo = screen.getByRole("combobox")
  fireEvent.focus(combo)
  fireEvent.change(combo, { target: { value: "Research" } })
  fireEvent.keyDown(combo, { key: "Enter" })
  assert(screen.getByText("Research"))
  fireEvent.click(screen.getByRole("button", { name: "Remove Research" }))
  assert.equal(screen.queryByText("Research"), null)
  cleanup()
  let requests: {
    query: string
    signal: AbortSignal
    resolve: (options: SelectionOption[]) => void
  }[] = []
  const load = (query: string, signal: AbortSignal) =>
    new Promise<SelectionOption[]>((resolve) =>
      requests.push({ query, signal, resolve })
    )
  render(<SelectionField label="Async teams" loadOptions={load} />)
  const asyncCombo = screen.getByRole("combobox")
  fireEvent.focus(asyncCombo)
  await waitFor(() => assert.equal(requests.length, 1))
  fireEvent.change(asyncCombo, { target: { value: "new" } })
  await waitFor(() => assert.equal(requests.length, 2))
  assert(requests[0]!.signal.aborted)
  await act(async () =>
    requests[1]!.resolve([{ value: "new", label: "New team" }])
  )
  assert(screen.getByRole("option", { name: "New team" }))
  await act(async () =>
    requests[0]!.resolve([{ value: "old", label: "Old team" }])
  )
  assert.equal(screen.queryByRole("option", { name: "Old team" }), null)
  cleanup()
  console.log(
    "✓ password/search controls, creatable tags and async selector cancellation"
  )
  assert.equal(parseLocalizedNumber("1.234,56", "de-DE"), 1234.56)
  assert.equal(parseLocalizedNumber("invalid", "en-US"), undefined)
  assert.equal(normalizeHex("#ABC"), "#aabbcc")
  assert.equal(parseColor("rgb(255, 0, 128)"), "#ff0080")
  assert.equal(parseColor("hsl(120, 100%, 50%)"), "#00ff00")
  assert.equal(parseColor("rgba(0, 0, 0, 2)"), undefined)
  assert.equal(formatColor("#ff0000", "hsl"), "hsl(0, 100%, 50%)")
  render(
    <NumberField label="Budget" defaultValue={5} min={0} max={10} step={3} />
  )
  fireEvent.click(screen.getByRole("button", { name: "Increase Budget" }))
  fireEvent.click(screen.getByRole("button", { name: "Increase Budget" }))
  assert.equal(
    (screen.getByLabelText("Budget") as HTMLInputElement).value,
    "10"
  )
  cleanup()
  console.log(
    "✓ locale numeric parsing/bounds and validated hex/RGB/HSL colors"
  )
  render(<EnhancementPreview name="editable-grid" />)
  fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]!)
  const task = screen.getByLabelText("Edit Task for 1")
  fireEvent.change(task, { target: { value: "" } })
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  assert(await screen.findByText("Enter a task name."))
  fireEvent.change(task, { target: { value: "Updated homepage" } })
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  assert(await screen.findByText("Updated homepage"))
  fireEvent.click(screen.getByRole("button", { name: "Undo" }))
  assert(screen.getByText("Homepage"))
  fireEvent.click(screen.getByRole("button", { name: "Redo" }))
  assert(screen.getByText("Updated homepage"))
  cleanup()
  assert.equal(
    calculateFormula("(hours + 2) * rate", { hours: 4, rate: 10 }),
    60
  )
  assert.equal(calculateFormula("-hours + 10", { hours: 4 }), 6)
  assert.throws(() => calculateFormula("globalThis.process.exit()", {}))
  assert.throws(() => calculateFormula("a / 0", { a: 1 }))
  assert.deepEqual(parseDelimitedRows('name,notes\r\n"A","one, two"'), [
    ["name", "notes"],
    ["A", "one, two"],
  ])
  assert(
    exportGridCsv(
      [{ name: "=SUM(A1)" }],
      [{ id: "name", header: "Name", accessorKey: "name" }]
    ).includes("'=SUM")
  )
  const rows = [
    { team: "A", quarter: "Q1", amount: 2 },
    { team: "A", quarter: "Q2", amount: 3 },
  ]
  assert.equal(
    aggregateRows(
      rows,
      (row) => row.team,
      (row) => row.amount
    )[0]!.sum,
    5
  )
  assert.equal(
    pivotRows(
      rows,
      (row) => row.team,
      (row) => row.quarter,
      (row) => row.amount
    ).rows[0]!.values.Q2,
    3
  )
  console.log(
    "✓ editable row validation/save/undo/redo, safe formula parser, CSV and pivot operations"
  )
  render(<Rating label="Score" precision={0.5} clearable defaultValue={2.5} />)
  assert(
    (screen.getByRole("radio", { name: "2.5 stars" }) as HTMLInputElement)
      .checked
  )
  fireEvent.click(screen.getByRole("radio", { name: "4.5 stars" }))
  assert(
    (screen.getByRole("radio", { name: "4.5 stars" }) as HTMLInputElement)
      .checked
  )
  fireEvent.click(screen.getByRole("button", { name: "Clear Score" }))
  assert.equal(
    screen
      .getAllByRole("radio")
      .some((input) => (input as HTMLInputElement).checked),
    false
  )
  cleanup()
  render(
    <Tree
      label="Cascade tree"
      checkable
      multiple
      checkStrategy="cascade"
      nodes={[
        {
          id: "parent",
          label: "Parent",
          children: [
            { id: "a", label: "Alpha" },
            { id: "b", label: "Beta" },
            { id: "disabled", label: "Disabled", disabled: true },
          ],
        },
      ]}
    />
  )
  fireEvent.click(screen.getByLabelText("Select Parent"))
  fireEvent.click(screen.getByLabelText("Expand Parent"))
  assert.equal(
    (screen.getByLabelText("Select Alpha") as HTMLInputElement).checked,
    true
  )
  assert.equal(
    (screen.getByLabelText("Select Beta") as HTMLInputElement).checked,
    true
  )
  assert.equal(
    (screen.getByLabelText("Select Disabled") as HTMLInputElement).checked,
    false
  )
  fireEvent.click(screen.getByLabelText("Select Alpha"))
  assert.equal(
    (screen.getByLabelText("Select Parent") as HTMLInputElement).indeterminate,
    true
  )
  assert.equal(
    (screen.getByLabelText("Select Parent") as HTMLInputElement).checked,
    false
  )
  fireEvent.click(screen.getByLabelText("Select Alpha"))
  assert.equal(
    (screen.getByLabelText("Select Parent") as HTMLInputElement).checked,
    true
  )
  cleanup()
  render(
    <Tree
      label="Lazy cascade"
      checkable
      checkStrategy="cascade"
      nodes={[{ id: "lazy", label: "Lazy", hasChildren: true }]}
      loadChildren={async () => [{ id: "child", label: "Loaded child" }]}
    />
  )
  fireEvent.click(screen.getByLabelText("Select Lazy"))
  fireEvent.click(screen.getByLabelText("Expand Lazy"))
  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Select Loaded child") as HTMLInputElement)
        .checked,
      true
    )
  )
  cleanup()
  const many = Array.from({ length: 1000 }, (_, i) => ({
    id: String(i),
    label: `Node ${i}`,
  }))
  const virtualTree = renderToString(
    <Tree label="Large tree" virtualized nodes={many} />
  )
  assert.ok(virtualTree.includes("Node 0"))
  assert.ok(!virtualTree.includes("Node 999"))
  const virtualCollection = renderToString(
    <CollectionList
      label="Large list"
      virtualized
      items={many.map((node) => ({
        id: node.id,
        title: node.label,
        group: "People",
      }))}
    />
  )
  assert.ok(virtualCollection.includes("Node 0"))
  assert.ok(!virtualCollection.includes("Node 999"))
  render(<EnhancementPreview name="tree" />)
  fireEvent.click(screen.getByRole("button", { name: "Expand Design" }))
  fireEvent.click(screen.getByRole("checkbox", { name: "Select Website" }))
  assert(
    (
      screen.getByRole("checkbox", {
        name: "Select Website",
      }) as HTMLInputElement
    ).checked
  )
  fireEvent.click(screen.getAllByRole("button", { name: "Rename" })[0]!)
  fireEvent.change(screen.getByLabelText("Rename Design"), {
    target: { value: "Studio" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  assert(await screen.findByText("Studio"))
  cleanup()
  render(<Textarea aria-label="Notes" minRows={2} maxRows={4} />)
  const notes = screen.getByLabelText("Notes") as HTMLTextAreaElement
  Object.defineProperty(notes, "scrollHeight", {
    value: 500,
    configurable: true,
  })
  fireEvent.input(notes, { target: { value: "Long notes" } })
  assert.equal(notes.style.overflowY, "auto")
  cleanup()
  console.log(
    "✓ fractional rating/clear, checkable/rename tree and textarea fallback sizing"
  )
  let resolveFirst!: () => void
  let started = 0
  const upload: UploadTransport = async () => {
    started++
    if (started === 1)
      await new Promise<void>((resolve) => (resolveFirst = resolve))
  }
  render(<QueueHarness upload={upload} />)
  fireEvent.click(screen.getByRole("button", { name: "Add uploads" }))
  await waitFor(() => assert.equal(started, 1))
  assert(screen.getByText("b.txt: queued"))
  await act(async () => resolveFirst())
  assert(await screen.findByText("b.txt: complete"))
  assert.equal(started, 2)
  cleanup()
  console.log(
    "✓ upload queue respects concurrency and advances completed tasks"
  )
  const event = {
    id: "a",
    title: "Review",
    start: new Date(2026, 10, 1, 9),
    end: new Date(2026, 10, 1, 10),
    resourceId: "room",
    recurrence: {
      frequency: "weekly" as const,
      count: 3,
      exceptions: ["2026-11-08"],
    },
  }
  assert.equal(expandRecurringEvents([event]).length, 2)
  assert.equal(
    findEventConflicts(
      {
        id: "b",
        title: "Overlap",
        start: new Date(2026, 10, 1, 9, 30),
        end: new Date(2026, 10, 1, 11),
        resourceId: "room",
      },
      [event]
    ).length,
    1
  )
  render(
    <DashboardTemplate
      orders={[]}
      configuration={{
        brand: "Acme",
        account: "Mina",
        active: "custom",
        pages: [{ id: "custom", label: "Custom" }],
        title: "Custom screen",
        renderPage: (id) => <p>Connected page: {id}</p>,
      }}
    />
  )
  assert(screen.getByText("Connected page: custom"))
  assert(screen.getByText("Acme"))
  assert(screen.getByText("Mina"))
  cleanup()
  console.log(
    "✓ recurring exceptions/conflicts and typed template navigation/content adapters"
  )
}
