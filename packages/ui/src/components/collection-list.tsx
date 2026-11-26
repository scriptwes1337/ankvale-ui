"use client"
import { useMemo, useRef, type ReactNode } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@ankvale/ui/components/button"
export type CollectionItem = {
  id: string
  title: string
  description?: string
  group?: string
  disabled?: boolean
}
/** A data-driven list with optional virtualization and keyboard-accessible reordering. */
export function CollectionList({
  items,
  label,
  selected = [],
  onSelectionChange,
  onAction,
  onReorder,
  loading = false,
  error,
  onRetry,
  hasMore = false,
  onLoadMore,
  virtualized = false,
  height = 360,
  renderItem,
}: {
  items: CollectionItem[]
  label: string
  selected?: string[]
  onSelectionChange?: (ids: string[]) => void
  onAction?: (id: string) => void
  onReorder?: (items: CollectionItem[]) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
  hasMore?: boolean
  onLoadMore?: () => void
  virtualized?: boolean
  height?: number
  renderItem?: (item: CollectionItem) => ReactNode
}) {
  const scroll = useRef<HTMLDivElement>(null)
  const rows = useMemo(() => {
    const result: (
      { kind: "group"; label: string } | { kind: "item"; item: CollectionItem }
    )[] = []
    let group: string | undefined
    for (const item of items) {
      if (item.group && item.group !== group) {
        group = item.group
        result.push({ kind: "group", label: group })
      }
      result.push({ kind: "item", item })
    }
    return result
  }, [items])
  const virtual = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scroll.current,
    estimateSize: (index) => (rows[index]?.kind === "group" ? 32 : 64),
    initialRect: { width: 600, height },
    overscan: 5,
    enabled: virtualized,
  })
  const firstVisible =
    virtual
      .getVirtualItems()
      .find((item) => item.end > (virtual.scrollOffset ?? 0))?.index ?? 0
  const stickyGroup = rows
    .slice(0, firstVisible + 1)
    .reverse()
    .find((entry) => entry.kind === "group")
  function move(id: string, offset: number) {
    const from = items.findIndex((item) => item.id === id),
      to = from + offset
    if (from < 0 || to < 0 || to >= items.length) return
    const next = [...items]
    ;[next[from], next[to]] = [next[to]!, next[from]!]
    onReorder?.(next)
  }
  function row(index: number) {
    const entry = rows[index]!
    if (entry.kind === "group")
      return (
        <div
          role="heading"
          aria-level={3}
          className="sticky top-0 z-10 border-b bg-muted px-3 py-2 text-xs font-medium"
        >
          {entry.label}
        </div>
      )
    const item = entry.item
    return (
      <div className="flex min-h-16 items-center gap-3 border-b px-3 py-2">
        {onSelectionChange && (
          <input
            type="checkbox"
            aria-label={`Select ${item.title}`}
            disabled={item.disabled}
            checked={selected.includes(item.id)}
            onChange={(e) =>
              onSelectionChange(
                e.target.checked
                  ? [...selected, item.id]
                  : selected.filter((id) => id !== item.id)
              )
            }
            className="accent-primary"
          />
        )}
        <div className="min-w-0 flex-1">
          {renderItem ? (
            renderItem(item)
          ) : (
            <>
              <button
                type="button"
                disabled={item.disabled || !onAction}
                className="text-start text-sm font-medium disabled:opacity-100"
                onClick={() => onAction?.(item.id)}
              >
                {item.title}
              </button>
              {item.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </>
          )}
        </div>
        {onReorder && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${item.title} up`}
              disabled={item.disabled || items[0]?.id === item.id}
              onClick={() => move(item.id, -1)}
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${item.title} down`}
              disabled={item.disabled || items.at(-1)?.id === item.id}
              onClick={() => move(item.id, 1)}
            >
              ↓
            </Button>
          </div>
        )}
      </div>
    )
  }
  return (
    <section
      data-slot="collection-list"
      aria-label={label}
      className="space-y-3"
    >
      <div
        ref={scroll}
        className="overflow-auto rounded-lg border"
        style={{ maxHeight: height }}
        aria-busy={loading}
      >
        {error ? (
          <div role="alert" className="p-4 text-sm">
            {error}
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        ) : !rows.length ? (
          <p role="status" className="p-4 text-sm text-muted-foreground">
            {loading ? "Loading…" : "No items."}
          </p>
        ) : virtualized ? (
          <>
            {stickyGroup?.kind === "group" && (
              <div aria-hidden="true" className="sticky top-0 z-20 h-0">
                <div className="border-b bg-muted px-3 py-2 text-xs font-medium">
                  {stickyGroup.label}
                </div>
              </div>
            )}
            <div
              role="list"
              style={{ height: virtual.getTotalSize(), position: "relative" }}
            >
              {virtual.getVirtualItems().map((item) => (
                <div
                  role="listitem"
                  key={item.key}
                  ref={virtual.measureElement}
                  data-index={item.index}
                  style={{
                    position: "absolute",
                    width: "100%",
                    top: 0,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  {row(item.index)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div role="list">
            {rows.map((entry, i) => (
              <div
                role="listitem"
                className={entry.kind === "group" ? "contents" : undefined}
                key={
                  entry.kind === "group"
                    ? `group-${entry.label}-${i}`
                    : entry.item.id
                }
              >
                {row(i)}
              </div>
            ))}
          </div>
        )}
      </div>
      {hasMore && onLoadMore && (
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onLoadMore}
        >
          {loading ? "Loading…" : "Load more"}
        </Button>
      )}
    </section>
  )
}
