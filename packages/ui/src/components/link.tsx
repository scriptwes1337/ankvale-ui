import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function Link({
  className,
  target,
  rel,
  children,
  external = false,
  ...props
}: ComponentProps<"a"> & { external?: boolean }) {
  return (
    <a
      data-slot="link"
      target={external ? "_blank" : target}
      rel={
        rel ??
        (external || target === "_blank" ? "noopener noreferrer" : undefined)
      }
      className={cn(
        "rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      {children}
      {external && (
        <>
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  )
}
