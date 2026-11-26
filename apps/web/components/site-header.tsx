"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  MoonIcon,
  SunIcon,
  ListIcon,
  CaretDownIcon,
  SquaresFourIcon,
  DeviceMobileIcon,
  StackIcon,
  LayoutIcon,
  ShapesIcon,
  WrenchIcon,
  BookOpenIcon,
  CodeIcon,
  PaletteIcon,
  CursorIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@ankvale/ui/components/dropdown-menu"
import { useSyncExternalStore } from "react"
import { BrandMark } from "@/components/brand-mark"
const links = [
  { href: "/playground", label: "Components", icon: SquaresFourIcon },
  { href: "/native", label: "Native", icon: DeviceMobileIcon },
  { href: "/blocks", label: "Blocks", icon: StackIcon },
  { href: "/templates", label: "Templates", icon: LayoutIcon },
  { href: "/icons", label: "Icons", icon: ShapesIcon },
  { href: "/docs", label: "Docs", icon: BookOpenIcon },
]
const tools = [
  { href: "/guides", label: "Design & agent guides", icon: BookOpenIcon },
  { href: "/tools", label: "Developer tools", icon: WrenchIcon },
  { href: "/design", label: "Design systems", icon: PaletteIcon },
  { href: "/builder", label: "Interface builder", icon: CursorIcon },
  { href: "/#install", label: "Installation", icon: CodeIcon },
]
const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  )
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)
  return (
    <header className="relative z-20 mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-6 lg:px-10">
      <a
        href="#main-content"
        className="fixed start-4 top-4 z-50 -translate-y-24 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <Link
        href="/"
        aria-label="Ankvale UI home"
        className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
      >
        <BrandMark />
        <span>
          Ankvale <span className="font-normal text-muted-foreground">UI</span>
        </span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="hidden items-center gap-5 text-sm font-medium xl:flex"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-primary aria-[current=page]:text-primary"
          >
            <link.icon aria-hidden="true" className="size-4" />
            {link.label}
          </Link>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <WrenchIcon aria-hidden="true" className="size-4" />
            Tools
            <CaretDownIcon aria-hidden="true" className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {tools.map((link) => (
              <DropdownMenuItem
                key={link.href}
                nativeButton={false}
                render={<Link href={link.href} />}
              >
                <link.icon aria-hidden="true" />
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle light and dark theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
        <div className="xl:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open navigation"
                />
              }
            >
              <ListIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[...links, ...tools].map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                    />
                  }
                >
                  <link.icon aria-hidden="true" />
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/#install" />}
          size="sm"
          className="hidden rounded-md px-4 sm:inline-flex"
        >
          Get started
        </Button>
      </div>
    </header>
  )
}
