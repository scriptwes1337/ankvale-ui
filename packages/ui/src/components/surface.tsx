import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function Surface({
  elevation = "none",
  bordered = false,
  className,
  ...props
}: ComponentProps<"div"> & {
  elevation?: "none" | "raised" | "overlay"
  bordered?: boolean
}) {
  return (
    <div
      data-slot="surface"
      className={cn(
        "rounded-lg bg-card text-card-foreground",
        bordered && "border",
        { none: "", raised: "shadow-sm", overlay: "shadow-lg" }[elevation],
        className
      )}
      {...props}
    />
  )
}
export function Box(props: ComponentProps<"div">) {
  return <div data-slot="box" {...props} />
}
