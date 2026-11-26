import type { ComponentProps } from "react"
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export function TrendChip({
  value,
  inverse = false,
  suffix = "%",
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & {
  value: number
  inverse?: boolean
  suffix?: string
}) {
  const positive = inverse ? value < 0 : value > 0
  const Icon = value === 0 ? MinusIcon : value > 0 ? ArrowUpIcon : ArrowDownIcon
  return (
    <span
      data-slot="trend-chip"
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        value === 0
          ? "bg-secondary text-muted-foreground"
          : positive
            ? "bg-success-surface text-success"
            : "bg-destructive/10 text-destructive",
        className
      )}
      {...props}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span>
        {value > 0 ? "+" : ""}
        {value}
        {suffix}
      </span>
    </span>
  )
}
