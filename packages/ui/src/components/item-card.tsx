import type { ReactNode, ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export function ItemCard({
  title,
  description,
  media,
  actions,
  footer,
  children,
  className,
  ...props
}: Omit<ComponentProps<"article">, "title"> & {
  title: ReactNode
  description?: ReactNode
  media?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
}) {
  return (
    <article
      data-slot="item-card"
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border bg-card",
        className
      )}
      {...props}
    >
      {media && <div className="border-b">{media}</div>}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <div className="mt-1 text-sm text-muted-foreground">
                {description}
              </div>
            )}
          </div>
          {actions}
        </div>
        {children}
      </div>
      {footer && (
        <footer className="border-t px-4 py-3 text-xs text-muted-foreground">
          {footer}
        </footer>
      )}
    </article>
  )
}
