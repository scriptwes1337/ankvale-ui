"use client"

import { useState, useId, type ReactNode } from "react"
import { ListIcon, XIcon, CaretDownIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ankvale/ui/components/popover"
import { cn } from "@ankvale/ui/lib/utils"
import {
  surface,
  type NavLink,
  type LinkGroup,
} from "@ankvale/ui/blocks/shared"

export type NavbarProps = {
  brand: ReactNode
  brandHref?: string
  links: NavLink[]
  actions?: ReactNode
  className?: string
  label?: string
}
function NavContent({
  brand,
  brandHref = "/",
  links,
  actions,
  label = "Website",
  mega,
  className,
}: NavbarProps & { mega?: LinkGroup[] }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  return (
    <div className={cn("@container mx-auto max-w-6xl", className)}>
      <div className="flex min-h-18 items-center justify-between gap-5 px-5">
        <a
          href={brandHref}
          className="shrink-0 text-lg font-semibold tracking-tight"
        >
          {brand}
        </a>
        <nav aria-label={label} className="hidden items-center gap-6 @4xl:flex">
          {mega && (
            <Popover>
              <PopoverTrigger render={<Button variant="ghost" size="sm" />}>
                Explore
                <CaretDownIcon />
              </PopoverTrigger>
              <PopoverContent className="w-[min(32rem,calc(100vw-2rem))] p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {mega.map((group) => (
                    <div key={group.title}>
                      <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {group.title}
                      </p>
                      {group.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          className="mb-2 block rounded-lg p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <span className="text-sm font-medium">
                            {link.label}
                          </span>
                          {link.description && (
                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                              {link.description}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 @4xl:flex">{actions}</div>
        <Button
          variant="ghost"
          size="icon"
          className="@4xl:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(!open)}
        >
          {open ? <XIcon /> : <ListIcon />}
        </Button>
      </div>
      {open && (
        <nav
          id={menuId}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false)
          }}
          aria-label={`${label} mobile`}
          className={cn("grid gap-1 border-t p-4 @4xl:hidden", surface())}
        >
          {[...(mega?.flatMap((group) => group.links) ?? []), ...links].map(
            (link, i) => (
              <a
                key={`${link.href}-${i}`}
                href={link.href}
                className="rounded-md px-3 py-3 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <div className="mt-3 flex flex-wrap gap-2 border-t pt-4">
            {actions}
          </div>
        </nav>
      )}
    </div>
  )
}
export function NavbarStandard(props: NavbarProps) {
  return (
    <header
      data-slot="navbar-standard"
      className={cn("relative z-20 border-b", surface())}
    >
      <NavContent {...props} />
    </header>
  )
}
export function NavbarFloating(props: NavbarProps) {
  return (
    <header data-slot="navbar-floating" className="relative z-20 px-4 py-5">
      <div className={cn("mx-auto max-w-6xl rounded-2xl border", surface())}>
        <NavContent {...props} />
      </div>
    </header>
  )
}
export function NavbarMega(props: NavbarProps & { groups: LinkGroup[] }) {
  return (
    <header
      data-slot="navbar-mega"
      className={cn("relative z-20 border-b", surface())}
    >
      <NavContent {...props} mega={props.groups} />
    </header>
  )
}
