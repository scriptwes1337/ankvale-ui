import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function CircularProgress({
  value,
  max = 100,
  label,
  size = 40,
  strokeWidth = 4,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  value?: number
  max?: number
  label: string
  size?: number
  strokeWidth?: number
}) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100
  const current =
    value === undefined
      ? undefined
      : Math.min(limit, Math.max(0, Number.isFinite(value) ? value : 0))
  return (
    <div
      data-slot="circular-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={current}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        aria-hidden="true"
        className={cn(
          "-rotate-90",
          current === undefined && "animate-spin motion-reduce:animate-none"
        )}
      >
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={
            current === undefined ? 72 : 100 - (current / limit) * 100
          }
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] motion-reduce:transition-none"
        />
      </svg>
    </div>
  )
}
