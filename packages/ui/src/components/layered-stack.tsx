import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
/** DOM reading order is preserved; later siblings overlap visually. */
export function LayeredStack({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="layered-stack"
      className={cn(
        "isolate grid [&>*]:col-start-1 [&>*]:row-start-1 [&>:nth-child(2)]:translate-x-2 [&>:nth-child(2)]:translate-y-2 [&>:nth-child(3)]:translate-x-4 [&>:nth-child(3)]:translate-y-4",
        className
      )}
      {...props}
    />
  )
}
