"use client"
import { useState, useRef, useEffect, type ReactNode } from "react"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"
import {
  parseDelimitedRows,
  serializeDelimitedRows,
} from "@ankvale/ui/lib/grid-analysis"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
export type EditableGridColumn<T extends object> = DataGridColumn<T> & {
  editable?: boolean
  parse?: (value: string) => unknown
  validate?: (value: unknown, row: T) => string | undefined
  group?: string
}
export type GridFilter = {
  column: string
  operator: "contains" | "equals" | "gt" | "lt"
  value: string
}
export function filterGridRows<T extends object>(
  rows: T[],
  columns: DataGridColumn<T>[],
  filters: GridFilter[]
) {
  return rows.filter((row) =>
    filters.every((filter) => {
      const column = columns.find((c) => c.id === filter.column)
      if (!column) return true
      const value = column.accessor
        ? column.accessor(row)
        : column.accessorKey
          ? row[column.accessorKey]
          : undefined
      return filter.operator === "contains"
        ? String(value ?? "")
            .toLowerCase()
            .includes(filter.value.toLowerCase())
        : filter.operator === "equals"
          ? String(value ?? "") === filter.value
          : filter.operator === "gt"
            ? Number(value) > Number(filter.value)
            : Number(value) < Number(filter.value)
    })
  )
}
export function exportGridCsv<T extends object>(
  rows: T[],
  columns: DataGridColumn<T>[]
) {
  const quote = (value: unknown) => {
    let text = String(value ?? "")
    if (/^[=+@-]/.test(text)) text = "'" + text
    return '"' + text.replaceAll('"', '""') + '"'
  }
  return [
    columns.map((c) => quote(c.header)).join(","),
    ...rows.map((row) =>
      columns
        .map((c) =>
          quote(
            c.accessor
              ? c.accessor(row)
              : c.accessorKey
                ? row[c.accessorKey]
                : ""
          )
        )
        .join(",")
    ),
  ].join("\r\n")
}
export type GridView = {
  id: string
  name: string
  visible: string[]
  order: string[]
  filters: GridFilter[]
}
export type EditableGridProps<T extends object> = {
  data: T[]
  columns: EditableGridColumn<T>[]
  getRowId: (row: T) => string
  label: string
  onDataChange: (rows: T[]) => void
  onCommit?: (row: T, previous: T) => Promise<T | void> | T | void
  spreadsheet?: boolean
  onBatchCommit?: SpreadsheetGridProps<T>["onBatchCommit"]
  renderDetails?: (row: T) => ReactNode
  summary?: ReactNode
  views?: GridView[]
  onViewsChange?: (views: GridView[]) => void
  onExport?: (csv: string) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
}
/** Coordinated row edits, validation, commit/cancel and reversible local snapshots. */
export function EditableGrid<T extends object>({
  data,
  columns,
  getRowId,
  label,
  onDataChange,
  onCommit,
  spreadsheet = false,
  onBatchCommit,
  renderDetails,
  summary,
  views = [],
  onViewsChange,
  onExport,
  loading,
  error,
  onRetry,
}: EditableGridProps<T>) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<T | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [visible, setVisible] = useState(columns.map((c) => c.id))
  const [order, setOrder] = useState(columns.map((c) => c.id))
  const [filters, setFilters] = useState<GridFilter[]>([])
  const [viewName, setViewName] = useState("")
  const [details, setDetails] = useState<T | null>(null)
  const history = useRef<T[][]>([])
  const future = useRef<T[][]>([])
  const [historyCounts, setHistoryCounts] = useState({ past: 0, future: 0 })
  function updateHistoryCounts() {
    setHistoryCounts({
      past: history.current.length,
      future: future.current.length,
    })
  }
  const committing = useRef(false)
  function publish(next: T[]) {
    history.current.push(data)
    future.current = []
    onDataChange(next)
    updateHistoryCounts()
  }
  async function save() {
    if (!draft || !editing || committing.current) return
    const issues: Record<string, string> = {}
    for (const column of columns) {
      const value = column.accessor
        ? column.accessor(draft)
        : column.accessorKey
          ? draft[column.accessorKey]
          : undefined
      const error = column.validate?.(value, draft)
      if (error) issues[column.id] = error
    }
    setErrors(issues)
    if (Object.keys(issues).length) return
    const previous = data.find((row) => getRowId(row) === editing)
    if (!previous) return
    committing.current = true
    setPending(true)
    try {
      const result = await onCommit?.(draft, previous)
      publish(
        data.map((row) => (getRowId(row) === editing ? (result ?? draft) : row))
      )
      setEditing(null)
      setDraft(null)
    } catch {
      setErrors({ root: "Changes could not be saved. Try again." })
    } finally {
      committing.current = false
      setPending(false)
    }
  }
  const ordered = order
    .map((id) => columns.find((c) => c.id === id))
    .filter((c): c is EditableGridColumn<T> => !!c && visible.includes(c.id))
  const groups: { label: string; span: number }[] = []
  for (const column of ordered) {
    const label = column.group ?? ""
    const previous = groups.at(-1)
    if (previous?.label === label) previous.span++
    else groups.push({ label, span: 1 })
  }
  const adapted: DataGridColumn<T>[] = [
    ...ordered.map((column) => ({
      ...column,
      cell: (row: T) => {
        if (
          editing !== getRowId(row) ||
          !draft ||
          !column.editable ||
          !column.accessorKey
        )
          return column.cell
            ? column.cell(row)
            : String(
                column.accessor
                  ? column.accessor(row)
                  : column.accessorKey
                    ? (row[column.accessorKey] ?? "")
                    : ""
              )
        const key = column.accessorKey
        return (
          <div>
            <Input
              aria-label={`Edit ${column.header} for ${editing}`}
              autoFocus={ordered.find((c) => c.editable)?.id === column.id}
              value={String(draft[key] ?? "")}
              disabled={pending}
              aria-invalid={!!errors[column.id]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [key]: column.parse
                    ? column.parse(e.target.value)
                    : e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Escape" && !pending) {
                  setEditing(null)
                  setDraft(null)
                }
                if (e.key === "Enter") {
                  e.preventDefault()
                  void save()
                }
              }}
            />
            {errors[column.id] && (
              <p role="alert" className="text-xs text-destructive">
                {errors[column.id]}
              </p>
            )}
          </div>
        )
      },
    })),
    {
      id: "_actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      width: 180,
      cell: (row) =>
        editing === getRowId(row) ? (
          <div className="flex gap-1">
            <Button size="sm" disabled={pending} onClick={() => void save()}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setEditing(null)
                setDraft(null)
                setErrors({})
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={!!editing}
              onClick={() => {
                setEditing(getRowId(row))
                setDraft({ ...row })
                setErrors({})
              }}
            >
              Edit
            </Button>
            {renderDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setDetails(
                    details && getRowId(details) === getRowId(row) ? null : row
                  )
                }
              >
                Details
              </Button>
            )}
          </div>
        ),
    },
  ]
  return (
    <section data-slot="editable-grid" className="space-y-3" aria-label={label}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!historyCounts.past || pending || !!editing}
          onClick={() => {
            const next = history.current.pop()
            if (next) {
              future.current.push(data)
              onDataChange(next)
              updateHistoryCounts()
            }
          }}
        >
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!historyCounts.future || pending || !!editing}
          onClick={() => {
            const next = future.current.pop()
            if (next) {
              history.current.push(data)
              onDataChange(next)
              updateHistoryCounts()
            }
          }}
        >
          Redo
        </Button>
        {onExport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onExport(
                exportGridCsv(filterGridRows(data, columns, filters), ordered)
              )
            }
          >
            Export CSV
          </Button>
        )}
        <details className="relative">
          <summary className="cursor-pointer rounded border px-3 py-1 text-sm">
            Arrange columns
          </summary>
          <div className="absolute z-30 min-w-64 space-y-2 rounded border bg-popover p-3 shadow-sm">
            {order.map((key, i) => {
              const column = columns.find((c) => c.id === key)
              if (!column) return null
              return (
                <div key={key} className="flex items-center gap-2">
                  <label className="flex flex-1 gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={visible.includes(key)}
                      onChange={(e) =>
                        setVisible(
                          e.target.checked
                            ? [...visible, key]
                            : visible.filter((v) => v !== key)
                        )
                      }
                    />
                    {column.header}
                  </label>
                  <button
                    type="button"
                    aria-label={`Move ${column.header} earlier`}
                    disabled={i === 0}
                    onClick={() =>
                      setOrder((previous) => {
                        const next = [...previous]
                        ;[next[i - 1], next[i]] = [next[i]!, next[i - 1]!]
                        return next
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${column.header} later`}
                    disabled={i === order.length - 1}
                    onClick={() =>
                      setOrder((previous) => {
                        const next = [...previous]
                        ;[next[i], next[i + 1]] = [next[i + 1]!, next[i]!]
                        return next
                      })
                    }
                  >
                    ↓
                  </button>
                </div>
              )
            })}
          </div>
        </details>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            setFilters([
              ...filters,
              { column: columns[0]?.id ?? "", operator: "contains", value: "" },
            ])
          }
        >
          Add filter
        </Button>
        {views.length > 0 && (
          <select
            aria-label="Saved grid view"
            className="rounded border bg-card px-2 py-1 text-sm"
            defaultValue=""
            onChange={(e) => {
              const view = views.find((v) => v.id === e.target.value)
              if (view) {
                setVisible(view.visible)
                setOrder(view.order)
                setFilters(view.filters)
              }
            }}
          >
            <option value="">Choose view</option>
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </select>
        )}
        {onViewsChange && (
          <>
            <Input
              aria-label="View name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="w-32"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!viewName.trim()}
              onClick={() => {
                onViewsChange([
                  ...views,
                  {
                    id: crypto.randomUUID(),
                    name: viewName.trim(),
                    visible,
                    order,
                    filters,
                  },
                ])
                setViewName("")
              }}
            >
              Save view
            </Button>
          </>
        )}
      </div>
      {filters.map((filter, index) => (
        <div key={index} className="flex flex-wrap gap-2">
          <select
            aria-label={`Filter ${index + 1} column`}
            value={filter.column}
            className="rounded border bg-card px-2 text-sm"
            onChange={(e) =>
              setFilters(
                filters.map((item, i) =>
                  i === index ? { ...item, column: e.target.value } : item
                )
              )
            }
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.header}
              </option>
            ))}
          </select>
          <select
            aria-label={`Filter ${index + 1} operator`}
            value={filter.operator}
            className="rounded border bg-card px-2 text-sm"
            onChange={(e) =>
              setFilters(
                filters.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        operator: e.target.value as GridFilter["operator"],
                      }
                    : item
                )
              )
            }
          >
            {["contains", "equals", "gt", "lt"].map((op) => (
              <option key={op}>{op}</option>
            ))}
          </select>
          <Input
            aria-label={`Filter ${index + 1} value`}
            value={filter.value}
            className="w-40"
            onChange={(e) =>
              setFilters(
                filters.map((item, i) =>
                  i === index ? { ...item, value: e.target.value } : item
                )
              )
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters(filters.filter((_, i) => i !== index))}
          >
            Remove filter
          </Button>
        </div>
      ))}
      {errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {errors.root}
        </p>
      )}
      {spreadsheet ? (
        <SpreadsheetGrid
          data={filterGridRows(data, columns, filters)}
          columns={ordered}
          getRowId={getRowId}
          label={label}
          onDataChange={(next) =>
            publish(
              data.map(
                (row) =>
                  next.find((item) => getRowId(item) === getRowId(row)) ?? row
              )
            )
          }
          onBatchCommit={
            onBatchCommit ??
            (onCommit
              ? async () => {
                  throw new Error(
                    "Supply onBatchCommit to persist spreadsheet changes atomically."
                  )
                }
              : undefined)
          }
        />
      ) : (
        <DataGrid
          showColumnMenu={false}
          headerRow={
            ordered.some((column) => column.group) ? (
              <tr>
                {groups.map((group, index) => (
                  <th
                    key={`${group.label}-${index}`}
                    scope="colgroup"
                    colSpan={group.span}
                    className="border-b px-3 py-2 text-start text-xs text-muted-foreground"
                  >
                    {group.label}
                  </th>
                ))}
                <th />
              </tr>
            ) : undefined
          }
          data={filterGridRows(data, columns, filters)}
          columns={adapted}
          getRowId={getRowId}
          label={label}
          loading={loading}
          error={error}
          onRetry={onRetry}
          footer={summary}
        />
      )}
      {details && renderDetails && (
        <aside className="rounded-lg border p-4" aria-label="Record details">
          {renderDetails(details)}
          <Button variant="ghost" onClick={() => setDetails(null)}>
            Close details
          </Button>
        </aside>
      )}
    </section>
  )
}

export type GridCellAddress = { row: number; column: number }
export type GridRectangle = { anchor: GridCellAddress; focus: GridCellAddress }
export type GridBatchChange<T> = { previous: T; row: T }
export type SpreadsheetGridProps<T extends object> = {
  data: T[]
  columns: EditableGridColumn<T>[]
  getRowId: (row: T) => string
  label: string
  onDataChange: (rows: T[]) => void
  /** Persist the complete validated batch atomically; reject to retain the draft. */
  onBatchCommit?: (
    changes: GridBatchChange<T>[]
  ) => Promise<T[] | void> | T[] | void
}
/** A bounded cell matrix. Clipboard events use the browser's native permission model. */
export function SpreadsheetGrid<T extends object>({
  data,
  columns,
  getRowId,
  label,
  onDataChange,
  onBatchCommit,
}: SpreadsheetGridProps<T>) {
  const root = useRef<HTMLTableElement>(null)
  const [rawSelection, setSelection] = useState<GridRectangle>({
    anchor: { row: 0, column: 0 },
    focus: { row: 0, column: 0 },
  })
  const [staged, setStaged] = useState<GridBatchChange<T>[]>([])
  const [issues, setIssues] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [editingCell, setEditingCell] = useState<GridCellAddress | null>(null)
  const [text, setText] = useState("")
  const committingBatch = useRef(false)
  const latest = useRef({ data, onDataChange })
  useEffect(() => {
    latest.current = { data, onDataChange }
  }, [data, onDataChange])
  const rows = data.map(
    (row) =>
      staged.find((change) => getRowId(change.row) === getRowId(row))?.row ??
      row
  )
  function clamp(address: GridCellAddress): GridCellAddress {
    return {
      row: Math.max(0, Math.min(rows.length - 1, address.row)),
      column: Math.max(0, Math.min(columns.length - 1, address.column)),
    }
  }
  const selection = {
    anchor: clamp(rawSelection.anchor),
    focus: clamp(rawSelection.focus),
  }
  const bounds = {
    top: Math.min(selection.anchor.row, selection.focus.row),
    bottom: Math.max(selection.anchor.row, selection.focus.row),
    left: Math.min(selection.anchor.column, selection.focus.column),
    right: Math.max(selection.anchor.column, selection.focus.column),
  }
  function read(row: T, column: EditableGridColumn<T>) {
    return column.accessor
      ? column.accessor(row)
      : column.accessorKey
        ? row[column.accessorKey]
        : ""
  }
  function focusCell(address: GridCellAddress, extend = false) {
    const next = {
      row: Math.max(0, Math.min(rows.length - 1, address.row)),
      column: Math.max(0, Math.min(columns.length - 1, address.column)),
    }
    setSelection((current) => ({
      anchor: extend ? clamp(current.anchor) : next,
      focus: next,
    }))
    root.current
      ?.querySelector<HTMLElement>(`[data-cell="${next.row}:${next.column}"]`)
      ?.focus()
  }
  function stage(matrix: string[][], start = selection.focus) {
    if (busy || !matrix.length) return false
    if (
      start.row + matrix.length > rows.length ||
      matrix.some((row) => start.column + row.length > columns.length)
    ) {
      setIssues({ root: "Paste exceeds the available rows or columns." })
      return false
    }
    const changes = new Map(
      staged.map((change) => [getRowId(change.row), change])
    )
    try {
      for (let r = 0; r < matrix.length; r++) {
        const previous = data[start.row + r]!
        let row = { ...rows[start.row + r]! }
        for (let c = 0; c < matrix[r]!.length; c++) {
          const column = columns[start.column + c]!
          if (!column.editable || !column.accessorKey)
            throw new Error(`${column.header} is read-only.`)
          row = {
            ...row,
            [column.accessorKey]: column.parse
              ? column.parse(matrix[r]![c]!)
              : matrix[r]![c],
          }
        }
        if (getRowId(row) !== getRowId(previous))
          throw new Error(
            "A row identifier cannot be changed by a clipboard edit."
          )
        changes.set(getRowId(previous), {
          previous: changes.get(getRowId(previous))?.previous ?? previous,
          row,
        })
      }
    } catch (error) {
      setIssues({
        root:
          error instanceof Error
            ? error.message
            : "Could not parse the pasted values.",
      })
      return false
    }
    const next = [...changes.values()]
    setStaged(next)
    setIssues(validate(next))
    setSelection({
      anchor: start,
      focus: {
        row: start.row + matrix.length - 1,
        column: start.column + Math.max(...matrix.map((row) => row.length)) - 1,
      },
    })
    return true
  }
  function validate(changes: GridBatchChange<T>[]) {
    const errors: Record<string, string> = {}
    for (const { row } of changes)
      for (const column of columns) {
        const error = column.validate?.(read(row, column), row)
        if (error) errors[`${getRowId(row)}:${column.id}`] = error
      }
    return errors
  }
  async function saveBatch() {
    if (!staged.length || committingBatch.current) return
    const errors = validate(staged)
    for (const change of staged) {
      const current = data.find(
        (row) => getRowId(row) === getRowId(change.previous)
      )
      if (
        !current ||
        Object.keys(change.previous).some(
          (key) =>
            !Object.is(current[key as keyof T], change.previous[key as keyof T])
        )
      )
        errors.root =
          "Records changed outside this draft. Discard and paste again."
    }
    setIssues(errors)
    if (Object.keys(errors).length) return
    committingBatch.current = true
    setBusy(true)
    try {
      const result = await onBatchCommit?.(staged)
      const saved = result ?? staged.map((change) => change.row)
      const expected = new Set(staged.map((change) => getRowId(change.row)))
      if (
        saved.length !== expected.size ||
        new Set(saved.map(getRowId)).size !== expected.size ||
        saved.some((row) => !expected.has(getRowId(row)))
      )
        throw new Error(
          "The saved batch must return exactly the edited row identifiers."
        )
      latest.current.onDataChange(
        latest.current.data.map(
          (row) => saved.find((next) => getRowId(next) === getRowId(row)) ?? row
        )
      )
      setStaged([])
      setIssues({})
    } catch (error) {
      setIssues({
        root:
          error instanceof Error
            ? error.message
            : "Changes could not be saved. Try again.",
      })
    } finally {
      committingBatch.current = false
      setBusy(false)
    }
  }
  return (
    <section
      data-slot="spreadsheet-grid"
      aria-label={label}
      className="space-y-3"
    >
      <p className="text-xs text-muted-foreground">
        Select cells with Shift + arrows or Shift + click. Copy and paste with
        your keyboard. Paste creates a draft; save to apply it.
      </p>
      <div className="overflow-auto rounded border">
        <table
          ref={root}
          role="grid"
          aria-label={label}
          aria-multiselectable="true"
          aria-busy={busy}
          className="w-full border-collapse text-sm"
          onCopy={(event) => {
            if (event.target instanceof HTMLInputElement) return
            event.preventDefault()
            event.clipboardData.setData(
              "text/plain",
              serializeDelimitedRows(
                rows
                  .slice(bounds.top, bounds.bottom + 1)
                  .map((row) =>
                    columns
                      .slice(bounds.left, bounds.right + 1)
                      .map((column) => read(row, column))
                  )
              )
            )
          }}
          onPaste={(event) => {
            if (event.target instanceof HTMLInputElement) return
            event.preventDefault()
            try {
              stage(
                parseDelimitedRows(
                  event.clipboardData.getData("text/plain"),
                  "\t"
                ),
                { row: bounds.top, column: bounds.left }
              )
            } catch (error) {
              setIssues({
                root:
                  error instanceof Error
                    ? error.message
                    : "Invalid clipboard text.",
              })
            }
          }}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="border-b px-3 py-2 text-start font-medium"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={getRowId(row)}>
                {columns.map((column, c) => {
                  const address = { row: r, column: c },
                    cellIssue = issues[`${getRowId(row)}:${column.id}`]
                  const active =
                    selection.focus.row === r && selection.focus.column === c
                  return (
                    <td
                      key={column.id}
                      role="gridcell"
                      data-cell={`${r}:${c}`}
                      tabIndex={active ? 0 : -1}
                      aria-selected={
                        r >= bounds.top &&
                        r <= bounds.bottom &&
                        c >= bounds.left &&
                        c <= bounds.right
                      }
                      aria-readonly={!column.editable || !column.accessorKey}
                      aria-invalid={!!cellIssue || undefined}
                      className="border px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset aria-selected:bg-primary/10"
                      onClick={(event) => {
                        if (!(event.target instanceof HTMLInputElement))
                          focusCell(address, event.shiftKey)
                      }}
                      onDoubleClick={() => {
                        if (!busy && column.editable && column.accessorKey) {
                          setEditingCell(address)
                          setText(String(read(row, column) ?? ""))
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.target instanceof HTMLInputElement || busy)
                          return
                        if (
                          (event.ctrlKey || event.metaKey) &&
                          event.key.toLowerCase() === "a"
                        ) {
                          event.preventDefault()
                          setSelection({
                            anchor: { row: 0, column: 0 },
                            focus: {
                              row: rows.length - 1,
                              column: columns.length - 1,
                            },
                          })
                          return
                        }
                        const delta: Record<string, [number, number]> = {
                          ArrowUp: [-1, 0],
                          ArrowDown: [1, 0],
                          ArrowLeft: [0, -1],
                          ArrowRight: [0, 1],
                        }
                        if (delta[event.key]) {
                          event.preventDefault()
                          const [dr, dc] = delta[event.key]!
                          focusCell(
                            { row: r + dr, column: c + dc },
                            event.shiftKey
                          )
                        }
                        if (
                          (event.key === "Enter" || event.key === "F2") &&
                          column.editable &&
                          column.accessorKey
                        ) {
                          event.preventDefault()
                          setEditingCell(address)
                          setText(String(read(row, column) ?? ""))
                        }
                        if (event.key === "Escape")
                          setSelection({ anchor: address, focus: address })
                      }}
                    >
                      {editingCell?.row === r && editingCell.column === c ? (
                        <Input
                          autoFocus
                          aria-label={`Edit ${column.header} row ${r + 1}`}
                          value={text}
                          onChange={(event) => setText(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault()
                              if (stage([[text]], address)) {
                                setEditingCell(null)
                                focusCell(address)
                              }
                            } else if (event.key === "Escape") {
                              setEditingCell(null)
                              focusCell(address)
                            }
                          }}
                        />
                      ) : (
                        String(read(row, column) ?? "")
                      )}
                      {cellIssue && (
                        <p role="alert" className="text-xs text-destructive">
                          {cellIssue}
                        </p>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {issues.root && (
        <p role="alert" className="text-sm text-destructive">
          {issues.root}
        </p>
      )}
      {staged.length > 0 && (
        <div className="flex gap-2">
          <Button
            disabled={busy || !!editingCell}
            onClick={() => void saveBatch()}
          >
            {busy ? "Saving…" : "Save changes"}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              setStaged([])
              setIssues({})
              setEditingCell(null)
            }}
          >
            Discard changes
          </Button>
          <span
            role="status"
            className="self-center text-xs text-muted-foreground"
          >
            {staged.length} changed rows
          </span>
        </div>
      )}
      {!rows.length && (
        <p className="text-sm text-muted-foreground">No rows.</p>
      )}
    </section>
  )
}
