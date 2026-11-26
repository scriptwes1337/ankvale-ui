import type { ComponentProps, ReactNode } from "react"
import { Motion } from "@ankvale/ui/components/motion"
import { cn } from "@ankvale/ui/lib/utils"

export type SectionProps = Omit<ComponentProps<"section">, "title"> & {
  eyebrow?: string
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}
export type NavLink = { label: string; href: string; description?: string }
export type LinkGroup = { title: string; links: NavLink[] }

export function surface() {
  return "bg-card border-border"
}
export function BlockSection({
  className,
  children,
  eyebrow: _eyebrow,
  title: _title,
  description: _description,
  actions: _actions,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("relative isolate px-6 py-16 sm:py-20", className)}
      {...props}
    >
      <Motion className="mx-auto max-w-6xl">{children}</Motion>
    </section>
  )
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: Pick<SectionProps, "eyebrow" | "title" | "description" | "actions"> & {
  className?: string
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-4 text-sm font-medium text-foreground">{eyebrow}</p>
      )}
      {title && (
        <h2 className="text-3xl leading-[1.1] font-bold tracking-[-0.035em] text-balance sm:text-5xl">
          {title}
        </h2>
      )}
      {description && (
        <div className="mt-4 text-base leading-7 text-pretty text-muted-foreground">
          {description}
        </div>
      )}
      {actions && (
        <div data-slot="section-actions" className="mt-6 flex flex-wrap gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}
