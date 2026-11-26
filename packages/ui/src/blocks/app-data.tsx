"use client"
import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@ankvale/ui/components/tabs"
import {
  Descriptions,
  type DescriptionItem,
} from "@ankvale/ui/components/descriptions"
import { Popconfirm } from "@ankvale/ui/components/popconfirm"
import {
  AppSection,
  AppForm,
  AsyncAction,
  AppCollectionState,
  type AppFormField,
  type AppFormValues,
  type AppAction,
} from "@ankvale/ui/blocks/app-shared"
export type AuditEntry = {
  id: string
  actor: string
  action: string
  object: string
  time: string
  detail?: ReactNode
}
export function AuditLog({
  entries,
  onExport,
  pageSize = 10,
  loading,
  error,
  onRetry,
}: {
  entries: AuditEntry[]
  onExport?: (entries: AuditEntry[]) => void | Promise<void>
  pageSize?: number
  loading?: boolean
  error?: string
  onRetry?: AppAction
}) {
  const [query, setQuery] = useState("")
  const [from, setFrom] = useState("")
  const [page, setPage] = useState(0)
  const filtered = entries.filter(
    (e) =>
      `${e.actor} ${e.action} ${e.object}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!from || e.time.slice(0, 10) >= from)
  )
  const pages = Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)))
  const current = Math.min(page, pages - 1)
  return (
    <AppSection
      title="Audit log"
      actions={
        onExport && (
          <AsyncAction variant="outline" onAction={() => onExport(filtered)}>
            Export log
          </AsyncAction>
        )
      }
    >
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Search audit log"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          className="max-w-sm"
        />
        <Input
          type="date"
          aria-label="Events from date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value)
            setPage(0)
          }}
          className="max-w-48"
        />
      </div>
      <AppCollectionState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!filtered.length}
      />
      {!loading && !error && (
        <ol className="divide-y">
          {filtered
            .slice(current * pageSize, (current + 1) * pageSize)
            .map((e) => (
              <li key={e.id} className="space-y-2 py-4">
                <p className="text-sm">
                  <strong>{e.actor}</strong> {e.action}{" "}
                  <span className="font-medium">{e.object}</span>
                </p>
                <time className="text-xs text-muted-foreground">{e.time}</time>
                {e.detail && (
                  <details className="text-sm">
                    <summary>View details</summary>
                    <div className="mt-3">{e.detail}</div>
                  </details>
                )}
              </li>
            ))}
        </ol>
      )}
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          Page {current + 1} of {pages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!current}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </AppSection>
  )
}
export type InboxNotification = {
  id: string
  title: string
  description?: string
  time: string
  read: boolean
  href?: string
  group?: string
}
export function NotificationCenter({
  items,
  onRead,
  onDismiss,
  onReadAll,
  onLoadMore,
  hasMore,
  loading,
  error,
}: {
  items: InboxNotification[]
  onRead: (id: string) => void | Promise<void>
  onDismiss: (id: string) => void | Promise<void>
  onReadAll?: AppAction
  onLoadMore?: AppAction
  hasMore?: boolean
  loading?: boolean
  error?: string
}) {
  const [unread, setUnread] = useState(false)
  const visible = items.filter((i) => !unread || !i.read)
  return (
    <AppSection
      title="Notifications"
      actions={
        onReadAll && (
          <AsyncAction variant="ghost" onAction={onReadAll}>
            Mark all read
          </AsyncAction>
        )
      }
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="accent-primary"
          checked={unread}
          onChange={(e) => setUnread(e.target.checked)}
        />
        Unread only
      </label>
      <AppCollectionState
        loading={loading}
        error={error}
        empty={!visible.length}
      />
      {!loading && !error && (
        <ul className="divide-y">
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className={item.read ? "text-sm" : "text-sm font-semibold"}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-primary hover:underline"
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.group ? `${item.group} · ` : ""}
                  {item.time}
                </p>
              </div>
              <div className="flex gap-2">
                {!item.read && (
                  <AsyncAction
                    variant="ghost"
                    size="sm"
                    onAction={() => onRead(item.id)}
                  >
                    Mark read
                  </AsyncAction>
                )}
                <AsyncAction
                  variant="ghost"
                  size="sm"
                  onAction={() => onDismiss(item.id)}
                >
                  Dismiss
                </AsyncAction>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore && onLoadMore && (
        <AsyncAction variant="outline" onAction={onLoadMore}>
          Load more notifications
        </AsyncAction>
      )}
    </AppSection>
  )
}
export type SearchResult = {
  id: string
  title: string
  description?: string
  group: string
  href?: string
}
export function GlobalSearch({
  search,
  onSelect,
  recentQueries = [],
  placeholder = "Search your workspace",
}: {
  search: (query: string, signal: AbortSignal) => Promise<SearchResult[]>
  onSelect?: (item: SearchResult) => void
  recentQueries?: string[]
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<"idle" | "pending" | "error" | "done">(
    "idle"
  )
  const [retry, setRetry] = useState(0)
  function updateQuery(value: string) {
    setQuery(value)
    setResults([])
    setStatus(value.trim() ? "pending" : "idle")
  }
  useEffect(() => {
    if (!query.trim()) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setStatus("pending")
      Promise.resolve()
        .then(() => search(query, controller.signal))
        .then((data) => {
          if (!controller.signal.aborted) {
            setResults(data)
            setStatus("done")
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus("error")
        })
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, search, retry])
  return (
    <AppSection title="Search">
      <Input
        aria-label="Global search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
      />
      {!query && recentQueries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            Recent searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentQueries.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                onClick={() => updateQuery(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}
      <AppCollectionState
        loading={status === "pending"}
        error={
          status === "error" ? "Search could not be completed." : undefined
        }
        onRetry={() => setRetry((v) => v + 1)}
        empty={status === "done" && !results.length}
      />
      {status === "done" &&
        [...new Set(results.map((r) => r.group))].map((group) => (
          <section key={group} className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              {group}
            </h3>
            <ul className="divide-y">
              {results
                .filter((r) => r.group === group)
                .map((item) => (
                  <li key={item.id} className="py-2">
                    {item.href ? (
                      <a
                        href={item.href}
                        onClick={() => onSelect?.(item)}
                        className="block rounded p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="w-full rounded p-2 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={!onSelect}
                        onClick={() => onSelect?.(item)}
                      >
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </AppSection>
  )
}
export type FilterRule = {
  id: string
  field: string
  operator: "contains" | "equals" | "not"
  value: string
}
export type CollectionFilter = {
  query: string
  rules: FilterRule[]
  from?: string
  to?: string
}
export function CollectionToolbar({
  value,
  onChange,
  fields,
  savedViews = [],
  onSaveView,
}: {
  value: CollectionFilter
  onChange: (value: CollectionFilter) => void
  fields: { id: string; label: string }[]
  savedViews?: { id: string; name: string; filter: CollectionFilter }[]
  onSaveView?: (name: string, filter: CollectionFilter) => void | Promise<void>
}) {
  const [viewName, setViewName] = useState("")
  return (
    <div
      data-slot="collection-toolbar"
      className="space-y-3 rounded-lg border p-4"
    >
      <div className="flex flex-wrap gap-2">
        <Input
          aria-label="Search collection"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          className="min-w-40 flex-1"
        />
        {savedViews.length > 0 && (
          <select
            aria-label="Saved view"
            value=""
            onChange={(e) => {
              const view = savedViews.find((v) => v.id === e.target.value)
              if (view) onChange(view.filter)
            }}
            className="rounded-md border bg-background px-3"
          >
            <option value="">Saved views</option>
            {savedViews.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        )}
        <Button
          variant="outline"
          disabled={!fields.length}
          onClick={() =>
            onChange({
              ...value,
              rules: [
                ...value.rules,
                {
                  id: crypto.randomUUID(),
                  field: fields[0]!.id,
                  operator: "contains",
                  value: "",
                },
              ],
            })
          }
        >
          Add filter
        </Button>
        <Button
          variant="ghost"
          onClick={() => onChange({ query: "", rules: [] })}
        >
          Reset filters
        </Button>
      </div>
      {value.rules.map((rule, index) => (
        <div key={rule.id} className="flex flex-wrap gap-2">
          <select
            aria-label={`Filter ${index + 1} field`}
            value={rule.field}
            onChange={(e) =>
              onChange({
                ...value,
                rules: value.rules.map((r) =>
                  r.id === rule.id ? { ...r, field: e.target.value } : r
                ),
              })
            }
            className="rounded border bg-background px-2 py-1 text-sm"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            aria-label={`Filter ${index + 1} operator`}
            value={rule.operator}
            onChange={(e) =>
              onChange({
                ...value,
                rules: value.rules.map((r) =>
                  r.id === rule.id
                    ? {
                        ...r,
                        operator: e.target.value as FilterRule["operator"],
                      }
                    : r
                ),
              })
            }
            className="rounded border bg-background px-2 py-1 text-sm"
          >
            <option value="contains">Contains</option>
            <option value="equals">Equals</option>
            <option value="not">Is not</option>
          </select>
          <Input
            aria-label={`Filter ${index + 1} value`}
            value={rule.value}
            onChange={(e) =>
              onChange({
                ...value,
                rules: value.rules.map((r) =>
                  r.id === rule.id ? { ...r, value: e.target.value } : r
                ),
              })
            }
            className="max-w-xs"
          />
          <Button
            variant="ghost"
            aria-label={`Remove filter ${index + 1}`}
            onClick={() =>
              onChange({
                ...value,
                rules: value.rules.filter((r) => r.id !== rule.id),
              })
            }
          >
            Remove
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs text-muted-foreground">
          From
          <Input
            type="date"
            value={value.from ?? ""}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          To
          <Input
            type="date"
            min={value.from}
            value={value.to ?? ""}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </label>
      </div>
      {onSaveView && (
        <div className="flex flex-wrap gap-2">
          <Input
            aria-label="View name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            className="max-w-xs"
          />
          <AsyncAction
            variant="outline"
            disabled={!viewName.trim()}
            onAction={() => onSaveView(viewName.trim(), value)}
          >
            Save view
          </AsyncAction>
        </div>
      )}
    </div>
  )
}
export type CrudRecord = { id: string; values: AppFormValues }
export function CrudCollection({
  title,
  records,
  fields,
  onCreate,
  onUpdate,
  onDelete,
  onView,
  onBulkDelete,
  loading,
  error,
}: {
  title: string
  records: CrudRecord[]
  fields: AppFormField[]
  onCreate: (values: AppFormValues) => void | Promise<void>
  onUpdate: (id: string, values: AppFormValues) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  onView?: (id: string) => void
  onBulkDelete?: (ids: string[]) => void | Promise<void>
  loading?: boolean
  error?: string
}) {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState("table")
  const [editing, setEditing] = useState<CrudRecord | "new" | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const visible = records.filter((r) =>
    Object.values(r.values)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  )
  function actions(r: CrudRecord) {
    return (
      <div className="flex flex-wrap gap-2">
        {onView && (
          <Button variant="ghost" size="sm" onClick={() => onView(r.id)}>
            View
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setEditing(r)}>
          Edit
        </Button>
        <Popconfirm
          trigger="Delete"
          title="Delete this record?"
          onConfirm={() => onDelete(r.id)}
        />
      </div>
    )
  }
  return (
    <AppSection
      title={title}
      actions={<Button onClick={() => setEditing("new")}>Create record</Button>}
    >
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label={`Search ${title}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <select
          aria-label="Collection view"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="rounded border bg-background px-3 text-sm"
        >
          <option value="table">Table</option>
          <option value="list">List</option>
          <option value="cards">Cards</option>
        </select>
        {onBulkDelete && (
          <AsyncAction
            variant="outline"
            disabled={!selected.length}
            onAction={async () => {
              await onBulkDelete(selected)
              setSelected([])
            }}
          >
            Delete selected ({selected.length})
          </AsyncAction>
        )}
      </div>
      <AppCollectionState
        loading={loading}
        error={error}
        empty={!visible.length}
      />
      {!loading &&
        !error &&
        (mode === "table" ? (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3">
                    <span className="sr-only">Select</span>
                  </th>
                  {fields.map((f) => (
                    <th key={f.name} className="p-3 text-start font-medium">
                      {f.label}
                    </th>
                  ))}
                  <th className="p-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.values[fields[0]?.name ?? ""] ?? r.id}`}
                        checked={selected.includes(r.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, r.id]
                              : selected.filter((id) => id !== r.id)
                          )
                        }
                      />
                    </td>
                    {fields.map((f) => (
                      <td key={f.name} className="p-3">
                        {r.values[f.name]}
                      </td>
                    ))}
                    <td className="p-3">{actions(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul
            className={
              mode === "cards" ? "grid gap-4 sm:grid-cols-2" : "divide-y"
            }
          >
            {visible.map((r) => (
              <li
                key={r.id}
                className={
                  mode === "cards"
                    ? "space-y-4 rounded border p-4"
                    : "flex flex-wrap justify-between gap-4 py-4"
                }
              >
                <div>
                  {fields.map((f, i) => (
                    <p
                      key={f.name}
                      className={
                        i === 0
                          ? "text-sm font-semibold"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {r.values[f.name]}
                    </p>
                  ))}
                </div>
                {actions(r)}
              </li>
            ))}
          </ul>
        ))}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogTitle>
            {editing === "new" ? "Create record" : "Edit record"}
          </DialogTitle>
          <DialogDescription>Update the record details.</DialogDescription>
          {editing && (
            <AppForm
              key={editing === "new" ? "new" : editing.id}
              fields={fields}
              initialValues={editing === "new" ? {} : editing.values}
              onSubmit={async (values) => {
                if (editing === "new") await onCreate(values)
                else await onUpdate(editing.id, values)
                setEditing(null)
              }}
              submitLabel="Save record"
            />
          )}
        </DialogContent>
      </Dialog>
    </AppSection>
  )
}
export function RecordDetail({
  title,
  description,
  properties,
  tabs,
  actions,
  onEdit,
}: {
  title: string
  description?: string
  properties: DescriptionItem[]
  tabs: { id: string; label: string; content: ReactNode }[]
  actions?: ReactNode
  onEdit?: () => void
}) {
  return (
    <AppSection
      title={title}
      description={description}
      actions={
        <div className="flex gap-2">
          {actions}
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit record
            </Button>
          )}
        </div>
      }
    >
      <Descriptions items={properties} />
      {tabs.length > 0 && (
        <Tabs defaultValue={tabs[0]!.id}>
          <TabsList variant="line">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id} className="pt-5">
              {t.content}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AppSection>
  )
}
