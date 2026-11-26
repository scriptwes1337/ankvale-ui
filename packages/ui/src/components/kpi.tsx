import type { ComponentProps, ReactNode } from "react"
import { TrendChip } from "@ankvale/ui/components/trend-chip"
import { cn } from "@ankvale/ui/lib/utils"
export function Kpi({
  label,
  value,
  change,
  description,
  children,
  className,
  ...props
}: Omit<ComponentProps<"article">, "title"> & {
  label: string
  value: ReactNode
  change?: number
  description?: string
}) {
  return (
    <article
      data-slot="kpi"
      className={cn("min-w-0 rounded-lg border bg-card p-5", className)}
      {...props}
    >
      <h3 className="text-sm text-muted-foreground">{label}</h3>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {change !== undefined && <TrendChip value={change} />}
      </div>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </article>
  )
}
