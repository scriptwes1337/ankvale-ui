import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function AttachedGroup({
  label,
  orientation = "horizontal",
  className,
  ...props
}: ComponentProps<"div"> & {
  label: string
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="attached-group"
      role="group"
      aria-label={label}
      className={cn(
        "isolate flex [&>*]:relative [&>*]:min-w-0 [&>*]:rounded-none [&>*:focus-within]:z-10",
        orientation === "horizontal"
          ? "[&>*+*]:-ms-px [&>:first-child]:rounded-s-md [&>:last-child]:rounded-e-md"
          : "flex-col [&>*+*]:-mt-px [&>:first-child]:rounded-t-md [&>:last-child]:rounded-b-md",
        className
      )}
      {...props}
    />
  )
}
