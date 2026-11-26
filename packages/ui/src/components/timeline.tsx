import type { ComponentProps, ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type TimelineEvent = {
  id: string
  title: string
  description?: ReactNode
  date?: string
  dateTime?: string
  icon?: ReactNode
  status?: "complete" | "current" | "pending"
}
export function Timeline({
  items,
  className,
  ...props
}: ComponentProps<"ol"> & { items: TimelineEvent[] }) {
  return (
    <ol data-slot="timeline" className={cn("space-y-0", className)} {...props}>
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <span
              className="absolute start-3 top-6 bottom-0 w-px bg-border"
              aria-hidden="true"
            />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "relative flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-xs",
              item.status === "current" && "border-primary text-primary",
              item.status === "complete" &&
                "border-primary bg-primary text-primary-foreground"
            )}
          >
            {item.icon ?? <span className="size-1.5 rounded-full bg-current" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="text-sm font-medium">{item.title}</h3>
              {item.date && (
                <time
                  dateTime={item.dateTime}
                  className="text-xs text-muted-foreground"
                >
                  {item.date}
                </time>
              )}
            </div>
            {item.description && (
              <div className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
