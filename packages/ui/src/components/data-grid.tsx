"use client"
import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react"
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnPinningFeature,
  rowExpandingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  createExpandedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  type ColumnDef,
  type Column,
  type Row,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type OnChangeFn,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  CaretDownIcon,
  CaretRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsDownUpIcon,
  DotsSixVerticalIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { cn } from "@ankvale/ui/lib/utils"
const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnPinningFeature,
  rowExpandingFeature,
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})
export type DataGridColumn<T extends object> = {
  id: string
  header: string
  accessorKey?: keyof T
  accessor?: (row: T) => unknown
  cell?: (row: T) => ReactNode
  colSpan?: (row: T) => number
  rowSpan?: (row: T) => number
  sortable?: boolean
  filterable?: boolean
  width?: number
  minWidth?: number
  pinned?: "start" | "end"
}
export type DataGridProps<T extends object> = {
  data: T[]
  columns: DataGridColumn<T>[]
  getRowId: (row: T) => string
  getChildren?: (row: T) => T[] | undefined
  label: string
  className?: string
  searchable?: boolean
  columnFilters?: boolean
  selectable?: boolean
  pageSize?: number
  loading?: boolean
  error?: string
  onRetry?: () => void
  emptyMessage?: string
  virtualized?: boolean
  height?: number
  onReorder?: (rows: T[]) => void
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  selection?: RowSelectionState
  onSelectionChange?: OnChangeFn<RowSelectionState>
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  rowCount?: number
  search?: string
  onSearchChange?: OnChangeFn<string>
  footer?: ReactNode
  headerRow?: ReactNode
  showColumnMenu?: boolean
}
export function DataGrid<T extends object>({
  data,
  columns,
  getRowId,
  getChildren,
  label,
  className,
  searchable = true,
  columnFilters = false,
  selectable = false,
  pageSize = 10,
  loading = false,
  error,
  onRetry,
  emptyMessage = "No results.",
  virtualized = false,
  height = 360,
  onReorder,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  selection,
  onSelectionChange,
  manualPagination,
  manualSorting,
  manualFiltering,
  rowCount,
  search,
  onSearchChange,
  footer,
  headerRow,
  showColumnMenu = true,
}: DataGridProps<T>) {
  const defs = useMemo<ColumnDef<typeof features, T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.header,
        accessorFn: (row) =>
          column.accessor?.(row) ??
          (column.accessorKey ? row[column.accessorKey] : undefined),
        cell: (context) =>
          column.cell
            ? column.cell(context.row.original)
            : String(context.getValue() ?? ""),
        enableSorting: column.sortable !== false,
        enableColumnFilter: column.filterable !== false,
        filterFn: "includesString",
        sortFn: "alphanumeric",
        size: column.width ?? 180,
        minSize: column.minWidth ?? 80,
      })),
    [columns]
  )
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    { pageIndex: 0, pageSize }
  )
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>(
    {}
  )
  const [internalSearch, setInternalSearch] = useState("")
  const table = useTable({
    features,
    data,
    columns: defs,
    getRowId,
    getSubRows: getChildren,
    enableRowSelection: selectable,
    columnResizeMode: "onChange",
    globalFilterFn: "includesString",
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount,
    initialState: {
      pagination: { pageIndex: 0, pageSize },
      columnPinning: {
        start: columns.filter((c) => c.pinned === "start").map((c) => c.id),
        end: columns.filter((c) => c.pinned === "end").map((c) => c.id),
      },
    },
    state: {
      sorting: sorting ?? internalSorting,
      pagination: pagination ?? internalPagination,
      rowSelection: selection ?? internalSelection,
      globalFilter: search ?? internalSearch,
    },
    onSortingChange: (updater) => {
      setInternalSorting(updater)
      onSortingChange?.(updater)
    },
    onPaginationChange: (updater) => {
      setInternalPagination(updater)
      onPaginationChange?.(updater)
    },
    onRowSelectionChange: (updater) => {
      setInternalSelection(updater)
      onSelectionChange?.(updater)
    },
    onGlobalFilterChange: (updater) => {
      setInternalSearch(updater)
      onSearchChange?.(updater)
    },
  })
  const scroll = useRef<HTMLDivElement>(null)
  const dragged = useRef<string | null>(null)
  const rows = table.getRowModel().rows
  const virtual = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scroll.current,
    estimateSize: () => 45,
    initialRect: { width: 800, height },
    overscan: 5,
    enabled: virtualized,
    getItemKey: (index) => rows[index]!.id,
  })
  const virtualItems = virtual.getVirtualItems()
  const visible = virtualized
    ? virtualItems.map((item) => ({
        row: rows[item.index]!,
        index: item.index,
      }))
    : rows.map((row, index) => ({ row, index }))
  const width =
    table.getTotalSize() + (selectable ? 44 : 0) + (onReorder ? 70 : 0)
  const colCount =
    table.getVisibleLeafColumns().length +
    (selectable ? 1 : 0) +
    (onReorder ? 1 : 0)
  function style(column: Column<typeof features, T>): CSSProperties {
    const pin = column.getIsPinned()
    return {
      width: column.getSize(),
      minWidth: column.getSize(),
      maxWidth: column.getSize(),
      ...(pin
        ? {
            position: "sticky",
            insetInlineStart:
              pin === "start" ? column.getStart("start") : undefined,
            insetInlineEnd: pin === "end" ? column.getAfter("end") : undefined,
            zIndex: 1,
          }
        : {}),
    }
  }
  function reorder(id: string, targetId: string) {
    if (!onReorder || id === targetId) return
    const from = data.findIndex((row) => getRowId(row) === id),
      to = data.findIndex((row) => getRowId(row) === targetId)
    if (from < 0 || to < 0) return
    const next = [...data]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item!)
    if (table.state.sorting.length) table.setSorting([])
    onReorder(next)
  }
  function renderRow(row: Row<typeof features, T>, index: number) {
    return (
      <tr
        key={row.id}
        aria-rowindex={index + (headerRow ? 3 : 2)}
        aria-selected={selectable ? row.getIsSelected() : undefined}
        className={cn(
          "border-b last:border-0",
          row.getIsSelected() && "bg-accent"
        )}
        onDragOver={(e) => {
          if (onReorder) e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          if (dragged.current) reorder(dragged.current, row.id)
          dragged.current = null
        }}
      >
        {selectable && (
          <td className="w-11 px-3 py-3">
            <input
              type="checkbox"
              className="accent-primary"
              aria-label={`Select row ${row.id}`}
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </td>
        )}
        {onReorder && (
          <td className="w-16 px-2">
            <button
              type="button"
              disabled={row.depth > 0}
              draggable={row.depth === 0}
              aria-label={`Move row ${row.id}. Use up and down arrow keys.`}
              className="rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onDragStart={() => {
                dragged.current = row.id
              }}
              onDragEnd={() => {
                dragged.current = null
              }}
              onKeyDown={(e) => {
                const topRows = rows.filter((item) => item.depth === 0)
                const current = topRows.findIndex((item) => item.id === row.id)
                const target =
                  topRows[current + (e.key === "ArrowUp" ? -1 : 1)]?.original
                if ((e.key === "ArrowUp" || e.key === "ArrowDown") && target) {
                  e.preventDefault()
                  reorder(row.id, getRowId(target))
                }
              }}
            >
              <DotsSixVerticalIcon className="size-4 text-muted-foreground" />
            </button>
          </td>
        )}
        {row
          .getVisibleCells()
          .filter((cell) => {
            const definition = columns.find(
              (column) => column.id === cell.column.id
            )
            return (
              definition?.colSpan?.(row.original) !== 0 &&
              definition?.rowSpan?.(row.original) !== 0
            )
          })
          .map((cell, i) => (
            <td
              key={cell.id}
              colSpan={columns
                .find((column) => column.id === cell.column.id)
                ?.colSpan?.(row.original)}
              rowSpan={columns
                .find((column) => column.id === cell.column.id)
                ?.rowSpan?.(row.original)}
              style={style(cell.column)}
              className={cn(
                "px-3 py-3 align-top text-sm",
                row.getIsSelected() ? "bg-accent" : "bg-card"
              )}
            >
              <div
                className="flex min-w-0 items-center gap-2"
                style={
                  i === 0 ? { paddingInlineStart: row.depth * 16 } : undefined
                }
              >
                {i === 0 && row.getCanExpand() && (
                  <button
                    type="button"
                    onClick={row.getToggleExpandedHandler()}
                    aria-label={`${row.getIsExpanded() ? "Collapse" : "Expand"} row ${row.id}`}
                    aria-expanded={row.getIsExpanded()}
                  >
                    {row.getIsExpanded() ? (
                      <CaretDownIcon className="size-3" />
                    ) : (
                      <CaretRightIcon className="size-3" />
                    )}
                  </button>
                )}
                <div className="min-w-0 flex-1 break-words">
                  {(() => {
                    const custom = columns.find(
                      (column) => column.id === cell.column.id
                    )?.cell
                    return custom ? (
                      custom(row.original)
                    ) : (
                      <table.FlexRender cell={cell} />
                    )
                  })()}
                </div>
              </div>
            </td>
          ))}
      </tr>
    )
  }
  return (
    <div data-slot="data-grid" className={cn("min-w-0 space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {searchable && (
          <Input
            aria-label={`Search ${label}`}
            placeholder="Search…"
            className="h-8 max-w-xs"
            value={table.state.globalFilter ?? ""}
            onChange={(e) => {
              table.setGlobalFilter(e.target.value)
              table.setPageIndex(0)
            }}
          />
        )}
        {showColumnMenu && (
          <details className="relative ms-auto text-sm">
            <summary className="cursor-pointer rounded-md border px-3 py-1.5">
              Columns
            </summary>
            <div className="absolute end-0 z-20 mt-1 min-w-40 rounded-md border bg-popover p-3 shadow-surface">
              {table.getAllLeafColumns().map((column) => (
                <label
                  key={column.id}
                  className="flex items-center gap-2 py-1 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="accent-primary"
                  />
                  {columns.find((c) => c.id === column.id)?.header}
                </label>
              ))}
            </div>
          </details>
        )}
      </div>
      <div
        ref={scroll}
        className="overflow-auto rounded-lg border"
        style={{ maxHeight: height }}
      >
        <table
          aria-label={label}
          aria-busy={loading}
          aria-rowcount={rows.length + (headerRow ? 2 : 1)}
          className="w-full table-fixed border-collapse text-start"
          style={{ minWidth: width }}
        >
          <thead className="sticky top-0 z-10 bg-card">
            {headerRow}
            <tr className="border-b">
              {selectable && (
                <th className="w-11 px-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={table.getIsAllPageRowsSelected()}
                    ref={(node) => {
                      if (node)
                        node.indeterminate = table.getIsSomePageRowsSelected()
                    }}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                    className="accent-primary"
                  />
                </th>
              )}
              {onReorder && (
                <th className="w-16">
                  <span className="sr-only">Order</span>
                </th>
              )}
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <th
                  key={header.id}
                  style={style(header.column)}
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                  className="relative bg-card px-3 py-3 text-start text-xs font-medium text-muted-foreground"
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 text-start"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUpIcon className="size-3" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDownIcon className="size-3" />
                      ) : (
                        <ArrowsDownUpIcon className="size-3" />
                      )}
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                  <button
                    type="button"
                    aria-label={`Resize ${String(header.column.columnDef.header)}`}
                    className="absolute end-0 top-0 h-full w-2 cursor-col-resize touch-none border-e border-transparent hover:border-primary focus-visible:border-primary"
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                        e.preventDefault()
                        table.setColumnSizing((previous) => ({
                          ...previous,
                          [header.column.id]: Math.max(
                            header.column.columnDef.minSize ?? 80,
                            header.column.getSize() +
                              (e.key === "ArrowRight" ? 10 : -10)
                          ),
                        }))
                      }
                    }}
                  />
                </th>
              ))}
            </tr>
            {columnFilters && (
              <tr className="border-b">
                {selectable && <th />}
                {onReorder && <th />}
                {table.getVisibleLeafColumns().map((column) => (
                  <th key={column.id} className="p-2" style={style(column)}>
                    {column.getCanFilter() && (
                      <Input
                        aria-label={`Filter ${columns.find((c) => c.id === column.id)?.header}`}
                        value={String(column.getFilterValue() ?? "")}
                        onChange={(e) => {
                          column.setFilterValue(e.target.value)
                          table.setPageIndex(0)
                        }}
                        className="h-7 text-xs"
                      />
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {loading || error || !rows.length ? (
              <tr>
                <td
                  colSpan={Math.max(1, colCount)}
                  className="p-8 text-center text-sm text-muted-foreground"
                  role="status"
                >
                  {error ?? (loading ? "Loading…" : emptyMessage)}
                  {error && onRetry && (
                    <Button
                      className="ms-3"
                      size="sm"
                      variant="outline"
                      onClick={onRetry}
                    >
                      Retry
                    </Button>
                  )}
                </td>
              </tr>
            ) : (
              <>
                {virtualized && !!virtualItems[0]?.start && (
                  <tr aria-hidden="true">
                    <td
                      colSpan={colCount}
                      style={{ height: virtualItems[0].start }}
                    />
                  </tr>
                )}
                {visible.map(({ row, index }) => renderRow(row, index))}
                {virtualized && (
                  <tr aria-hidden="true">
                    <td
                      colSpan={colCount}
                      style={{
                        height: Math.max(
                          0,
                          virtual.getTotalSize() -
                            (virtualItems.at(-1)?.end ?? 0)
                        ),
                      }}
                    />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span role="status">
          {selectable
            ? `${Object.keys(table.state.rowSelection).filter((key) => table.state.rowSelection[key]).length} selected · `
            : ""}
          {table.getFilteredRowModel().rows.length} rows
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            Rows
            <select
              aria-label="Rows per page"
              value={table.state.pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded border bg-card px-2 py-1"
            >
              {[...new Set([pageSize, 10, 25, 50, 100])]
                .sort((a, b) => a - b)
                .map((size) => (
                  <option key={size}>{size}</option>
                ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span>
            {table.state.pagination.pageIndex + 1} /{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {footer}
    </div>
  )
}
