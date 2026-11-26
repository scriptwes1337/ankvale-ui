"use client"
import type { ReactNode } from "react"
import { XIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"
export type NotificationProps = {
  title: string
  description?: ReactNode
  actions?: ReactNode
  onDismiss?: () => void
  urgent?: boolean
  className?: string
}
/** Persistent until its owner dismisses it; no automatic time limit. */
export function Notification({
  title,
  description,
  actions,
  onDismiss,
  urgent = false,
  className,
}: NotificationProps) {
  return (
    <section
      data-slot="notification"
      role={urgent ? "alert" : "status"}
      className={cn(
        "relative rounded-lg border bg-popover p-4 text-popover-foreground shadow-sm",
        className
      )}
    >
      <div className="pe-8">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Dismiss ${title}`}
          className="absolute end-2 top-2"
          onClick={onDismiss}
        >
          <XIcon aria-hidden="true" />
        </Button>
      )}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </section>
  )
}
