"use client"
import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function PressableFeedback({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="pressable-feedback"
      className={cn(
        "inline-flex items-center justify-center rounded-md border bg-card px-4 py-2 text-sm transition-[transform,background-color] outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}
