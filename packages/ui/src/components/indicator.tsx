import type { ReactNode, ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function Indicator({
  children,
  label,
  count,
  max = 99,
  className,
}: {
  children: ReactNode
  label: string
  count?: number
  max?: number
  className?: string
}) {
  return (
    <span
      data-slot="indicator"
      className={cn("relative inline-flex", className)}
    >
      {children}
      <span
        aria-label={label}
        className="absolute -end-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground ring-2 ring-background"
      >
        {count === undefined ? (
          <span className="size-1.5 rounded-full bg-current" />
        ) : count > max ? (
          `${max}+`
        ) : (
          count
        )}
      </span>
    </span>
  )
}
export function Status({
  status = "neutral",
  children,
  className,
  ...props
}: ComponentProps<"span"> & {
  status?: "neutral" | "success" | "warning" | "error" | "info"
}) {
  return (
    <span
      data-slot="status"
      className={cn("inline-flex items-center gap-2 text-sm", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 rounded-full",
          {
            neutral: "bg-muted-foreground",
            success: "bg-green-600",
            warning: "bg-amber-600",
            error: "bg-destructive",
            info: "bg-primary",
          }[status]
        )}
      />
      {children}
    </span>
  )
}
