"use client"
import { useRef, useState, type KeyboardEvent } from "react"
import {
  CaretRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type FileTreeNode = {
  id: string
  name: string
  children?: FileTreeNode[]
  disabled?: boolean
}
export type FileTreeProps = {
  nodes: FileTreeNode[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  label?: string
  className?: string
}
export function FileTree({
  nodes,
  value,
  defaultValue = "",
  onValueChange,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  label = "Files",
  className,
}: FileTreeProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [open, setOpen] = useControllableState({
    value: expanded,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  })
  const [focused, setFocused] = useState(nodes[0]?.id ?? "")
  const visibleIds: string[] = []
  function visit(items: FileTreeNode[]) {
    for (const node of items) {
      if (!node.disabled) visibleIds.push(node.id)
      if (node.children && open.includes(node.id)) visit(node.children)
    }
  }
  visit(nodes)
  const tabStop = visibleIds.includes(focused) ? focused : visibleIds[0]
  const root = useRef<HTMLUListElement>(null)
  function toggle(id: string) {
    setOpen(open.includes(id) ? open.filter((v) => v !== id) : [...open, id])
  }
  function key(event: KeyboardEvent<HTMLLIElement>, node: FileTreeNode) {
    event.stopPropagation()
    const row = event.currentTarget
    const rows = Array.from(
      root.current?.querySelectorAll<HTMLElement>(
        '[role="treeitem"]:not([aria-disabled="true"])'
      ) ?? []
    )
    const index = rows.indexOf(row)
    let target: HTMLElement | undefined
    if (event.key === "ArrowDown")
      target = rows[Math.min(index + 1, rows.length - 1)]
    else if (event.key === "ArrowUp") target = rows[Math.max(0, index - 1)]
    else if (event.key === "Home") target = rows[0]
    else if (event.key === "End") target = rows.at(-1)
    else if (event.key === "ArrowRight" && node.children) {
      if (!open.includes(node.id)) toggle(node.id)
      else target = rows[index + 1]
    } else if (event.key === "ArrowLeft") {
      if (node.children && open.includes(node.id)) toggle(node.id)
      else
        target =
          row.parentElement?.closest<HTMLElement>('[role="treeitem"]') ??
          undefined
    } else if (event.key === "Enter" || event.key === " ") {
      if (node.disabled) return
      setSelected(node.id)
      if (node.children) toggle(node.id)
    } else return
    event.preventDefault()
    target?.focus()
  }
  function render(items: FileTreeNode[], depth = 1) {
    return items.map((node) => {
      const isOpen = open.includes(node.id)
      const Icon = node.children
        ? isOpen
          ? FolderOpenIcon
          : FolderIcon
        : FileIcon
      return (
        <li
          key={node.id}
          role="treeitem"
          aria-level={depth}
          aria-expanded={node.children ? isOpen : undefined}
          aria-selected={selected === node.id}
          aria-disabled={node.disabled || undefined}
          tabIndex={!node.disabled && tabStop === node.id ? 0 : -1}
          onFocus={(event) => {
            event.stopPropagation()
            setFocused(node.id)
          }}
          onKeyDown={(event) => key(event, node)}
          className="outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-ring"
          onClick={(event) => {
            event.stopPropagation()
            if (node.disabled) return
            setSelected(node.id)
            if (node.children) toggle(node.id)
          }}
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-md py-1.5 pe-3 text-sm",
              selected === node.id
                ? "bg-accent text-accent-foreground"
                : "hover:bg-secondary",
              node.disabled && "opacity-50"
            )}
            style={{ paddingInlineStart: depth * 12 }}
          >
            {node.children ? (
              <CaretRightIcon
                className={cn(
                  "size-3 shrink-0 transition-transform",
                  isOpen && "rotate-90 rtl:-rotate-90"
                )}
                aria-hidden="true"
              />
            ) : (
              <span className="w-3" />
            )}
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{node.name}</span>
          </div>
          {node.children && isOpen && (
            <ul role="group">{render(node.children, depth + 1)}</ul>
          )}
        </li>
      )
    })
  }
  return (
    <ul
      ref={root}
      data-slot="file-tree"
      role="tree"
      aria-label={label}
      className={cn("min-w-0 rounded-lg border bg-card p-2", className)}
    >
      {render(nodes)}
    </ul>
  )
}
