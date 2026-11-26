"use client"
import type { ReactNode } from "react"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export type ChipProps = {
  children: ReactNode
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  onRemove?: () => void
  removeLabel?: string
  disabled?: boolean
  className?: string
}
export function Chip({
  children,
  selected,
  onSelectedChange,
  onRemove,
  removeLabel = "Remove",
  disabled,
  className,
}: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-xs",
        selected && "border-primary bg-primary/5 text-primary",
        disabled && "opacity-50",
        className
      )}
    >
      {onSelectedChange ? (
        <button
          type="button"
          aria-pressed={!!selected}
          disabled={disabled}
          onClick={() => onSelectedChange(!selected)}
          className="min-w-0 truncate rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {children}
        </button>
      ) : (
        <span className="min-w-0 truncate">{children}</span>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={onRemove}
          className="flex size-5 shrink-0 items-center justify-center rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
