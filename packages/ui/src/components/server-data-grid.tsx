"use client"
import { useEffect, useState } from "react"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"
import { Button } from "@ankvale/ui/components/button"
import type { SortingState, PaginationState } from "@tanstack/react-table"
import type { QueryGroup } from "@ankvale/ui/lib/query"
export type GridQuery = {
  search: string
  sorting: SortingState
  pagination: PaginationState
  filters?: { column: string; operator: string; value: string }[]
  filterTree?: QueryGroup
}
export type GridExportFormat = "csv" | "xlsx" | "pdf"
export type GridExportRequest = { format: GridExportFormat; query: GridQuery }
export type GridDataSource<T> = (
  query: GridQuery,
  context: { signal: AbortSignal }
) => Promise<{ rows: T[]; rowCount: number }>
export function useGridDataSource<T>(
  source: GridDataSource<T>,
  query: GridQuery
) {
  const [version, setVersion] = useState(0)
  const serialized = JSON.stringify(query)
  const [result, setResult] = useState<{
    source?: GridDataSource<T>
    serialized?: string
    version?: number
    rows: T[]
    rowCount: number
    error?: string
  }>({ rows: [], rowCount: 0 })
  const loading =
    result.source !== source ||
    result.serialized !== serialized ||
    result.version !== version
  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve()
      .then(() => source(JSON.parse(serialized), { signal: controller.signal }))
      .then((next) => {
        if (!controller.signal.aborted)
          setResult({ ...next, source, serialized, version })
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult((previous) => ({
            ...previous,
            source,
            serialized,
            version,
            error: "Could not load records. Try again.",
          }))
      })
    return () => controller.abort()
  }, [source, serialized, version])
  return {
    rows: result.rows,
    rowCount: result.rowCount,
    loading,
    error: loading ? undefined : result.error,
    reload: () => setVersion((v) => v + 1),
  }
}
export function ServerDataGrid<T extends object>({
  source,
  columns,
  getRowId,
  label,
  pageSize = 20,
  filters,
  filterTree,
  onExport,
  onPrint,
  exportFormats = ["csv", "xlsx", "pdf"],
}: {
  source: GridDataSource<T>
  columns: DataGridColumn<T>[]
  getRowId: (row: T) => string
  label: string
  pageSize?: number
  filters?: GridQuery["filters"]
  filterTree?: QueryGroup
  onExport?: (request: GridExportRequest) => void | Promise<void>
  onPrint?: (query: GridQuery) => void | Promise<void>
  exportFormats?: readonly GridExportFormat[]
}) {
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const query: GridQuery = {
    search,
    sorting,
    pagination,
    filters,
    filterTree,
  }
  const state = useGridDataSource(source, query)
  const [action, setAction] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string>()
  async function runAction(name: string, callback: () => void | Promise<void>) {
    setAction(name)
    setActionError(undefined)
    try {
      await callback()
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The requested action failed. Try again."
      )
    } finally {
      setAction(null)
    }
  }
  return (
    <section
      data-slot="server-data-grid"
      aria-label={label}
      className="space-y-3"
    >
      {(onExport || onPrint) && (
        <div className="flex flex-wrap gap-2">
          {onExport &&
            [...new Set(exportFormats)].map((format) => (
              <Button
                key={format}
                type="button"
                size="sm"
                variant="outline"
                disabled={!!action}
                onClick={() =>
                  void runAction(format, () => onExport({ format, query }))
                }
              >
                {action === format
                  ? "Exporting…"
                  : `Export ${format.toUpperCase()}`}
              </Button>
            ))}
          {onPrint && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!!action}
              onClick={() => void runAction("print", () => onPrint(query))}
            >
              {action === "print" ? "Preparing…" : "Print"}
            </Button>
          )}
        </div>
      )}
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}
      <DataGrid
        data={state.rows}
        rowCount={state.rowCount}
        label={label}
        columns={columns}
        getRowId={getRowId}
        manualFiltering
        manualSorting
        manualPagination
        loading={state.loading}
        error={state.error}
        onRetry={state.reload}
        search={search}
        onSearchChange={(next) => {
          setSearch(next)
          setPagination((previous) => ({ ...previous, pageIndex: 0 }))
        }}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next)
          setPagination((previous) => ({ ...previous, pageIndex: 0 }))
        }}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </section>
  )
}
