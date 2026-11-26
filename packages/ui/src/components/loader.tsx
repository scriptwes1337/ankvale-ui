import type { ComponentProps } from "react"
import { Spinner } from "@ankvale/ui/components/spinner"
import { cn } from "@ankvale/ui/lib/utils"
export function Loader({
  variant = "spinner",
  label = "Loading",
  className,
  ...props
}: ComponentProps<"span"> & {
  variant?: "spinner" | "dots" | "bars"
  label?: string
}) {
  return (
    <span
      data-slot="loader"
      role="status"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {variant === "spinner" ? (
        <Spinner aria-hidden="true" />
      ) : (
        Array.from({ length: 3 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "animate-pulse bg-current motion-reduce:animate-none",
              variant === "dots" ? "size-1.5 rounded-full" : "h-4 w-1 rounded"
            )}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))
      )}
    </span>
  )
}
