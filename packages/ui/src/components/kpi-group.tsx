import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function KpiGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="kpi-group"
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      {...props}
    />
  )
}
