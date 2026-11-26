import type { ComponentProps, ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function PreviewFrame({
  kind = "browser",
  title = "Preview",
  children,
  className,
  ...props
}: ComponentProps<"figure"> & {
  kind?: "browser" | "window" | "phone"
  title?: ReactNode
}) {
  return (
    <figure
      data-slot="preview-frame"
      className={cn(
        "overflow-hidden rounded-lg border bg-background",
        kind === "phone" && "mx-auto max-w-[320px] rounded-[2rem] border-4",
        className
      )}
      {...props}
    >
      <figcaption
        className={cn(
          "flex items-center gap-3 border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground",
          kind === "phone" && "justify-center"
        )}
      >
        <span aria-hidden="true" className="flex gap-1">
          <i className="size-1.5 rounded-full bg-border" />
          <i className="size-1.5 rounded-full bg-border" />
          <i className="size-1.5 rounded-full bg-border" />
        </span>
        {title}
      </figcaption>
      <div className="min-w-0">{children}</div>
    </figure>
  )
}
