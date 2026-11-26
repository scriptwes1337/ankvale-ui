import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
/** A solid-color pulse respects Ankvale's no-gradient design and reduced motion. */
export function TextShimmer({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="text-shimmer"
      className={cn(
        "animate-pulse text-muted-foreground motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}
