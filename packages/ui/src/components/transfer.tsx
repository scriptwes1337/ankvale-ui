"use client"
import { useId, useState, useRef, useEffect } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type TransferItem = { id: string; label: string; disabled?: boolean }
export function Transfer({
  items,
  label,
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
}: {
  items: TransferItem[]
  label: string
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
  disabled?: boolean
}) {
  const id = useId()
  const [chosen, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [checked, setChecked] = useState<string[]>([])
  const [queries, setQueries] = useState(["", ""])
  const root = useRef<HTMLFieldSetElement>(null)
  const moved = useRef<string | null>(null)
  useEffect(() => {
    if (!moved.current) return
    const item = Array.from(
      root.current?.querySelectorAll<HTMLInputElement>(
        "[data-transfer-item]"
      ) ?? []
    ).find((element) => element.dataset.transferItem === moved.current)
    ;(item ?? root.current)?.focus()
    moved.current = null
  }, [chosen])
  function move(toSelected: boolean) {
    const movable = checked.filter(
      (key) =>
        items.some((item) => item.id === key && !item.disabled) &&
        chosen.includes(key) !== toSelected
    )
    moved.current = movable[0] ?? null
    set(
      toSelected
        ? [...new Set([...chosen, ...movable])]
        : chosen.filter((key) => !movable.includes(key))
    )
    setChecked([])
  }
  return (
    <fieldset
      ref={root}
      tabIndex={-1}
      data-slot="transfer"
      disabled={disabled}
      className="space-y-3"
    >
      <legend className="mb-3 text-sm font-medium">{label}</legend>
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {[false, true].map((side, index) => (
          <div key={index} className="contents">
            {index === 1 && (
              <div className="flex justify-center gap-2 sm:flex-col">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    disabled || !checked.some((key) => !chosen.includes(key))
                  }
                  onClick={() => move(true)}
                  aria-label="Move to selected"
                >
                  <span aria-hidden="true" className="sm:hidden">
                    ↓
                  </span>
                  <span aria-hidden="true" className="hidden sm:inline">
                    →
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    disabled || !checked.some((key) => chosen.includes(key))
                  }
                  onClick={() => move(false)}
                  aria-label="Move to available"
                >
                  <span aria-hidden="true" className="sm:hidden">
                    ↑
                  </span>
                  <span aria-hidden="true" className="hidden sm:inline">
                    ←
                  </span>
                </Button>
              </div>
            )}
            <section className="min-w-0 rounded-lg border">
              <h3
                id={`${id}-${index}-title`}
                className="border-b px-3 py-2 text-sm font-medium"
              >
                {side ? "Selected" : "Available"}
              </h3>
              <div className="p-2">
                <Input
                  aria-label={`Search ${side ? "selected" : "available"}`}
                  value={queries[index]}
                  disabled={disabled}
                  onChange={(e) =>
                    setQueries((prev) =>
                      prev.map((q, i) => (i === index ? e.target.value : q))
                    )
                  }
                />
              </div>
              <ul
                aria-labelledby={`${id}-${index}-title`}
                className="h-48 space-y-1 overflow-auto p-2"
              >
                {items
                  .filter(
                    (item) =>
                      chosen.includes(item.id) === side &&
                      item.label
                        .toLocaleLowerCase()
                        .includes(queries[index]!.toLocaleLowerCase())
                  )
                  .map((item) => (
                    <li key={item.id}>
                      <label className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-muted">
                        <input
                          type="checkbox"
                          data-transfer-item={item.id}
                          className="accent-primary"
                          disabled={disabled || item.disabled}
                          checked={checked.includes(item.id)}
                          onChange={(e) =>
                            setChecked((prev) =>
                              e.target.checked
                                ? [...prev, item.id]
                                : prev.filter((key) => key !== item.id)
                            )
                          }
                        />
                        {item.label}
                      </label>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        ))}
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {chosen.length} selected
      </p>
    </fieldset>
  )
}
