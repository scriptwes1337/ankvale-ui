import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function Container({
  size = "lg",
  className,
  ...props
}: ComponentProps<"div"> & { size?: "sm" | "md" | "lg" | "xl" | "full" }) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        {
          sm: "max-w-2xl",
          md: "max-w-4xl",
          lg: "max-w-6xl",
          xl: "max-w-[1440px]",
          full: "max-w-none",
        }[size],
        className
      )}
      {...props}
    />
  )
}
