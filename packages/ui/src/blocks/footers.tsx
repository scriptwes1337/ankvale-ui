import type { ReactNode, ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
import {
  surface,
  type NavLink,
  type LinkGroup,
} from "@ankvale/ui/blocks/shared"

export type FooterProps = ComponentProps<"footer"> & {
  brand: ReactNode
  brandHref?: string
  description?: string
  legal: string
  links?: NavLink[]
}
export function FooterMinimal({
  brand,
  brandHref = "/",
  legal,
  links = [],
  className,
  description,
  ...props
}: FooterProps) {
  return (
    <footer
      data-slot="footer-minimal"
      className={cn("border-t px-6 py-7", surface(), className)}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
        <a href={brandHref} className="text-lg font-semibold tracking-tight">
          {brand}
        </a>
        <p className="text-xs text-muted-foreground">{legal}</p>
        <nav aria-label="Footer links" className="flex flex-wrap gap-5">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
export function FooterColumns({
  brand,
  brandHref = "/",
  description,
  legal,
  links = [],
  groups,
  className,
  ...props
}: FooterProps & { groups: LinkGroup[] }) {
  return (
    <footer
      data-slot="footer-columns"
      className={cn("border-t px-6 pt-12 pb-7", surface(), className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <a
              href={brandHref}
              className="text-xl font-semibold tracking-tight"
            >
              {brand}
            </a>
            {description && (
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-4 text-sm font-medium">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
          <span>{legal}</span>
          <div className="flex gap-5">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
export function FooterEditorial({
  brand,
  brandHref = "/",
  description,
  legal,
  links = [],
  className,
  ...props
}: FooterProps) {
  return (
    <footer
      data-slot="footer-editorial"
      className={cn(
        "overflow-hidden border-t px-6 pt-12 pb-7",
        surface(),
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-6xl">
        {description && (
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        )}
        <a
          href={brandHref}
          className="mt-8 block text-[clamp(4rem,15vw,12rem)] leading-none font-bold tracking-[-0.065em]"
        >
          {brand}
        </a>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t pt-6 text-xs text-muted-foreground">
          <span>{legal}</span>
          <nav aria-label="Footer links" className="flex flex-wrap gap-5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
