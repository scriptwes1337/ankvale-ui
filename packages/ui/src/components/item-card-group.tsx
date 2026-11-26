import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function ItemCardGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="item-card-group"
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      {...props}
    />
  )
}
