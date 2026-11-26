"use client"
import { useState, useId } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ankvale/ui/components/popover"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import type { CascaderOption } from "@ankvale/ui/components/cascader"
export function TreeSelect({
  options,
  label,
  multiple = false,
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  name,
}: {
  options: CascaderOption[]
  label: string
  multiple?: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
  disabled?: boolean
  name?: string
}) {
  const [selected, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const id = useId()
  const names = new Map<string, string>()
  function collect(nodes: CascaderOption[]) {
    for (const n of nodes) {
      names.set(n.value, n.label)
      if (n.children) collect(n.children)
    }
  }
  collect(options)
  function render(
    nodes: CascaderOption[],
    parentDisabled = false
  ): React.ReactNode {
    return nodes.map((node) => {
      const blocked = disabled || parentDisabled || !!node.disabled
      const children = node.children ? render(node.children, blocked) : null
      const match =
        !query || node.label.toLowerCase().includes(query.toLowerCase())
      if (!match && (!Array.isArray(children) || !children.some(Boolean)))
        return null
      return (
        <li key={node.value}>
          <label className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-muted">
            <input
              type={multiple ? "checkbox" : "radio"}
              className="accent-primary"
              name={multiple ? undefined : id}
              disabled={blocked}
              checked={selected.includes(node.value)}
              onChange={() => {
                set(
                  multiple
                    ? selected.includes(node.value)
                      ? selected.filter((v) => v !== node.value)
                      : [...selected, node.value]
                    : [node.value]
                )
                if (!multiple) setOpen(false)
              }}
            />
            {node.label}
          </label>
          {children && <ul className="ms-4 border-s ps-2">{children}</ul>}
        </li>
      )
    })
  }
  return (
    <div data-slot="tree-select" className="space-y-2">
      <span id={`${id}-label`} className="block text-sm font-medium">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-labelledby={`${id}-label ${id}-value`}
              className="w-full justify-between"
            />
          }
        >
          <span id={`${id}-value`} className="truncate">
            {selected.length
              ? selected.map((v) => names.get(v) ?? v).join(", ")
              : "Choose…"}
          </span>
          <span aria-hidden="true">⌄</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-[calc(100vw-2rem)]">
          <Input
            aria-label={`Search ${label}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul aria-label={label} className="max-h-64 overflow-auto">
            {render(options)}
          </ul>
          <Button
            type="button"
            variant="ghost"
            disabled={!selected.length}
            onClick={() => set([])}
          >
            Clear selection
          </Button>
        </PopoverContent>
      </Popover>
      {name &&
        selected.map((v) => (
          <input key={v} type="hidden" name={name} value={v} />
        ))}
    </div>
  )
}
