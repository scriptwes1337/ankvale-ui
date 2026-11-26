"use client"
import { useRef, type ReactNode, type KeyboardEvent } from "react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type ListViewItem = {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  disabled?: boolean
}
export type ListViewProps = {
  items: ListViewItem[]
  selected?: string[]
  defaultSelected?: string[]
  onSelectionChange?: (ids: string[]) => void
  selectionMode?: "single" | "multiple" | "none"
  onAction?: (id: string) => void
  label: string
  className?: string
  emptyMessage?: string
}
export function ListView({
  items,
  selected,
  defaultSelected = [],
  onSelectionChange,
  selectionMode = "none",
  onAction,
  label,
  className,
  emptyMessage = "No items.",
}: ListViewProps) {
  const [selection, setSelection] = useControllableState({
    value: selected,
    defaultValue: defaultSelected,
    onChange: onSelectionChange,
  })
  const root = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ text: "", time: 0 })
  function choose(id: string) {
    if (selectionMode === "none") onAction?.(id)
    else
      setSelection(
        selectionMode === "single"
          ? [id]
          : selection.includes(id)
            ? selection.filter((key) => key !== id)
            : [...selection, id]
      )
  }
  function key(e: KeyboardEvent<HTMLDivElement>, id: string) {
    const rows = Array.from(
      root.current?.querySelectorAll<HTMLElement>(
        '[role="row"][data-item]:not([aria-disabled="true"])'
      ) ?? []
    )
    const index = rows.indexOf(e.currentTarget)
    let next: HTMLElement | undefined
    if (e.key === "ArrowDown") next = rows[Math.min(index + 1, rows.length - 1)]
    else if (e.key === "ArrowUp") next = rows[Math.max(0, index - 1)]
    else if (e.key === "Home") next = rows[0]
    else if (e.key === "End") next = rows.at(-1)
    else if (e.key === " " || e.key === "Enter") choose(id)
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const now = Date.now()
      typeahead.current.text =
        (now - typeahead.current.time > 600 ? "" : typeahead.current.text) +
        e.key.toLowerCase()
      typeahead.current.time = now
      const match = items.find(
        (item) =>
          !item.disabled &&
          item.title.toLowerCase().startsWith(typeahead.current.text)
      )
      next = rows.find((row) => row.dataset.item === match?.id)
    } else return
    e.preventDefault()
    next?.focus()
  }
  return (
    <div
      ref={root}
      data-slot="list-view"
      role="grid"
      aria-label={label}
      aria-multiselectable={selectionMode === "multiple" || undefined}
      className={cn(
        "divide-y overflow-hidden rounded-lg border bg-card",
        className
      )}
    >
      {!items.length ? (
        <div role="row">
          <div
            role="gridcell"
            className="p-6 text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </div>
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            data-item={item.id}
            role="row"
            aria-selected={
              selectionMode === "none" ? undefined : selection.includes(item.id)
            }
            aria-disabled={item.disabled || undefined}
            tabIndex={item.disabled ? -1 : 0}
            className={cn(
              "flex items-center gap-3 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              selection.includes(item.id) && "bg-accent",
              item.disabled && "opacity-50"
            )}
            onKeyDown={(e) => {
              if (e.target === e.currentTarget && !item.disabled)
                key(e, item.id)
            }}
            onClick={() => {
              if (!item.disabled) choose(item.id)
            }}
          >
            <div
              role="gridcell"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              {selectionMode !== "none" && (
                <input
                  type={selectionMode === "single" ? "radio" : "checkbox"}
                  aria-label={`Select ${item.title}`}
                  checked={selection.includes(item.id)}
                  disabled={item.disabled}
                  tabIndex={-1}
                  onChange={() => choose(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-primary"
                />
              )}
              {item.icon}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            {item.actions && (
              <div role="gridcell" onClick={(e) => e.stopPropagation()}>
                {item.actions}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
