"use client"
import type { ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type BottomNavigationItem = {
  id: string
  label: string
  href: string
  icon?: ReactNode
}
/** Place in an app-shell footer slot; fixed positioning remains the shell's responsibility. */
export function BottomNavigation({
  items,
  current,
  label = "Main navigation",
  className,
  onNavigate,
}: {
  items: BottomNavigationItem[]
  current: string
  label?: string
  className?: string
  onNavigate?: (id: string) => void
}) {
  return (
    <nav
      data-slot="bottom-navigation"
      aria-label={label}
      className={cn(
        "flex justify-around gap-1 border-t bg-background px-2 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          onClick={
            onNavigate
              ? (event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  )
                    return
                  event.preventDefault()
                  onNavigate(item.id)
                }
              : undefined
          }
          aria-current={current === item.id ? "page" : undefined}
          className={cn(
            "flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
            current === item.id
              ? "text-primary"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <span aria-hidden="true" className="text-lg">
            {item.icon}
          </span>
          {item.label}
        </a>
      ))}
    </nav>
  )
}
