"use client"
import {
  SiteCollectionState,
  type SiteCollectionStatus,
} from "@ankvale/ui/blocks/site-shared"
import { useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Image } from "@ankvale/ui/components/image"
import {
  FloatingToc,
  type TocHeading,
} from "@ankvale/ui/components/floating-toc"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import {
  SiteFilter,
  SiteEmpty,
  SiteBadge,
} from "@ankvale/ui/blocks/site-shared"
export type EditorialPost = {
  id: string
  title: string
  summary: string
  category: string
  href: string
  date: string
  dateLabel: string
  author: string
  image?: { src: string; alt: string }
}
export function BlogIndex({
  posts,
  layout = "grid",
  loading,
  error,
  onRetry,
  ...props
}: SectionProps &
  SiteCollectionStatus & { posts: EditorialPost[]; layout?: "grid" | "list" }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const filtered = posts.filter(
    (post) =>
      (!category || post.category === category) &&
      `${post.title} ${post.summary}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  return (
    <BlockSection {...props} aria-busy={loading} data-slot="blog-index">
      <SectionHeading {...props} />
      <SiteCollectionState loading={loading} error={error} onRetry={onRetry} />
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_220px]">
        <label className="space-y-2 text-sm font-medium">
          <span>Search articles</span>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <SiteFilter
          label="Category"
          value={category}
          onChange={setCategory}
          options={[...new Set(posts.map((post) => post.category))]}
        />
      </div>
      <ul
        className={
          layout === "grid"
            ? "grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
            : "divide-y border-y"
        }
      >
        {filtered.map((post) => (
          <li key={post.id} className={layout === "list" ? "py-7" : ""}>
            <article>
              {post.image && (
                <a href={post.href} tabIndex={-1} aria-hidden="true">
                  <Image
                    {...post.image}
                    className="mb-5 aspect-[16/10] w-full rounded-lg"
                  />
                </a>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <SiteBadge>{post.category}</SiteBadge>
                <time dateTime={post.date}>{post.dateLabel}</time>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                <a
                  href={post.href}
                  className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {post.title}
                </a>
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {post.summary}
              </p>
              <p className="mt-4 text-xs">{post.author}</p>
            </article>
          </li>
        ))}
      </ul>
      {!loading && !error && !filtered.length && (
        <SiteEmpty>No articles match your search.</SiteEmpty>
      )}
    </BlockSection>
  )
}
export function ArticleLayout({
  post,
  headings = [],
  related = [],
  children,
  ...props
}: SectionProps & {
  post: EditorialPost
  headings?: TocHeading[]
  related?: EditorialPost[]
  children: ReactNode
}) {
  return (
    <BlockSection {...props} data-slot="article-layout">
      <header className="max-w-3xl">
        <SiteBadge>{post.category}</SiteBadge>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          {post.title}
        </h2>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {post.summary}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          {post.author} · <time dateTime={post.date}>{post.dateLabel}</time>
        </p>
      </header>
      {post.image && (
        <Image
          {...post.image}
          className="mt-10 aspect-[2/1] w-full rounded-lg"
        />
      )}
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_240px]">
        <article className="max-w-[70ch] space-y-5 leading-8 [&_h3]:scroll-mt-8 [&_h3]:pt-6 [&_h3]:text-2xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:ps-6">
          {children}
        </article>
        {headings.length > 0 && (
          <aside>
            <FloatingToc headings={headings} />
          </aside>
        )}
      </div>
      {related.length > 0 && (
        <section className="mt-16 border-t pt-8" aria-label="Related articles">
          <h3 className="text-xl font-semibold">Keep reading</h3>
          <ul className="mt-5 grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {item.title}
                </a>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </BlockSection>
  )
}
export type CaseStudy = {
  id: string
  customer: string
  title: string
  summary: string
  industry: string
  href: string
  image?: { src: string; alt: string }
  outcomes: { label: string; value: string; source?: string }[]
}
export function CaseStudyIndex({
  stories,
  loading,
  error,
  onRetry,
  ...props
}: SectionProps & SiteCollectionStatus & { stories: CaseStudy[] }) {
  const [industry, setIndustry] = useState("")
  const filtered = stories.filter(
    (story) => !industry || story.industry === industry
  )
  return (
    <BlockSection {...props} aria-busy={loading} data-slot="case-study-index">
      <SectionHeading {...props} />
      <SiteCollectionState loading={loading} error={error} onRetry={onRetry} />
      <div className="mb-8 max-w-xs">
        <SiteFilter
          label="Industry"
          options={[...new Set(stories.map((story) => story.industry))]}
          value={industry}
          onChange={setIndustry}
        />
      </div>
      <ul className="grid gap-8 md:grid-cols-2">
        {filtered.map((story) => (
          <li key={story.id}>
            <article className="border-t pt-6">
              {story.image && (
                <Image
                  {...story.image}
                  className="mb-5 aspect-[16/9] w-full rounded-lg"
                />
              )}
              <p className="text-sm font-medium">{story.customer}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                <a
                  href={story.href}
                  className="underline-offset-4 hover:underline"
                >
                  {story.title}
                </a>
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {story.summary}
              </p>
            </article>
          </li>
        ))}
      </ul>
      {!loading && !error && !filtered.length && (
        <SiteEmpty>No customer stories available.</SiteEmpty>
      )}
    </BlockSection>
  )
}
export function CaseStudyStory({
  story,
  children,
  related = [],
  ...props
}: SectionProps & {
  story: CaseStudy
  children: ReactNode
  related?: CaseStudy[]
}) {
  return (
    <BlockSection {...props} data-slot="case-study-story">
      <p className="mb-3 text-sm text-primary">
        {story.customer} · {story.industry}
      </p>
      <SectionHeading title={story.title} description={story.summary} />
      {story.image && (
        <Image
          {...story.image}
          className="mb-10 aspect-[2/1] w-full rounded-lg"
        />
      )}
      <dl className="mb-12 grid gap-6 border-y py-8 sm:grid-cols-3">
        {story.outcomes.map((outcome) => (
          <div key={outcome.label}>
            <dt className="text-sm text-muted-foreground">{outcome.label}</dt>
            <dd className="mt-2 text-3xl font-semibold">{outcome.value}</dd>
            {outcome.source && (
              <p className="mt-2 text-xs text-muted-foreground">
                {outcome.source}
              </p>
            )}
          </div>
        ))}
      </dl>
      <article className="max-w-[70ch] space-y-5 leading-8 [&_h3]:text-2xl [&_h3]:font-semibold">
        {children}
      </article>
      {related.length > 0 && (
        <nav className="mt-12 border-t pt-6" aria-label="Related case studies">
          {related.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="block py-2 text-sm text-primary hover:underline"
            >
              {item.customer}: {item.title} →
            </a>
          ))}
        </nav>
      )}
    </BlockSection>
  )
}
