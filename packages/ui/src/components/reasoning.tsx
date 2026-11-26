"use client"
import { useEffect, useRef, type ReactNode } from "react"
import { CaretDownIcon } from "@phosphor-icons/react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { Loader } from "@ankvale/ui/components/loader"
import { cn } from "@ankvale/ui/lib/utils"
export type ReasoningStatus = "streaming" | "complete" | "stopped" | "error"
export function Reasoning({
  children,
  status = "complete",
  duration,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: {
  children: ReactNode
  status?: ReasoningStatus
  duration?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}) {
  const [expanded, setExpanded] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? status === "streaming",
    onChange: onOpenChange,
  })
  const previous = useRef(status)
  useEffect(() => {
    if (previous.current === "streaming" && status === "complete")
      setExpanded(false)
    previous.current = status
  }, [status, setExpanded])
  return (
    <details
      data-slot="reasoning"
      open={expanded}
      className={cn("rounded-lg border bg-card", className)}
      onToggle={(e) => {
        if (e.currentTarget.open !== expanded) setExpanded(e.currentTarget.open)
      }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
        {status === "streaming" && <Loader variant="dots" label="Reasoning" />}
        <span>
          {status === "streaming"
            ? "Reasoning"
            : status === "stopped"
              ? "Reasoning stopped"
              : status === "error"
                ? "Reasoning failed"
                : "Reasoning"}
          {duration ? ` · ${duration}` : ""}
        </span>
        <CaretDownIcon
          className={cn(
            "ms-auto size-3 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </summary>
      <div
        className="border-t p-4 text-sm text-muted-foreground"
        aria-busy={status === "streaming"}
      >
        {children}
      </div>
    </details>
  )
}
