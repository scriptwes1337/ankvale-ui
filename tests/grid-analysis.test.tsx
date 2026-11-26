import assert from "node:assert/strict"
import { useState } from "react"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import {
  compileComputedColumns,
  calculateFormula,
  parseDelimitedRows,
  serializeDelimitedRows,
} from "../packages/ui/src/lib/grid-analysis"
import {
  SpreadsheetGrid,
  EditableGrid,
  type EditableGridColumn,
  type GridBatchChange,
} from "../packages/ui/src/components/editable-grid"
import { DataAnalysis } from "../packages/ui/src/components/data-analysis"
type Row = { id: string; name: string; quantity: number }
const initial: Row[] = [
  { id: "a", name: "Alpha", quantity: 1 },
  { id: "b", name: "Beta", quantity: 2 },
]
const columns: EditableGridColumn<Row>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    editable: true,
    validate: (value) =>
      String(value).trim() ? undefined : "Name is required",
  },
  {
    id: "quantity",
    header: "Quantity",
    accessorKey: "quantity",
    editable: true,
    parse: (value) => {
      const number = Number(value)
      if (!Number.isFinite(number)) throw new Error("Quantity must be numeric")
      return number
    },
    validate: (value) =>
      Number(value) >= 0 ? undefined : "Quantity cannot be negative",
  },
]
function Harness({
  commit,
  integrated = false,
}: {
  commit?: (changes: GridBatchChange<Row>[]) => Promise<Row[] | void>
  integrated?: boolean
}) {
  const [data, setData] = useState(initial)
  return (
    <>
      <output aria-label="Stored rows">{JSON.stringify(data)}</output>
      {integrated ? (
        <EditableGrid
          spreadsheet
          label="Inventory"
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          onDataChange={setData}
          onBatchCommit={commit}
        />
      ) : (
        <SpreadsheetGrid
          label="Inventory"
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          onDataChange={setData}
          onBatchCommit={commit}
        />
      )}
    </>
  )
}
function cell(row: number, column: number) {
  return screen
    .getByRole("grid")
    .querySelector<HTMLElement>(`[data-cell="${row}:${column}"]`)!
}
function paste(text: string) {
  fireEvent.paste(screen.getByRole("grid"), {
    clipboardData: { getData: () => text },
  })
}
export async function run() {
  const text = serializeDelimitedRows([
    ["one\ttwo", 'say "yes"', "line\nbreak", ""],
    ["a", "b", "c", "d"],
  ])
  assert.deepEqual(parseDelimitedRows(text, "\t"), [
    ["one\ttwo", 'say "yes"', "line\nbreak", ""],
    ["a", "b", "c", "d"],
  ])
  assert.throws(() => parseDelimitedRows('"broken', "\t"), /Unclosed/)
  assert.equal(calculateFormula("--price + 3 * (2 - -1)", { price: 4 }), 13)
  for (const expression of [
    "1(2)",
    "1 2",
    "price.constructor",
    "Math.random()",
    "1+",
    "()",
    "1/0",
  ])
    assert.throws(() => calculateFormula(expression, { price: 1 }))
  assert.throws(
    () => calculateFormula("(".repeat(200) + "1" + ")".repeat(200), {}),
    /nesting/
  )
  assert.throws(() => calculateFormula("9".repeat(400), {}), /Non-finite/)
  const graph = compileComputedColumns(
    [
      { id: "total", expression: "subtotal - discount" },
      { id: "subtotal", expression: "price * count" },
      { id: "discount", expression: "subtotal * rate" },
    ],
    ["price", "count", "rate"]
  )
  assert.deepEqual(graph.order, ["subtotal", "discount", "total"])
  assert.equal(graph.evaluate({ price: 20, count: 3, rate: 0.1 }).total, 54)
  assert.equal(graph.evaluate({ price: 10, count: 2, rate: 0.5 }).total, 10)
  assert.throws(
    () => graph.evaluate({ price: 1, count: 2, rate: Infinity }),
    /numeric field/
  )
  assert.throws(
    () =>
      compileComputedColumns(
        [
          { id: "a", expression: "b" },
          { id: "b", expression: "a" },
        ],
        []
      ),
    /cycle/
  )
  assert.throws(
    () => compileComputedColumns([{ id: "a", expression: "unknown + 2" }], []),
    /Unknown/
  )
  assert.throws(
    () => compileComputedColumns([{ id: "a", expression: "2" }], ["a"]),
    /Duplicate/
  )
  assert.throws(
    () =>
      compileComputedColumns(
        [
          { id: "a", expression: "2" },
          { id: "a", expression: "3" },
        ],
        []
      ),
    /Duplicate/
  )
  assert.throws(
    () =>
      compileComputedColumns(
        [{ id: "x", expression: "value / 0" }],
        ["value"]
      ).evaluate({ value: 3 }),
    /zero/
  )
  console.log(
    "✓ quoted TSV and safe computed DAG ordering/cycles/references/arithmetic"
  )
  render(<Harness />)
  fireEvent.click(cell(0, 0))
  fireEvent.keyDown(cell(0, 0), { key: "ArrowRight", shiftKey: true })
  fireEvent.keyDown(cell(0, 1), { key: "ArrowDown", shiftKey: true })
  assert.equal(screen.getAllByRole("gridcell", { selected: true }).length, 4)
  let copied = ""
  fireEvent.copy(screen.getByRole("grid"), {
    clipboardData: {
      setData: (_type: string, value: string) => {
        copied = value
      },
    },
  })
  assert.equal(copied, "Alpha\t1\r\nBeta\t2")
  paste('"A\tB"\t3\r\n"C\nD"\t4')
  assert.equal(
    screen.getByLabelText("Stored rows").textContent,
    JSON.stringify(initial)
  )
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() =>
    assert.equal(
      screen.getByLabelText("Stored rows").textContent,
      JSON.stringify([
        { id: "a", name: "A\tB", quantity: 3 },
        { id: "b", name: "C\nD", quantity: 4 },
      ])
    )
  )
  cleanup()
  let calls = 0
  render(
    <Harness
      commit={async () => {
        calls++
        if (calls === 1) throw new Error("Server rejected batch")
      }}
    />
  )
  paste("New\t-2")
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  assert.equal(calls, 0)
  assert(screen.getByText("Quantity cannot be negative"))
  fireEvent.click(cell(0, 0))
  paste("New\t5")
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await screen.findByText("Server rejected batch")
  assert.equal(cell(0, 0).textContent, "New")
  assert.equal(
    screen.getByLabelText("Stored rows").textContent,
    JSON.stringify(initial)
  )
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => assert.equal(calls, 2))
  await waitFor(() =>
    assert(
      screen.getByLabelText("Stored rows").textContent?.includes('"quantity":5')
    )
  )
  paste("Too\tmany\tcolumns")
  assert(screen.getByText("Paste exceeds the available rows or columns."))
  fireEvent.click(cell(0, 0))
  paste("Oops\tnot-a-number")
  assert(screen.getByText("Quantity must be numeric"))
  assert.equal(cell(0, 0).textContent, "New")
  cleanup()
  render(<Harness integrated />)
  fireEvent.keyDown(cell(0, 0), { key: "Enter" })
  fireEvent.change(screen.getByLabelText("Edit Name row 1"), {
    target: { value: "Keyboard" },
  })
  fireEvent.keyDown(screen.getByLabelText("Edit Name row 1"), { key: "Enter" })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() =>
    assert(
      screen.getByLabelText("Stored rows").textContent?.includes("Keyboard")
    )
  )
  cleanup()
  render(
    <DataAnalysis
      label="Revenue"
      data={[{ team: "A", month: "Jan", price: 4, count: 3 }]}
      groupKey="team"
      columnKey="month"
      valueKey="total"
      computedColumns={[{ id: "total", expression: "price * count" }]}
    />
  )
  assert(screen.getAllByText("12").length > 0)
  cleanup()
  console.log(
    "✓ rectangle keyboard/copy/paste, validation/parse rejection, draft retry, integrated cell edit and computed analysis"
  )
}
