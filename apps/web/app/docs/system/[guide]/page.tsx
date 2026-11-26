import { readFile } from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { GuideContent } from "@/components/guide-content"
import { documentation, documentationLinks } from "@/lib/documentation"

export function generateStaticParams() {
  return documentation.map(({ id }) => ({ guide: id }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ guide: string }>
}) {
  const { guide } = await params
  const item = documentation.find((entry) => entry.id === guide)
  return {
    title: item ? `${item.title} — Ankvale UI` : "Documentation — Ankvale UI",
  }
}
export default async function DocumentationArticle({
  params,
}: {
  params: Promise<{ guide: string }>
}) {
  const { guide } = await params
  const item = documentation.find((entry) => entry.id === guide)
  if (!item) notFound()
  const content = documentationLinks(
    await readFile(path.join(process.cwd(), "../../docs", item.file), "utf8"),
    item.file
  )
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="mb-8 flex flex-wrap justify-between gap-4 text-sm">
          <Link href="/docs" className="text-muted-foreground">
            ← Documentation
          </Link>
          <a href={`/documentation/${item.file}`} className="text-primary">
            Read Markdown
          </a>
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Documentation"
            className="flex flex-wrap gap-3 text-sm lg:sticky lg:top-6 lg:flex-col"
          >
            {documentation.map((entry) => (
              <Link
                key={entry.id}
                href={`/docs/system/${entry.id}`}
                aria-current={entry.id === guide ? "page" : undefined}
                className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-primary"
              >
                {entry.title}
              </Link>
            ))}
          </nav>
          <article className="max-w-4xl min-w-0">
            <GuideContent content={content} />
          </article>
        </div>
      </main>
    </>
  )
}
