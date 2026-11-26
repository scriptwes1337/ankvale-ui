"use client"
import { type ComponentProps } from "react"
import { Button } from "@ankvale/ui/components/button"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export function ActionBar({
  open = true,
  count,
  onClear,
  label = "Selection actions",
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  open?: boolean
  count?: number
  onClear?: () => void
  label?: string
}) {
  if (!open) return null
  return (
    <div
      data-slot="action-bar"
      role="group"
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-surface",
        className
      )}
      {...props}
    >
      {count !== undefined && (
        <span className="me-2 text-sm tabular-nums" role="status">
          {count} selected
        </span>
      )}
      {children}
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}
