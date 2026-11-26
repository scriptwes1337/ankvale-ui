"use client"
import { useEffect, useId, useRef, useState } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { Chip } from "@ankvale/ui/components/chip"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { useVirtualizer } from "@tanstack/react-virtual"
export type SelectionOption = {
  value: string
  label: string
  disabled?: boolean
  description?: string
}
export type SelectionFieldProps = {
  label: string
  options?: SelectionOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (values: string[]) => void
  multiple?: boolean
  creatable?: boolean
  disabled?: boolean
  name?: string
  loadOptions?: (
    query: string,
    signal: AbortSignal
  ) => Promise<SelectionOption[]>
  virtualized?: boolean
}
/** Searchable single/multi/tag selection. Async responses are aborted and stale completions ignored. */
export function SelectionField({
  label,
  options = [],
  value,
  defaultValue = [],
  onValueChange,
  multiple = false,
  creatable = false,
  disabled = false,
  name,
  loadOptions,
  virtualized = false,
}: SelectionFieldProps) {
  const id = useId()
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [remote, setRemote] = useState<SelectionOption[]>([])
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready")
  const [retry, setRetry] = useState(0)
  const [active, setActive] = useState(0)
  const scroll = useRef<HTMLDivElement>(null)
  const labels = useRef(new Map<string, string>())
  useEffect(() => {
    if (!loadOptions || !open || disabled) return
    const abort = new AbortController()
    setStatus("loading")
    Promise.resolve()
      .then(() => loadOptions(query, abort.signal))
      .then((items) => {
        if (!abort.signal.aborted) {
          setRemote(items)
          setStatus("ready")
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) setStatus("error")
      })
    return () => abort.abort()
  }, [query, open, disabled, loadOptions, retry])
  const source = loadOptions ? remote : options
  for (const option of source) labels.current.set(option.value, option.label)
  const visible = source.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  )
  const create =
    creatable &&
    query.trim() &&
    !source.some((option) => option.value === query.trim())
  const items = create
    ? [...visible, { value: query.trim(), label: `Create “${query.trim()}”` }]
    : visible
  const virtual = useVirtualizer({
    count: items.length,
    getScrollElement: () => scroll.current,
    estimateSize: () => 44,
    overscan: 5,
    enabled: virtualized && open,
  })
  function choose(option: SelectionOption) {
    if (option.disabled || disabled) return
    const key = option.value
    labels.current.set(
      key,
      option.label.startsWith("Create “") ? key : option.label
    )
    setSelected(
      multiple
        ? selected.includes(key)
          ? selected.filter((v) => v !== key)
          : [...selected, key]
        : [key]
    )
    setQuery("")
    setActive(0)
    if (!multiple) setOpen(false)
  }
  function option(index: number) {
    const item = items[index]!
    return (
      <div
        id={`${id}-${index}`}
        key={item.value}
        role="option"
        aria-selected={selected.includes(item.value)}
        aria-disabled={item.disabled}
        className={index === active ? "rounded bg-accent" : ""}
      >
        <button
          type="button"
          disabled={disabled || item.disabled}
          tabIndex={-1}
          className="min-h-11 w-full px-3 py-2 text-start text-sm disabled:opacity-50"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => choose(item)}
        >
          {item.label}
          {item.description && (
            <span className="block text-xs text-muted-foreground">
              {item.description}
            </span>
          )}
        </button>
      </div>
    )
  }
  return (
    <div
      data-slot="selection-field"
      className="relative space-y-2"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setOpen(false)
      }}
    >
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((key) => (
            <Chip
              key={key}
              disabled={disabled}
              onRemove={() => {
                setSelected(selected.filter((v) => v !== key))
                document.getElementById(id)?.focus()
              }}
              removeLabel={`Remove ${labels.current.get(key) ?? key}`}
            >
              {labels.current.get(key) ?? key}
            </Chip>
          ))}
        </div>
      )}
      <Input
        id={id}
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={
          open && items[active] ? `${id}-${active}` : undefined
        }
        disabled={disabled}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false)
            return
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            setOpen(true)
            const next = Math.max(
              0,
              Math.min(
                items.length - 1,
                active + (e.key === "ArrowDown" ? 1 : -1)
              )
            )
            setActive(next)
            if (virtualized) virtual.scrollToIndex(next)
          } else if (e.key === "Enter" && open && items[active]) {
            e.preventDefault()
            choose(items[active]!)
          }
        }}
      />
      {open && (
        <div className="absolute z-30 w-full rounded-md border bg-popover p-1 shadow-sm">
          {status === "loading" ? (
            <p role="status" className="p-3 text-sm">
              Searching…
            </p>
          ) : status === "error" ? (
            <div role="alert" className="p-3 text-sm">
              Could not load options.{" "}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRetry((v) => v + 1)}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div
              ref={scroll}
              id={`${id}-list`}
              role="listbox"
              aria-label={label}
              aria-multiselectable={multiple || undefined}
              className="max-h-64 overflow-auto"
            >
              {!items.length ? (
                <p className="p-3 text-sm text-muted-foreground">No options.</p>
              ) : virtualized ? (
                <div
                  style={{
                    height: virtual.getTotalSize(),
                    position: "relative",
                  }}
                >
                  {virtual.getVirtualItems().map((row) => (
                    <div
                      key={row.key}
                      style={{
                        position: "absolute",
                        insetInline: 0,
                        top: 0,
                        transform: `translateY(${row.start}px)`,
                      }}
                    >
                      {option(row.index)}
                    </div>
                  ))}
                </div>
              ) : (
                items.map((_, i) => option(i))
              )}
            </div>
          )}
        </div>
      )}
      {name &&
        selected.map((key) => (
          <input key={key} type="hidden" name={name} value={key} />
        ))}
    </div>
  )
}
