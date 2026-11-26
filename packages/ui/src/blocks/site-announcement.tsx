"use client"
import type { ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
export function AnnouncementBar({
  children,
  href,
  linkLabel = "Read more",
  dismissible = true,
  open,
  defaultOpen = true,
  onOpenChange,
}: {
  children: ReactNode
  href?: string
  linkLabel?: string
  dismissible?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [visible, setVisible] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  if (!visible) return null
  return (
    <aside
      data-slot="announcement-bar"
      aria-label="Announcement"
      className="border-b bg-primary/5 px-6 py-3"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <p className="text-sm">{children}</p>
        {href && (
          <a
            href={href}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {linkLabel} <span aria-hidden="true">→</span>
          </a>
        )}
        {dismissible && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Dismiss announcement"
            onClick={() => setVisible(false)}
          >
            ×
          </Button>
        )}
      </div>
    </aside>
  )
}
export function ReleaseHighlights({
  items,
  ...props
}: SectionProps & {
  items: {
    id: string
    title: string
    description: string
    href: string
    label?: string
    visual?: ReactNode
  }[]
}) {
  return (
    <BlockSection {...props} data-slot="release-highlights">
      <SectionHeading {...props} />
      <ul className="grid gap-8 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <article className="border-t pt-6">
              {item.visual && (
                <div className="mb-5 flex min-h-48 items-center justify-center rounded-lg border bg-muted/30 p-6">
                  {item.visual}
                </div>
              )}
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <a
                href={item.href}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                {item.label ?? "Explore update"} →
              </a>
            </article>
          </li>
        ))}
      </ul>
    </BlockSection>
  )
}
