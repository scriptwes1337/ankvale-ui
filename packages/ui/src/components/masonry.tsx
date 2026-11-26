import type { ComponentProps, ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
/** CSS columns use column-major DOM reading order, not reordered visual rows. */
export function Masonry({
  items,
  minColumnWidth = 240,
  gap = 16,
  className,
  style,
  ...props
}: ComponentProps<"div"> & {
  items: { id: string; content: ReactNode }[]
  minColumnWidth?: number
  gap?: number
}) {
  return (
    <div
      data-slot="masonry"
      className={cn("w-full", className)}
      style={{ columnWidth: minColumnWidth, columnGap: gap, ...style }}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="break-inside-avoid"
          style={{ marginBottom: gap }}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
