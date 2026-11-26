import assert from "node:assert/strict"
import { useState } from "react"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react"
import { QueryBuilder } from "../packages/ui/src/components/query-builder"
import {
  compileQuery,
  validateQuery,
  resolveQueryLimits,
  QueryValidationError,
  type QueryField,
  type QueryGroup,
  type QueryRule,
} from "../packages/ui/src/lib/query"
import {
  ServerDataGrid,
  type GridExportRequest,
  type GridQuery,
} from "../packages/ui/src/components/server-data-grid"
import { QueryPreview } from "../apps/web/components/query-previews"
import names from "../apps/web/lib/query-preview-names.json"
type Row = {
  id: string
  name: string
  amount: number
  active: boolean
  date: string
  plan: string
}
const rows: Row[] = [
  {
    id: "a",
    name: "ALPHA",
    amount: 20,
    active: true,
    date: "2024-02-29",
    plan: "team",
  },
  {
    id: "b",
    name: "Beta",
    amount: 5,
    active: false,
    date: "2025-03-01",
    plan: "starter",
  },
]
const fields: QueryField<Row>[] = [
  { id: "name", label: "Name", type: "text" },
  { id: "amount", label: "Amount", type: "number" },
  { id: "active", label: "Active", type: "boolean" },
  { id: "date", label: "Date", type: "date" },
  {
    id: "plan",
    label: "Plan",
    type: "enum",
    options: [
      { value: "team", label: "Team" },
      { value: "starter", label: "Starter" },
    ],
  },
]
const empty: QueryGroup = {
  type: "group",
  id: "root",
  conjunction: "and",
  children: [],
}
function query(rule: QueryRule): QueryGroup {
  return { ...empty, children: [rule] }
}
function Harness() {
  const [value, setValue] = useState(empty)
  let matches = 0
  try {
    matches = rows.filter(compileQuery(value, fields)).length
  } catch {
    /* validation is shown by editor */
  }
  return (
    <>
      <QueryBuilder fields={fields} value={value} onChange={setValue} />
      <output aria-label="Matches">{matches}</output>
      <output aria-label="Query">{JSON.stringify(value)}</output>
    </>
  )
}
export async function run() {
  for (const name of names)
    assert(
      renderToString(<QueryPreview name={name} />).includes(
        'data-slot="query-builder"'
      )
    )
  const nested: QueryGroup = {
    ...empty,
    children: [
      {
        type: "rule",
        id: "active",
        field: "active",
        operator: "eq",
        value: true,
      },
      {
        type: "group",
        id: "nested",
        conjunction: "or",
        children: [
          {
            type: "rule",
            id: "amount",
            field: "amount",
            operator: "between",
            value: [10, 30],
          },
          {
            type: "rule",
            id: "plan",
            field: "plan",
            operator: "eq",
            value: "starter",
          },
        ],
      },
    ],
  }
  assert.deepEqual(
    rows.filter(compileQuery(nested, fields)).map((row) => row.id),
    ["a"]
  )
  assert.equal(compileQuery(empty, fields)(rows[0]!), true)
  assert.equal(
    compileQuery(
      query({
        type: "rule",
        id: "r",
        field: "name",
        operator: "contains",
        value: "alpha",
        caseSensitive: false,
      }),
      fields
    )(rows[0]!),
    true
  )
  assert.equal(
    compileQuery(
      query({
        type: "rule",
        id: "r",
        field: "name",
        operator: "contains",
        value: "alpha",
      }),
      fields
    )(rows[0]!),
    false
  )
  assert.equal(
    compileQuery(
      query({
        type: "rule",
        id: "r",
        field: "date",
        operator: "lt",
        value: "2025-01-01",
      }),
      fields
    )(rows[0]!),
    true
  )
  assert.equal(
    compileQuery(
      query({
        type: "rule",
        id: "r",
        field: "amount",
        operator: "neq",
        value: 20,
      }),
      fields
    )({ ...rows[0]!, amount: "20" } as unknown as Row),
    false
  )
  assert.equal(
    compileQuery(
      query({ type: "rule", id: "r", field: "name", operator: "isEmpty" }),
      fields
    )({ ...rows[0]!, name: "" }),
    true
  )
  assert.equal(
    compileQuery(
      query({
        type: "rule",
        id: "r",
        field: "name",
        operator: "neq",
        value: "Alpha",
      }),
      fields
    )({ ...rows[0]!, name: "" }),
    false
  )
  for (const rule of [
    {
      type: "rule",
      id: "r",
      field: "amount",
      operator: "contains",
      value: "1",
    },
    {
      type: "rule",
      id: "r",
      field: "date",
      operator: "eq",
      value: "2025-02-29",
    },
    { type: "rule", id: "r", field: "amount", operator: "eq", value: "2" },
    { type: "rule", id: "r", field: "plan", operator: "eq", value: "unknown" },
    {
      type: "rule",
      id: "r",
      field: "amount",
      operator: "between",
      value: [20, 10],
    },
    { type: "rule", id: "r", field: "name", operator: "in", value: [] },
    { type: "rule", id: "r", field: "unknown", operator: "eq", value: true },
    {
      type: "rule",
      id: "r",
      field: "name",
      operator: "eval",
      value: "alert(1)",
    },
  ])
    assert.throws(
      () => compileQuery(query(rule as QueryRule), fields),
      QueryValidationError
    )
  assert(
    validateQuery(
      { ...empty, children: [null] } as unknown as QueryGroup,
      fields
    ).some((issue) => issue.code === "structure")
  )
  assert(
    validateQuery(nested, fields, { maxDepth: 1 }).some(
      (issue) => issue.code === "limit"
    )
  )
  assert(
    validateQuery(nested, fields, { maxNodes: 2 }).some(
      (issue) => issue.code === "limit"
    )
  )
  assert(
    validateQuery({ ...empty, children: [{ ...empty }] }, fields).some(
      (issue) => issue.code === "structure"
    )
  )
  assert.deepEqual(resolveQueryLimits({ maxDepth: NaN, maxNodes: Infinity }), {
    maxDepth: 6,
    maxNodes: 200,
  })
  const snapshot = query({
    type: "rule",
    id: "r",
    field: "plan",
    operator: "in",
    value: ["team"],
  })
  const test = compileQuery(snapshot, fields)
  ;(snapshot.children[0] as QueryRule & { value: string[] }).value.push(
    "starter"
  )
  assert.equal(test(rows[1]!), false)
  const inherited = Object.create({ name: "ALPHA" }) as Row
  assert.equal(
    compileQuery(
      query({
        type: "rule",
        id: "r",
        field: "name",
        operator: "eq",
        value: "ALPHA",
      }),
      fields
    )(inherited),
    false
  )
  console.log(
    "✓ nested typed predicates, null/missing semantics, calendar dates, snapshot literals and structural bounds"
  )
  render(<Harness />)
  fireEvent.click(screen.getByRole("button", { name: "Add condition" }))
  fireEvent.change(screen.getByLabelText("Condition field"), {
    target: { value: "amount" },
  })
  fireEvent.change(screen.getByLabelText("Amount operator"), {
    target: { value: "between" },
  })
  fireEvent.change(screen.getByLabelText("Amount value start"), {
    target: { value: "10" },
  })
  fireEvent.change(screen.getByLabelText("Amount value end"), {
    target: { value: "30" },
  })
  assert.equal(screen.getByLabelText("Matches").textContent, "1")
  assert(
    screen.getByLabelText("Query").textContent?.includes('"value":[10,30]')
  )
  fireEvent.click(screen.getByRole("button", { name: "Add group" }))
  const group = screen.getByRole("group", { name: "Condition group" })
  assert(screen.getByRole("alert"))
  fireEvent.click(within(group).getByRole("button", { name: "Add condition" }))
  fireEvent.change(within(group).getByLabelText("Condition field"), {
    target: { value: "active" },
  })
  fireEvent.change(screen.getByLabelText("Active value"), {
    target: { value: "false" },
  })
  assert.equal(screen.getByLabelText("Matches").textContent, "0")
  fireEvent.change(screen.getByLabelText("Root conjunction"), {
    target: { value: "or" },
  })
  assert.equal(screen.getByLabelText("Matches").textContent, "2")
  fireEvent.click(
    screen.getByRole("button", { name: "Remove condition group" })
  )
  assert.equal(screen.getByLabelText("Matches").textContent, "1")
  cleanup()
  render(
    <QueryBuilder
      fields={fields}
      value={query({
        type: "rule",
        id: "r",
        field: "name",
        operator: "eq",
        value: "x",
      })}
      onChange={() => {}}
      limits={{ maxNodes: 2 }}
    />
  )
  assert.equal(
    screen
      .getByRole("button", { name: "Add condition" })
      .hasAttribute("disabled"),
    true
  )
  cleanup()
  render(
    <QueryBuilder
      fields={fields}
      value={{ ...empty, children: [null] } as unknown as QueryGroup}
      onChange={() => {}}
    />
  )
  assert(screen.getByRole("button", { name: "Reset invalid query" }))
  cleanup()
  let exported: GridExportRequest | undefined, printed: GridQuery | undefined
  const source = async () => ({ rows, rowCount: rows.length })
  render(
    <ServerDataGrid
      source={source}
      filterTree={nested}
      columns={[{ id: "name", header: "Name", accessorKey: "name" }]}
      getRowId={(row) => row.id}
      label="Contacts"
      onExport={async (request) => {
        exported = request
        if (request.format === "pdf") throw new Error("PDF service unavailable")
      }}
      onPrint={(query) => {
        printed = query
      }}
    />
  )
  await waitFor(() => assert(screen.getByText("ALPHA")))
  fireEvent.click(screen.getByRole("button", { name: "Export XLSX" }))
  await waitFor(() => assert.equal(exported?.format, "xlsx"))
  assert.deepEqual(exported?.query.filterTree, nested)
  await waitFor(() =>
    assert.equal(
      screen.getByRole("button", { name: "Print" }).hasAttribute("disabled"),
      false
    )
  )
  fireEvent.click(screen.getByRole("button", { name: "Print" }))
  await waitFor(() => assert.equal(printed?.pagination.pageSize, 20))
  await waitFor(() =>
    assert.equal(
      screen
        .getByRole("button", { name: "Export PDF" })
        .hasAttribute("disabled"),
      false
    )
  )
  fireEvent.click(screen.getByRole("button", { name: "Export PDF" }))
  await screen.findByText("PDF service unavailable")
  cleanup()
  console.log(
    "✓ controlled recursive editor, bounded additions, invalid input recovery and export/print adapter contracts"
  )
}
