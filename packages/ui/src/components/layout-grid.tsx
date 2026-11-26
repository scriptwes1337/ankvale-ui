import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
/** Auto-fit columns preserve responsive layouts without viewport assumptions. */
export function LayoutGrid({
  minColumnWidth = 240,
  gap = 6,
  className,
  style,
  ...props
}: ComponentProps<"div"> & { minColumnWidth?: number; gap?: number }) {
  return (
    <div
      data-slot="layout-grid"
      className={cn("grid min-w-0", className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${Math.max(1, minColumnWidth)}px),1fr))`,
        gap: `${gap * 0.25}rem`,
        ...style,
      }}
      {...props}
    />
  )
}
