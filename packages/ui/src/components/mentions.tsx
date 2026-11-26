"use client"
import { useId, useState, useRef } from "react"
import { Textarea } from "@ankvale/ui/components/textarea"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type MentionOption = { id: string; label: string; value: string }
export function Mentions({
  label,
  options,
  value,
  defaultValue = "",
  onValueChange,
  onQueryChange,
  loading = false,
  error,
  disabled = false,
  name,
}: {
  label: string
  options: MentionOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onQueryChange?: (query: string) => void
  loading?: boolean
  error?: string
  disabled?: boolean
  name?: string
}) {
  const id = useId()
  const [text, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [query, setQuery] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const caret = useRef(0)
  const input = useRef<HTMLTextAreaElement>(null)
  const matches =
    query === null
      ? []
      : options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        )
  function inspect(next: string, pos: number) {
    caret.current = pos
    const match = next.slice(0, pos).match(/(?:^|\s)@([^\s@]*)$/)
    const q = match?.[1] ?? null
    setQuery(q)
    setActive(0)
    if (q !== null) onQueryChange?.(q)
  }
  function choose(option: MentionOption) {
    const start = caret.current - (query?.length ?? 0) - 1
    const next =
      text.slice(0, start) + `@${option.value} ` + text.slice(caret.current)
    set(next)
    setQuery(null)
    requestAnimationFrame(() => {
      input.current?.focus()
      const pos = start + option.value.length + 2
      input.current?.setSelectionRange(pos, pos)
    })
  }
  return (
    <div data-slot="mentions" className="relative space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <Textarea
        ref={input}
        id={id}
        name={name}
        disabled={disabled}
        value={text}
        aria-controls={query !== null ? `${id}-suggestions` : undefined}
        aria-expanded={query !== null}
        aria-activedescendant={
          query !== null && matches[active]
            ? `${id}-option-${active}`
            : undefined
        }
        onChange={(e) => {
          set(e.target.value)
          inspect(e.target.value, e.target.selectionStart)
        }}
        onClick={(e) => inspect(text, e.currentTarget.selectionStart)}
        onBlur={() => setQuery(null)}
        onKeyDown={(e) => {
          if (query === null) return
          if (e.key === "Escape") {
            setQuery(null)
            e.preventDefault()
          } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            setActive((i) =>
              Math.max(
                0,
                Math.min(
                  matches.length - 1,
                  i + (e.key === "ArrowDown" ? 1 : -1)
                )
              )
            )
          } else if (e.key === "Enter" && matches[active]) {
            e.preventDefault()
            choose(matches[active]!)
          }
        }}
      />
      {query !== null && (
        <div className="absolute z-20 w-full rounded-md border bg-popover p-1 shadow-sm">
          <ul
            id={`${id}-suggestions`}
            role="listbox"
            aria-label="Mention suggestions"
          >
            {matches.map((option, index) => (
              <li
                key={option.id}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? "rounded bg-accent" : ""}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  className="w-full px-3 py-2 text-start text-sm"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(option)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
          {loading ? (
            <p role="status" className="p-2 text-xs">
              Searching…
            </p>
          ) : error ? (
            <p role="alert" className="p-2 text-xs text-destructive">
              {error}
            </p>
          ) : (
            !matches.length && (
              <p role="status" className="p-2 text-xs text-muted-foreground">
                No matches.
              </p>
            )
          )}
        </div>
      )}
    </div>
  )
}
