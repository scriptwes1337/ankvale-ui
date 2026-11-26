import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { guides } from "@/lib/guides"
export const metadata = { title: "Design & agent guides — Ankvale UI" }
export default function Guides() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">
          Design & agent guides
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Choose the right composition, follow the design rules, and build with
          the actual component APIs.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.id}`}
              className="rounded-lg border p-6 transition-colors outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h2 className="text-lg font-semibold">{guide.title} →</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-primary">
          <a href="/downloads/ankvale-agent-guide.zip" download>
            Download agent instructions →
          </a>
          <Link href="/docs">Project documentation →</Link>
          <a href="/llms.txt">llms.txt →</a>
          <Link href="/tools">Skills & MCP setup →</Link>
        </div>
      </main>
    </>
  )
}
