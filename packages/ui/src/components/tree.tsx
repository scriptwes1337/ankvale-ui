"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type TreeNode = {
  id: string
  label: string
  children?: TreeNode[]
  hasChildren?: boolean
  disabled?: boolean
  icon?: ReactNode
}
export type TreeProps = {
  nodes: TreeNode[]
  label: string
  selected?: string[]
  defaultSelected?: string[]
  onSelectionChange?: (ids: string[]) => void
  multiple?: boolean
  checkable?: boolean
  checkStrategy?: "independent" | "cascade"
  virtualized?: boolean
  loadChildren?: (id: string, signal: AbortSignal) => Promise<TreeNode[]>
  onRename?: (id: string, label: string) => void | Promise<void>
  onMove?: (id: string, direction: "up" | "down") => void
  height?: number
}
export function Tree({
  nodes,
  label,
  selected,
  defaultSelected = [],
  onSelectionChange,
  multiple = false,
  checkable = false,
  checkStrategy = "independent",
  virtualized = false,
  loadChildren,
  onRename,
  onMove,
  height = 360,
}: TreeProps) {
  const [chosen, setChosen] = useControllableState({
    value: selected,
    defaultValue: defaultSelected,
    onChange: onSelectionChange,
  })
  const [open, setOpen] = useState<string[]>([])
  const [loaded, setLoaded] = useState<Record<string, TreeNode[]>>({})
  const [loading, setLoading] = useState<string[]>([])
  const [failed, setFailed] = useState<string[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const requests = useRef(new Map<string, AbortController>())
  const selection = useRef({ chosen, setChosen })
  useEffect(() => {
    selection.current = { chosen, setChosen }
  }, [chosen, setChosen])
  const root = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(nodes[0]?.id ?? "")
  const visibleNodes: { node: TreeNode; depth: number }[] = []
  function visible(items: TreeNode[], depth = 1) {
    for (const node of items) {
      visibleNodes.push({ node, depth })
      if (open.includes(node.id))
        visible(node.children ?? loaded[node.id] ?? [], depth + 1)
    }
  }
  visible(nodes)
  const visibleIds = visibleNodes
    .filter(({ node }) => !node.disabled)
    .map(({ node }) => node.id)
  const tabStop = visibleIds.includes(focused) ? focused : visibleIds[0]
  const virtual = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => root.current,
    estimateSize: () => 44,
    initialRect: { width: 600, height },
    overscan: 6,
    enabled: virtualized,
  })
  useEffect(() => {
    const activeRequests = requests.current
    return () => activeRequests.forEach((controller) => controller.abort())
  }, [])
  function enabledDescendants(node: TreeNode): string[] {
    if (node.disabled) return []
    return [
      node.id,
      ...(node.children ?? loaded[node.id] ?? []).flatMap(enabledDescendants),
    ]
  }
  function normalizeParents(items: TreeNode[], next: Set<string>) {
    for (const node of items) {
      if (node.disabled) continue
      const children = (node.children ?? loaded[node.id] ?? []).filter(
        (child) => !child.disabled
      )
      normalizeParents(children, next)
      if (children.length) {
        if (children.every((child) => next.has(child.id))) next.add(node.id)
        else next.delete(node.id)
      }
    }
  }
  function focusNode(id: string | undefined) {
    if (!id) return
    setFocused(id)
    if (virtualized)
      virtual.scrollToIndex(
        visibleNodes.findIndex((entry) => entry.node.id === id)
      )
    requestAnimationFrame(() => {
      Array.from(
        root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []
      )
        .find((element) => element.dataset.treeId === id)
        ?.focus()
    })
  }
  async function expand(node: TreeNode, force = false) {
    if (open.includes(node.id) && !force) {
      setOpen(open.filter((id) => id !== node.id))
      return
    }
    setOpen([...open, node.id])
    if (!node.hasChildren || node.children || loaded[node.id] || !loadChildren)
      return
    requests.current.get(node.id)?.abort()
    const abort = new AbortController()
    requests.current.set(node.id, abort)
    setLoading((items) => [...items, node.id])
    setFailed((items) => items.filter((id) => id !== node.id))
    try {
      const children = await loadChildren(node.id, abort.signal)
      if (!abort.signal.aborted) {
        setLoaded((items) => ({ ...items, [node.id]: children }))
        if (
          checkable &&
          checkStrategy === "cascade" &&
          selection.current.chosen.includes(node.id)
        ) {
          selection.current.setChosen([
            ...new Set([
              ...selection.current.chosen,
              ...children.flatMap(enabledDescendants),
            ]),
          ])
        }
      }
    } catch {
      if (!abort.signal.aborted) setFailed((items) => [...items, node.id])
    } finally {
      if (!abort.signal.aborted)
        setLoading((items) => items.filter((id) => id !== node.id))
    }
  }
  function choose(node: TreeNode) {
    if (node.disabled) return
    if (checkable && checkStrategy === "cascade") {
      const next = new Set(chosen)
      const removing = next.has(node.id)
      for (const id of enabledDescendants(node)) {
        if (removing) next.delete(id)
        else next.add(id)
      }
      normalizeParents(nodes, next)
      setChosen([...next])
    } else {
      setChosen(
        multiple
          ? chosen.includes(node.id)
            ? chosen.filter((id) => id !== node.id)
            : [...chosen, node.id]
          : [node.id]
      )
    }
  }

  function render(items: TreeNode[], depth: number, nested = true): ReactNode {
    return items.map((node) => {
      const children = node.children ?? loaded[node.id]
      const branch = !!children?.length || node.hasChildren
      return (
        <div
          key={node.id}
          data-tree-id={node.id}
          role="treeitem"
          aria-expanded={branch ? open.includes(node.id) : undefined}
          aria-selected={chosen.includes(node.id)}
          aria-disabled={node.disabled || undefined}
          aria-level={depth}
          tabIndex={!node.disabled && node.id === tabStop ? 0 : -1}
          onFocus={(event) => {
            if (event.currentTarget === event.target) setFocused(node.id)
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.currentTarget !== event.target) return
            const index = visibleIds.indexOf(node.id)
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault()
              focusNode(
                visibleIds[index + (event.key === "ArrowDown" ? 1 : -1)]
              )
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault()
              focusNode(
                event.key === "Home" ? visibleIds[0] : visibleIds.at(-1)
              )
            } else if (
              event.key === "ArrowRight" &&
              branch &&
              !open.includes(node.id)
            ) {
              event.preventDefault()
              void expand(node)
            } else if (
              event.key === "ArrowLeft" &&
              branch &&
              open.includes(node.id)
            ) {
              event.preventDefault()
              void expand(node)
            } else if (event.key === " " || event.key === "Enter") {
              event.preventDefault()
              choose(node)
            }
          }}
        >
          <div
            className="flex min-h-10 items-center gap-2 rounded px-2 text-sm hover:bg-muted"
            style={{ paddingInlineStart: depth * 12 }}
          >
            {branch ? (
              <button
                type="button"
                disabled={node.disabled}
                tabIndex={-1}
                aria-label={`${open.includes(node.id) ? "Collapse" : "Expand"} ${node.label}`}
                onClick={() => void expand(node)}
              >
                {open.includes(node.id) ? "⌄" : "›"}
              </button>
            ) : (
              <span className="w-3" />
            )}
            {checkable && (
              <input
                type="checkbox"
                disabled={node.disabled}
                aria-label={`Select ${node.label}`}
                checked={chosen.includes(node.id)}
                ref={(element) => {
                  if (element)
                    element.indeterminate =
                      checkStrategy === "cascade" &&
                      !chosen.includes(node.id) &&
                      enabledDescendants(node).some((id) => chosen.includes(id))
                }}
                onChange={() => choose(node)}
                className="accent-primary"
              />
            )}
            {node.icon}
            <div className="min-w-0 flex-1">
              {editing === node.id ? (
                <form
                  className="flex gap-1"
                  onSubmit={async (event) => {
                    event.preventDefault()
                    if (!draft.trim() || saving) return
                    setSaving(true)
                    try {
                      await onRename?.(node.id, draft.trim())
                      setEditing(null)
                    } catch {
                      setFailed((items) => [...items, `rename:${node.id}`])
                    } finally {
                      setSaving(false)
                    }
                  }}
                >
                  <Input
                    aria-label={`Rename ${node.label}`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                  />
                  <Button type="submit" size="sm" disabled={saving}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  disabled={node.disabled}
                  tabIndex={-1}
                  className="w-full truncate text-start"
                  onClick={() => choose(node)}
                >
                  {node.label}
                </button>
              )}
            </div>
            {onRename && editing !== node.id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={node.disabled}
                onClick={() => {
                  setEditing(node.id)
                  setDraft(node.label)
                }}
              >
                Rename
              </Button>
            )}
            {onMove && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={node.disabled}
                  aria-label={`Move ${node.label} up`}
                  onClick={() => onMove(node.id, "up")}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={node.disabled}
                  aria-label={`Move ${node.label} down`}
                  onClick={() => onMove(node.id, "down")}
                >
                  ↓
                </Button>
              </>
            )}
          </div>
          {failed.includes(`rename:${node.id}`) && (
            <p role="alert" className="px-4 text-xs text-destructive">
              Rename failed. Try again.
            </p>
          )}
          {open.includes(node.id) && (
            <>
              {loading.includes(node.id) ? (
                <p role="status" className="px-6 py-2 text-xs">
                  Loading…
                </p>
              ) : failed.includes(node.id) ? (
                <p role="alert" className="px-6 py-2 text-xs">
                  Could not load this branch.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      void expand(node, true)
                    }}
                  >
                    Retry
                  </button>
                </p>
              ) : (
                nested &&
                children && (
                  <div role="group">{render(children, depth + 1)}</div>
                )
              )}
            </>
          )}
        </div>
      )
    })
  }
  return (
    <div
      ref={root}
      data-slot="tree"
      role="tree"
      aria-label={label}
      aria-multiselectable={
        multiple || (checkable && checkStrategy === "cascade") || undefined
      }
      className="overflow-auto rounded-lg border p-2"
      style={{ maxHeight: height }}
    >
      {virtualized ? (
        <div style={{ height: virtual.getTotalSize(), position: "relative" }}>
          {virtual.getVirtualItems().map((item) => {
            const entry = visibleNodes[item.index]!
            return (
              <div
                key={entry.node.id}
                ref={virtual.measureElement}
                data-index={item.index}
                style={{
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  transform: `translateY(${item.start}px)`,
                }}
              >
                {render([entry.node], entry.depth, false)}
              </div>
            )
          })}
        </div>
      ) : (
        render(nodes, 1)
      )}
    </div>
  )
}
