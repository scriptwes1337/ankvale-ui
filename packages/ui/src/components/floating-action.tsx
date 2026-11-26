import type { ComponentProps } from "react"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"
/** Opt-in viewport placement; reserve clearance in the app shell. */
export function FloatingAction({
  label,
  className,
  placement = "inline",
  ...props
}: ComponentProps<typeof Button> & {
  label: string
  placement?: "inline" | "viewport"
}) {
  return (
    <Button
      type="button"
      data-slot="floating-action"
      aria-label={label}
      className={cn(
        "size-12 rounded-full shadow-md",
        placement === "viewport" &&
          "fixed end-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40",
        className
      )}
      {...props}
    />
  )
}
