import type { ComponentProps, CSSProperties } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type StackProps = ComponentProps<"div"> & {
  gap?: number
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between"
  wrap?: boolean
}
export function Stack({
  gap = 4,
  align = "stretch",
  justify = "start",
  className,
  style,
  ...props
}: StackProps) {
  return (
    <div
      data-slot="stack"
      className={cn("flex min-w-0 flex-col", className)}
      style={{
        gap: `${gap * 0.25}rem`,
        alignItems: align,
        justifyContent: justify === "between" ? "space-between" : justify,
        ...style,
      }}
      {...props}
    />
  )
}
export function Inline({
  gap = 3,
  align = "center",
  justify = "start",
  wrap = true,
  className,
  style,
  ...props
}: StackProps) {
  return (
    <div
      data-slot="inline"
      className={cn("flex min-w-0", className)}
      style={
        {
          gap: `${gap * 0.25}rem`,
          alignItems: align,
          justifyContent: justify === "between" ? "space-between" : justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
}
