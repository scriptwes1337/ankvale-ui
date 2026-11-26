import type { ComponentProps, ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function Widget({
  title,
  description,
  actions,
  footer,
  children,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  title: ReactNode
  description?: string
  actions?: ReactNode
  footer?: ReactNode
}) {
  return (
    <section
      data-slot="widget"
      className={cn("overflow-hidden rounded-lg border bg-card", className)}
      {...props}
    >
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </header>
      <div className="p-5">{children}</div>
      {footer && (
        <footer className="border-t px-5 py-3 text-xs text-muted-foreground">
          {footer}
        </footer>
      )}
    </section>
  )
}
