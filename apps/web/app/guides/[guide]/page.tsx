import { readFile } from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { GuideContent } from "@/components/guide-content"
import { guides } from "@/lib/guides"
export function generateStaticParams() {
  return guides.map(({ id }) => ({ guide: id }))
}
export default async function Guide({
  params,
}: {
  params: Promise<{ guide: string }>
}) {
  const { guide: id } = await params
  const guide = guides.find((item) => item.id === id)
  if (!guide) notFound()
  const content = (
    await readFile(
      path.join(process.cwd(), "../../docs/agents", guide.file),
      "utf8"
    )
  )
    .replaceAll("(component-selection.md)", "(/guides/selection)")
    .replaceAll("(design-guide.md)", "(/guides/design)")
    .replaceAll("(motion-guide.md)", "(/guides/motion)")
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link href="/guides" className="text-muted-foreground">
            ← Guides
          </Link>
          <a href={`/api/guides/${id}.md`} className="text-primary">
            Markdown for agents →
          </a>
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
          <nav
            aria-label="Guides"
            className="flex flex-wrap gap-3 text-sm lg:sticky lg:top-6 lg:flex-col"
          >
            {guides.map((item) => (
              <Link
                key={item.id}
                href={`/guides/${item.id}`}
                aria-current={id === item.id ? "page" : undefined}
                className={
                  id === item.id
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <article className="max-w-3xl min-w-0">
            <GuideContent content={content} />
          </article>
        </div>
      </main>
    </>
  )
}
