"use client"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useId,
  type ComponentProps,
  type ReactNode,
  type PointerEvent,
} from "react"
import { ListIcon, SidebarSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@ankvale/ui/components/sheet"
import { cn } from "@ankvale/ui/lib/utils"
import { useIsMobile } from "@ankvale/ui/hooks/use-mobile"
const LayoutContext = createContext<{
  toggleSidebar: () => void
  toggleAside: () => void
  sidebarOpen: boolean
  asideOpen: boolean
  sidebarId: string
  asideId: string
} | null>(null)
export type AppLayoutProps = ComponentProps<"div"> & {
  sidebar: ReactNode
  navbar?: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
  aside?: ReactNode
  sidebarWidth?: number
  asideWidth?: number
  resizable?: boolean
  storageKey?: string
  scrollMode?: "page" | "content"
  /** Close mobile panels when the active route or section changes. */
  navigationKey?: string
  sidebarLabel?: string
  asideLabel?: string
}
export function AppLayout({
  sidebar,
  navbar,
  toolbar,
  footer,
  aside,
  sidebarWidth = 240,
  asideWidth = 280,
  resizable = false,
  storageKey,
  scrollMode = "content",
  navigationKey,
  sidebarLabel = "Navigation",
  asideLabel = "Details",
  className,
  children,
  ...props
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true),
    [asideOpen, setAsideOpen] = useState(true),
    [mobileSidebar, setMobileSidebar] = useState(false),
    [mobileAside, setMobileAside] = useState(false)
  const [widths, setWidths] = useState({
    sidebar: sidebarWidth,
    aside: asideWidth,
  })
  const isMobile = useIsMobile()
  useEffect(() => {
    setMobileSidebar(false)
    setMobileAside(false)
  }, [navigationKey])
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebar(false)
      setMobileAside(false)
    }
  }, [isMobile])
  const sidebarId = useId(),
    asideId = useId()
  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null")
      if (
        saved &&
        Number.isFinite(saved.sidebar) &&
        Number.isFinite(saved.aside)
      )
        setWidths({
          sidebar: Math.min(480, Math.max(160, saved.sidebar)),
          aside: Math.min(480, Math.max(160, saved.aside)),
        })
    } catch {
      /* Unavailable storage should not prevent rendering. */
    }
  }, [storageKey])
  function save(next: typeof widths) {
    setWidths(next)
    if (storageKey)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        /* Layout remains usable without storage. */
      }
  }
  function resize(
    event: PointerEvent<HTMLDivElement>,
    side: "sidebar" | "aside"
  ) {
    event.currentTarget.setPointerCapture(event.pointerId)
    const start = event.clientX,
      original = widths[side],
      rtl = getComputedStyle(event.currentTarget).direction === "rtl"
    const target = event.currentTarget
    function move(e: globalThis.PointerEvent) {
      const delta =
        (e.clientX - start) * (side === "aside" ? -1 : 1) * (rtl ? -1 : 1)
      save({
        ...widths,
        [side]: Math.min(480, Math.max(160, original + delta)),
      })
    }
    function end() {
      target.removeEventListener("pointermove", move)
      target.removeEventListener("pointerup", end)
      target.removeEventListener("pointercancel", end)
    }
    target.addEventListener("pointermove", move)
    target.addEventListener("pointerup", end)
    target.addEventListener("pointercancel", end)
  }
  function handle(side: "sidebar" | "aside") {
    return resizable ? (
      <div
        role="separator"
        aria-label={`Resize ${side}`}
        aria-orientation="vertical"
        aria-valuemin={160}
        aria-valuemax={480}
        aria-valuenow={widths[side]}
        tabIndex={0}
        className="relative hidden w-px shrink-0 cursor-col-resize touch-none bg-border outline-none after:absolute after:inset-y-0 after:-start-1 after:w-2 hover:bg-primary focus-visible:bg-primary md:block"
        onPointerDown={(e) => resize(e, side)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault()
            save({
              ...widths,
              [side]: Math.min(
                480,
                Math.max(
                  160,
                  widths[side] +
                    (e.key === "ArrowRight" ? 10 : -10) *
                      (side === "aside" ? -1 : 1) *
                      (e.currentTarget.closest("[dir=rtl]") ? -1 : 1)
                )
              ),
            })
          }
        }}
      />
    ) : null
  }
  function toggleSidebar() {
    if (window.matchMedia("(min-width: 768px)").matches)
      setSidebarOpen((open) => !open)
    else setMobileSidebar((open) => !open)
  }
  function toggleAside() {
    if (window.matchMedia("(min-width: 768px)").matches)
      setAsideOpen((open) => !open)
    else setMobileAside((open) => !open)
  }
  return (
    <LayoutContext.Provider
      value={{
        toggleSidebar,
        toggleAside,
        sidebarOpen: isMobile ? mobileSidebar : sidebarOpen,
        asideOpen: isMobile ? mobileAside : asideOpen,
        sidebarId: isMobile ? `${sidebarId}-mobile` : sidebarId,
        asideId: isMobile ? `${asideId}-mobile` : asideId,
      }}
    >
      <div
        data-slot="app-layout"
        className={cn(
          "flex min-h-svh min-w-0 bg-background",
          scrollMode === "content" && "h-svh overflow-hidden",
          className
        )}
        {...props}
      >
        {sidebarOpen && (
          <>
            <aside
              id={sidebarId}
              aria-label={sidebarLabel}
              style={{ width: widths.sidebar }}
              className="hidden shrink-0 overflow-y-auto border-e md:block"
            >
              {sidebar}
            </aside>
            {handle("sidebar")}
          </>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          {navbar && (
            <header className="sticky top-0 z-20 flex min-h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
              {navbar}
            </header>
          )}
          {toolbar && (
            <div className="shrink-0 border-b bg-card px-4 py-2">{toolbar}</div>
          )}
          <div
            data-slot="app-layout-main"
            className={cn(
              "min-h-0 min-w-0 flex-1",
              scrollMode === "content" && "overflow-auto"
            )}
          >
            {children}
          </div>
          {footer && (
            <footer className="shrink-0 border-t bg-card px-4 py-3">
              {footer}
            </footer>
          )}
        </div>
        {aside && asideOpen && (
          <>
            {handle("aside")}
            <aside
              id={asideId}
              aria-label={asideLabel}
              style={{ width: widths.aside }}
              className="hidden shrink-0 overflow-y-auto border-s md:block"
            >
              {aside}
            </aside>
          </>
        )}
        <Sheet open={mobileSidebar} onOpenChange={setMobileSidebar}>
          <SheetContent
            id={`${sidebarId}-mobile`}
            side="left"
            className="max-w-xs p-0"
          >
            <SheetHeader className="border-b p-4">
              <SheetTitle>{sidebarLabel}</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-auto">{sidebar}</div>
          </SheetContent>
        </Sheet>
        {aside && (
          <Sheet open={mobileAside} onOpenChange={setMobileAside}>
            <SheetContent
              id={`${asideId}-mobile`}
              side="right"
              className="max-w-sm p-0"
            >
              <SheetHeader className="border-b p-4">
                <SheetTitle>{asideLabel}</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-auto">{aside}</div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </LayoutContext.Provider>
  )
}
export function AppLayoutSidebarToggle({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const context = useContext(LayoutContext)
  if (!context)
    throw new Error("AppLayoutSidebarToggle must be inside AppLayout")
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle navigation"
      aria-controls={context.sidebarId}
      aria-expanded={context.sidebarOpen}
      onClick={context.toggleSidebar}
      className={className}
      {...props}
    >
      <ListIcon />
    </Button>
  )
}
export function AppLayoutAsideToggle({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const context = useContext(LayoutContext)
  if (!context) throw new Error("AppLayoutAsideToggle must be inside AppLayout")
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle details"
      aria-controls={context.asideId}
      aria-expanded={context.asideOpen}
      onClick={context.toggleAside}
      className={className}
      {...props}
    >
      <SidebarSimpleIcon />
    </Button>
  )
}
