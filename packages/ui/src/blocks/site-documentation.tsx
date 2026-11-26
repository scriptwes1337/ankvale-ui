"use client"
import { useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import {
  FloatingToc,
  type TocHeading,
} from "@ankvale/ui/components/floating-toc"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { SiteEmpty } from "@ankvale/ui/blocks/site-shared"
export type DocumentationPage = {
  id: string
  title: string
  section: string
  body: ReactNode
  version?: string
  headings?: TocHeading[]
}
export type DocumentationShellProps = {
  title: string
  pages: DocumentationPage[]
  pageId?: string
  defaultPageId?: string
  onPageChange?: (id: string) => void
  versions?: string[]
  version?: string
  defaultVersion?: string
  onVersionChange?: (version: string) => void
}
export function DocumentationShell({
  title,
  pages,
  pageId,
  defaultPageId = pages[0]?.id ?? "",
  onPageChange,
  versions = [],
  version,
  defaultVersion = versions[0] ?? "",
  onVersionChange,
}: DocumentationShellProps) {
  const [query, setQuery] = useState("")
  const [current, setCurrent] = useControllableState({
    value: pageId,
    defaultValue: defaultPageId,
    onChange: onPageChange,
  })
  const [release, setRelease] = useControllableState({
    value: version,
    defaultValue: defaultVersion,
    onChange: onVersionChange,
  })
  const available = pages.filter(
    (page) => !page.version || !release || page.version === release
  )
  const filtered = available.filter((page) =>
    page.title.toLowerCase().includes(query.toLowerCase())
  )
  const active = available.find((page) => page.id === current) ?? available[0]
  const sections = [...new Set(filtered.map((page) => page.section))]
  return (
    <section
      data-slot="documentation-shell"
      className="bg-background px-6 py-10 text-foreground"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b pb-6">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {versions.length > 0 && (
            <label className="flex items-center gap-3 text-sm">
              Version
              <select
                aria-label="Documentation version"
                value={release}
                onChange={(e) => setRelease(e.target.value)}
                className="h-9 rounded-md border bg-card px-3"
              >
                {versions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}
        </header>
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)_200px]">
          <nav aria-label="Documentation sections" className="min-w-0">
            <label className="block space-y-2 text-sm font-medium">
              <span>Search documentation</span>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="mt-6 space-y-6">
              {sections.map((section) => (
                <div key={section}>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                    {section}
                  </h3>
                  <ul className="space-y-1">
                    {filtered
                      .filter((page) => page.section === section)
                      .map((page) => (
                        <li key={page.id}>
                          <button
                            type="button"
                            aria-current={
                              active?.id === page.id ? "page" : undefined
                            }
                            onClick={() => setCurrent(page.id)}
                            className={`w-full rounded px-3 py-2 text-start text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${active?.id === page.id ? "bg-accent text-primary" : "hover:bg-muted"}`}
                          >
                            {page.title}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
              {!filtered.length && (
                <p role="status" className="text-sm text-muted-foreground">
                  No matching pages.
                </p>
              )}
            </div>
          </nav>
          {active ? (
            <article key={active.id} className="min-w-0">
              <h3 className="mb-8 text-3xl font-semibold tracking-tight">
                {active.title}
              </h3>
              <div className="max-w-[70ch] space-y-5 leading-7 [&_h4]:scroll-mt-8 [&_h4]:pt-5 [&_h4]:text-xl [&_h4]:font-semibold [&_ul]:list-disc [&_ul]:ps-6">
                {active.body}
              </div>
            </article>
          ) : (
            <SiteEmpty>No documentation available for this version.</SiteEmpty>
          )}
          <aside>
            {active?.headings?.length ? (
              <FloatingToc headings={active.headings} />
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  )
}
