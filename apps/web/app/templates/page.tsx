import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { templateCatalog } from "@/lib/template-catalog"
export default function TemplatesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">Templates</h1>
        <div className="grid gap-5 md:grid-cols-2">
          {templateCatalog.map((template) => (
            <article
              key={template.id}
              className="rounded-lg border bg-card p-6"
            >
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {template.description}
              </p>
              <div className="mt-6 flex gap-5 text-sm text-primary">
                <Link href={`/examples/${template.id}`}>Open preview →</Link>
                <Link href={`/docs/templates/${template.id}`}>
                  API reference →
                </Link>
                <a href={`/r/${template.id}-template.json`}>
                  Registry source →
                </a>
              </div>
              <code className="mt-5 block overflow-auto rounded border p-3 text-xs">
                npx shadcn@latest add &lt;registry-origin&gt;/r/{template.id}
                -template.json
              </code>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
