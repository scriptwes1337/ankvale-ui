"use client"
import type { ComponentProps } from "react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export function EmojiReactionButton({
  emoji,
  count = 0,
  pressed,
  defaultPressed = false,
  onPressedChange,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children" | "onChange"> & {
  emoji: string
  count?: number
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}) {
  const [active, setActive] = useControllableState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  })
  return (
    <button
      type="button"
      data-slot="emoji-reaction-button"
      aria-label={`React ${emoji}`}
      aria-pressed={active}
      onClick={() => setActive(!active)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        active
          ? "border-primary bg-accent text-accent-foreground"
          : "bg-card hover:bg-secondary",
        className
      )}
      {...props}
    >
      <span aria-hidden="true">{emoji}</span>
      <span>{Math.max(0, count + (active ? 1 : 0))}</span>
    </button>
  )
}
