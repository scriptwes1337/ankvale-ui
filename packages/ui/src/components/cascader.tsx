"use client"
import { useId, useEffect, useState } from "react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
export type CascaderOption = {
  value: string
  label: string
  disabled?: boolean
  children?: CascaderOption[]
  hasChildren?: boolean
}
export type CascaderProps = {
  options: CascaderOption[]
  label: string
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (path: string[]) => void
  disabled?: boolean
  name?: string
  searchable?: boolean
  loadChildren?: (
    path: string[],
    signal: AbortSignal
  ) => Promise<CascaderOption[]>
}
/** Keyboard-native path fields; parent changes clear descendants. Search covers loaded paths. */
export function Cascader({
  options,
  label,
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  name,
  searchable = true,
  loadChildren,
}: CascaderProps) {
  const id = useId()
  const [path, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [cache, setCache] = useState<Record<string, CascaderOption[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState("")
  const [retry, setRetry] = useState(0)
  const pathKey = JSON.stringify(path)
  let current = options
  const levels = [options]
  let last: CascaderOption | undefined
  for (let i = 0; i < path.length; i++) {
    last = current.find((item) => item.value === path[i])
    const children =
      last?.children ?? cache[JSON.stringify(path.slice(0, i + 1))]
    if (!children?.length) break
    levels.push(children)
    current = children
  }
  const shouldLoad =
    !!last?.hasChildren &&
    !last.children &&
    !cache[pathKey] &&
    !!loadChildren &&
    !disabled
  useEffect(() => {
    if (!shouldLoad || !loadChildren) return
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    loadChildren(JSON.parse(pathKey), controller.signal)
      .then((children) => {
        if (!controller.signal.aborted)
          setCache((previous) => ({ ...previous, [pathKey]: children }))
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [pathKey, shouldLoad, loadChildren, retry])
  const results: { path: string[]; labels: string[]; disabled: boolean }[] = []
  function visit(
    nodes: CascaderOption[],
    keys: string[] = [],
    labels: string[] = [],
    blocked = false
  ) {
    for (const node of nodes) {
      const next = [...keys, node.value]
      const names = [...labels, node.label]
      const disabledNode = blocked || !!node.disabled
      const children = node.children ?? cache[JSON.stringify(next)]
      if (!children?.length)
        results.push({ path: next, labels: names, disabled: disabledNode })
      else visit(children, next, names, disabledNode)
    }
  }
  if (query) visit(options)
  return (
    <fieldset data-slot="cascader" disabled={disabled} className="space-y-3">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {searchable && (
        <Input
          aria-label={`Search ${label}`}
          placeholder="Search paths…"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      {query ? (
        <ul
          aria-label="Matching paths"
          className="max-h-56 overflow-auto rounded-md border p-1"
        >
          {results
            .filter((item) =>
              item.labels
                .join(" / ")
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase())
            )
            .map((item) => (
              <li key={JSON.stringify(item.path)}>
                <button
                  type="button"
                  disabled={disabled || item.disabled}
                  className="w-full rounded px-3 py-2 text-start text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  onClick={() => {
                    set(item.path)
                    setQuery("")
                  }}
                >
                  {item.labels.join(" / ")}
                </button>
              </li>
            ))}
        </ul>
      ) : (
        <div className="flex flex-wrap gap-2">
          {levels.map((level, index) => (
            <div key={index} className="min-w-[140px] flex-1">
              <label htmlFor={`${id}-${index}`} className="sr-only">
                {label}, level {index + 1}
              </label>
              <select
                id={`${id}-${index}`}
                disabled={disabled}
                value={path[index] ?? ""}
                onChange={(e) =>
                  set([
                    ...path.slice(0, index),
                    ...(e.target.value ? [e.target.value] : []),
                  ])
                }
                className="h-9 w-full rounded-md border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Choose…</option>
                {level.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      {shouldLoad && loading && (
        <p role="status" className="text-xs text-muted-foreground">
          Loading options…
        </p>
      )}
      {shouldLoad && error && (
        <div
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          Could not load options.
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRetry((v) => v + 1)}
          >
            Retry
          </Button>
        </div>
      )}
      {path.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => set([])}
        >
          Clear path
        </Button>
      )}
      {name && <input type="hidden" name={name} value={JSON.stringify(path)} />}
    </fieldset>
  )
}
