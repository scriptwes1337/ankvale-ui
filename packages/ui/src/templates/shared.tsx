"use client"
import { useState, type ReactNode } from "react"
import {
  AppLayout,
  AppLayoutSidebarToggle,
  AppLayoutAsideToggle,
} from "@ankvale/ui/components/app-layout"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Switch } from "@ankvale/ui/components/switch"
import { cn } from "@ankvale/ui/lib/utils"
export type TemplatePage = { id: string; label: string; count?: number }
export type TemplateConfiguration = {
  brand?: string
  pages?: TemplatePage[]
  active?: string
  onNavigate?: (id: string) => void
  title?: string
  actions?: ReactNode
  aside?: ReactNode
  sidebarFooter?: ReactNode
  account?: ReactNode
  renderPage?: (id: string) => ReactNode | undefined
  loading?: boolean
  error?: string
  onRetry?: () => void
}
export function TemplateShell({
  brand: initialBrand,
  pages: initialPages,
  active: initialActive,
  onNavigate: initialOnNavigate,
  title: initialTitle,
  actions: initialActions,
  aside: initialAside,
  sidebarFooter: initialSidebarFooter,
  children,
  className,
  configuration,
}: {
  brand: string
  pages: TemplatePage[]
  active: string
  onNavigate: (id: string) => void
  title: string
  actions?: ReactNode
  aside?: ReactNode
  sidebarFooter?: ReactNode
  children: ReactNode
  className?: string
  configuration?: TemplateConfiguration
}) {
  const brand = configuration?.brand ?? initialBrand
  const pages = configuration?.pages ?? initialPages
  const active = configuration?.active ?? initialActive
  const onNavigate = configuration?.onNavigate ?? initialOnNavigate
  const title = configuration?.title ?? initialTitle
  const actions = configuration?.actions ?? initialActions
  const aside = configuration?.aside ?? initialAside
  const sidebarFooter = configuration?.sidebarFooter ?? initialSidebarFooter
  const replacement = configuration?.renderPage?.(active)

  return (
    <AppLayout
      className={className}
      navigationKey={active}
      sidebarWidth={220}
      asideWidth={280}
      resizable
      sidebar={
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b px-4 text-sm font-semibold">
            <span className="flex size-6 items-center justify-center rounded border text-xs">
              A
            </span>
            {brand}
          </div>
          <nav aria-label={`${brand} navigation`} className="grid gap-1 p-3">
            {pages.map((page) => (
              <button
                type="button"
                key={page.id}
                aria-current={active === page.id ? "page" : undefined}
                onClick={() => onNavigate(page.id)}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-start text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active === page.id
                    ? "bg-sidebar-accent font-medium"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {page.label}
                {page.count !== undefined && (
                  <span className="ms-auto text-xs tabular-nums">
                    {page.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          {sidebarFooter}
          <div className="mt-auto border-t px-4 py-3 text-xs text-muted-foreground">
            {configuration?.account ?? "AL · Alex Lee"}
          </div>
        </div>
      }
      navbar={
        <>
          <AppLayoutSidebarToggle />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {title}
          </span>
          {actions}
          {aside && <AppLayoutAsideToggle />}
        </>
      }
      aside={aside}
    >
      {configuration?.loading ? (
        <p role="status" className="p-6 text-sm text-muted-foreground">
          Loading…
        </p>
      ) : configuration?.error ? (
        <div role="alert" className="space-y-3 p-6 text-sm text-destructive">
          {configuration.error}
          {configuration.onRetry && (
            <Button variant="outline" onClick={configuration.onRetry}>
              Retry
            </Button>
          )}
        </div>
      ) : replacement !== undefined ? (
        replacement
      ) : (
        children
      )}
    </AppLayout>
  )
}
export function TemplateSettings() {
  const [name, setName] = useState("Design team"),
    [email, setEmail] = useState("alex@example.com"),
    [notifications, setNotifications] = useState(true),
    [saved, setSaved] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSaved(true)
      }}
      className="max-w-lg space-y-5"
    >
      <h2 className="text-xl font-semibold">Settings</h2>
      <label className="grid gap-2 text-sm">
        Workspace name
        <Input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSaved(false)
          }}
        />
      </label>
      <label className="grid gap-2 text-sm">
        Email
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setSaved(false)
          }}
        />
      </label>
      <label className="flex items-center justify-between text-sm">
        Notifications
        <Switch checked={notifications} onCheckedChange={setNotifications} />
      </label>
      <Button type="submit">Save changes</Button>
      {saved && (
        <p role="status" className="text-sm text-success">
          Settings saved in this preview.
        </p>
      )}
    </form>
  )
}
export function TemplateHelp() {
  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Help</h2>
      {[
        {
          title: "Where is this data stored?",
          text: "Changes in this preview are kept in memory and reset when the page reloads.",
        },
        {
          title: "Can I connect a service?",
          text: "The template accepts data and action callbacks. Connect them to your application's services.",
        },
        {
          title: "How do I customize the interface?",
          text: "Edit the template source and the components it imports.",
        },
      ].map((item) => (
        <details key={item.title} className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            {item.title}
          </summary>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {item.text}
          </p>
        </details>
      ))}
    </div>
  )
}
export function downloadCsv(
  filename: string,
  rows: Record<string, string | number>[]
) {
  if (!rows.length) return
  const keys = Object.keys(rows[0]!)
  const escape = (value: unknown) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`
  const csv = [
    keys.map(escape).join(","),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(",")),
  ].join("\n")
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  )
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
