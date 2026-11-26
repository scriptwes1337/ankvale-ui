"use client"
import {
  SiteCollectionState,
  type SiteCollectionStatus,
} from "@ankvale/ui/blocks/site-shared"
import { useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import {
  SiteFilter,
  SiteEmpty,
  SiteBadge,
  useSiteSubmission,
  SubmissionFeedback,
} from "@ankvale/ui/blocks/site-shared"
export type ProcessStep = {
  id: string
  title: string
  description: string
  visual?: ReactNode
}
export function HowItWorks({
  steps,
  ...props
}: SectionProps & { steps: ProcessStep[] }) {
  const [index, setIndex] = useState(0)
  const active = steps[Math.min(index, Math.max(0, steps.length - 1))]
  return (
    <BlockSection {...props} data-slot="how-it-works">
      <SectionHeading {...props} />
      <div className="grid gap-10 md:grid-cols-2">
        <ol className="divide-y border-y">
          {steps.map((step, i) => (
            <li key={step.id}>
              <button
                type="button"
                aria-pressed={active?.id === step.id}
                onClick={() => setIndex(i)}
                className="flex w-full gap-4 rounded py-5 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={
                    active?.id === step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-semibold">{step.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        {active ? (
          <div
            aria-live="polite"
            className="flex min-h-64 items-center justify-center rounded-lg border bg-muted/30 p-8"
          >
            {active.visual ?? (
              <div>
                <p className="text-5xl font-semibold tracking-tight text-primary">
                  {String(steps.indexOf(active) + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-2xl font-semibold">{active.title}</h3>
              </div>
            )}
          </div>
        ) : (
          <SiteEmpty>No process steps available.</SiteEmpty>
        )}
      </div>
    </BlockSection>
  )
}
export type Integration = {
  id: string
  name: string
  description: string
  category: string
  href: string
  icon?: ReactNode
  status?: string
}
export function IntegrationDirectory({
  integrations,
  loading,
  error,
  onRetry,
  ...props
}: SectionProps & SiteCollectionStatus & { integrations: Integration[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const filtered = integrations.filter(
    (item) =>
      (!category || item.category === category) &&
      `${item.name} ${item.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  return (
    <BlockSection
      {...props}
      aria-busy={loading}
      data-slot="integration-directory"
    >
      <SectionHeading {...props} />
      <SiteCollectionState loading={loading} error={error} onRetry={onRetry} />
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_220px]">
        <label className="space-y-2 text-sm font-medium">
          <span>Find an integration</span>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <SiteFilter
          label="Category"
          value={category}
          onChange={setCategory}
          options={[...new Set(integrations.map((item) => item.category))]}
        />
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className="block h-full rounded-lg border p-6 transition-colors outline-none hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.icon && (
                <span aria-hidden="true" className="mb-5 block text-3xl">
                  {item.icon}
                </span>
              )}
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-4">
                <SiteBadge>{item.status ?? item.category}</SiteBadge>
              </div>
            </a>
          </li>
        ))}
      </ul>
      {!loading && !error && !filtered.length && (
        <SiteEmpty>No integrations match your search.</SiteEmpty>
      )}
    </BlockSection>
  )
}
export function IntegrationDetail({
  integration,
  children,
  actions,
  ...props
}: SectionProps & { integration: Integration; children: ReactNode }) {
  return (
    <BlockSection {...props} data-slot="integration-detail">
      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <article>
          <p className="mb-3 text-sm text-primary">{integration.category}</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            {integration.name}
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            {integration.description}
          </p>
          <div className="mt-8 max-w-[70ch] space-y-5 leading-7">
            {children}
          </div>
        </article>
        <aside className="h-fit rounded-lg border p-6">
          <h3 className="font-semibold">Get started</h3>
          {integration.status && (
            <p className="mt-3 text-sm text-muted-foreground">
              {integration.status}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {actions ?? (
              <a
                href={integration.href}
                className="text-sm text-primary hover:underline"
              >
                Read setup guide →
              </a>
            )}
          </div>
        </aside>
      </div>
    </BlockSection>
  )
}
export type ComparisonColumn = { id: string; label: string; featured?: boolean }
export function ProductComparison({
  columns,
  rows,
  migration,
  ...props
}: SectionProps & {
  columns: ComparisonColumn[]
  rows: { id: string; label: string; values: Record<string, ReactNode> }[]
  migration?: ReactNode
}) {
  return (
    <BlockSection {...props} data-slot="product-comparison">
      <SectionHeading {...props} />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[520px] text-start text-sm">
          <caption className="sr-only">
            {typeof props.title === "string"
              ? props.title
              : "Product comparison"}
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-4 text-start font-medium">
                Capability
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`p-4 text-start font-medium ${column.featured ? "bg-primary/5 text-primary" : ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                <th scope="row" className="p-4 text-start font-medium">
                  {row.label}
                </th>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`p-4 ${column.featured ? "bg-primary/5" : ""}`}
                  >
                    {row.values[column.id] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {migration && (
        <div className="mt-10 max-w-[70ch] space-y-4 text-sm leading-7">
          {migration}
        </div>
      )}
    </BlockSection>
  )
}
export type ReleaseEntry = {
  id: string
  version: string
  title: string
  date: string
  dateLabel: string
  category: string
  body: ReactNode
  href?: string
}
export function ReleaseFeed({
  releases,
  loading,
  error,
  onRetry,
  ...props
}: SectionProps & SiteCollectionStatus & { releases: ReleaseEntry[] }) {
  const [category, setCategory] = useState("")
  const filtered = releases.filter(
    (item) => !category || item.category === category
  )
  return (
    <BlockSection {...props} aria-busy={loading} data-slot="release-feed">
      <SectionHeading {...props} />
      <SiteCollectionState loading={loading} error={error} onRetry={onRetry} />
      <div className="mb-8 max-w-xs">
        <SiteFilter
          label="Release type"
          options={[...new Set(releases.map((item) => item.category))]}
          value={category}
          onChange={setCategory}
        />
      </div>
      <ol className="space-y-10">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="grid gap-5 border-t pt-6 md:grid-cols-[180px_1fr]"
          >
            <div>
              <SiteBadge>{item.version}</SiteBadge>
              <p className="mt-3 text-xs text-muted-foreground">
                <time dateTime={item.date}>{item.dateLabel}</time>
              </p>
            </div>
            <article>
              <h3 className="text-2xl font-semibold tracking-tight">
                {item.href ? (
                  <a href={item.href} className="hover:underline">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h3>
              <div className="mt-4 max-w-[70ch] space-y-3 text-sm leading-7 text-muted-foreground">
                {item.body}
              </div>
            </article>
          </li>
        ))}
      </ol>
      {!loading && !error && !filtered.length && (
        <SiteEmpty>No releases in this category.</SiteEmpty>
      )}
    </BlockSection>
  )
}
export type RoadmapItem = {
  id: string
  title: string
  description: string
  status: "planned" | "in-progress" | "shipped"
  votes?: number
  voted?: boolean
}
function RoadmapCard({
  item,
  onVote,
}: {
  item: RoadmapItem
  onVote?: (id: string) => void | Promise<void>
}) {
  const submission = useSiteSubmission()
  return (
    <article className="rounded-lg border bg-card p-5">
      <h4 className="font-semibold">{item.title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
      {onVote && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={item.voted ?? false}
          disabled={submission.status === "pending"}
          className="mt-4"
          onClick={() => submission.run(() => onVote(item.id))}
        >
          {item.voted ? "Voted" : "Vote"}
          {item.votes !== undefined ? ` · ${item.votes}` : ""}
        </Button>
      )}
      <SubmissionFeedback
        status={submission.status}
        success="Vote saved."
        error="Your vote could not be saved. Try again."
      />
    </article>
  )
}
export function Roadmap({
  items,
  onVote,
  ...props
}: SectionProps & {
  items: RoadmapItem[]
  onVote?: (id: string) => void | Promise<void>
}) {
  return (
    <BlockSection {...props} data-slot="roadmap">
      <SectionHeading {...props} />
      <div className="grid gap-6 md:grid-cols-3">
        {(["planned", "in-progress", "shipped"] as const).map((status) => (
          <section key={status}>
            <h3 className="mb-4 text-sm font-semibold">
              {
                {
                  planned: "Planned",
                  "in-progress": "In progress",
                  shipped: "Shipped",
                }[status]
              }
            </h3>
            <div className="space-y-4">
              {items
                .filter((item) => item.status === status)
                .map((item) => (
                  <RoadmapCard key={item.id} item={item} onVote={onVote} />
                ))}
              {!items.some((item) => item.status === status) && (
                <p className="text-xs text-muted-foreground">No items.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </BlockSection>
  )
}
