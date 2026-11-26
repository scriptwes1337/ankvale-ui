import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { documentation } from "@/lib/documentation"

export const metadata = {
  title: "Documentation — Ankvale UI",
  description:
    "Install and customize Ankvale UI, explore supported technologies, and learn about licensing and attribution.",
}

export default function DocumentationPage() {
  const groups = [...new Set(documentation.map((item) => item.group))]
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-tight">Documentation</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Understand the system, build your first screen, customize it for your
          product, and review the technologies and licenses behind it.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Install through the source registry today. A standalone npm package
          and setup CLI are upcoming.
        </p>
        <div className="mt-6 flex flex-wrap gap-5 text-sm text-primary">
          <a href="/downloads/ankvale-documentation.zip" download>
            Download documentation
          </a>
          <Link href="/playground">Component APIs & previews</Link>
          <Link href="/guides">Design & agent guides</Link>
        </div>
        {groups.map((group) => (
          <section key={group} className="mt-12">
            <h2 className="mb-5 text-xl font-semibold">{group}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {documentation
                .filter((item) => item.group === group)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/docs/system/${item.id}`}
                    className="rounded-lg border p-6 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <h3 className="font-semibold">{item.title} →</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
