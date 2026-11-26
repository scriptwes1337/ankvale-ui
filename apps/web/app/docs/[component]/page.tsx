import { readFile } from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
type ApiDocument = {
  id: string
  title: string
  importPath: string
  exports: { name: string; parameters: string[]; typeParameters: string[] }[]
  types: { name: string; declaration: string }[]
  preview: string
  example:string|null
  registry: string
}
async function documents(): Promise<ApiDocument[]> {
  return JSON.parse(
    await readFile(
      path.join(process.cwd(), "public/api/components.json"),
      "utf8"
    )
  )
}
export async function generateStaticParams() {
  return (await documents()).map((document) => ({ component: document.id }))
}
export default async function ComponentDocs({
  params,
}: {
  params: Promise<{ component: string }>
}) {
  const { component } = await params
  const doc = (await documents()).find((item) => item.id === component)
  if (!doc) notFound()
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-4xl space-y-8 px-6 py-12"
      >
        <div>
          <Link href="/playground" className="text-sm text-muted-foreground">
            Components
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            {doc.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-primary">
            <Link href={doc.preview}>Live preview →</Link>
            <a href={doc.registry}>Registry JSON →</a>
            <a href={`/api/components/${doc.id}.json`}>API JSON →</a>
          </div>
        </div>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Installation</h2>
          <pre className="overflow-auto rounded-lg border p-4 text-sm">{`npx shadcn@latest add <registry-origin>${doc.registry}`}</pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Replace &lt;registry-origin&gt; with the URL serving this library.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Import</h2>
          <pre className="overflow-auto rounded-lg border p-4 text-sm">{`import { ${doc.exports.map((item) => item.name).join(", ")} } from "${doc.importPath}"`}</pre>
        </section>
        {doc.example&&<section><h2 className="mb-3 text-lg font-semibold">Example</h2><pre className="max-h-[600px] overflow-auto rounded-lg border p-4 text-xs leading-6"><code>{doc.example}</code></pre></section>}
        {doc.types.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Types and props</h2>
            {doc.types.map((type) => (
              <pre
                key={type.name}
                className="overflow-auto rounded-lg border p-4 text-xs leading-6"
              >
                <code>{type.declaration}</code>
              </pre>
            ))}
          </section>
        )}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Exports</h2>
          {doc.exports.map((item) => (
            <div key={item.name} className="rounded-lg border p-4">
              <h3 className="mb-2 font-mono text-sm">{item.name}</h3>
              {item.parameters.length > 0 && (
                <pre className="overflow-auto text-xs leading-6">
                  {item.parameters.join(",\n")}
                </pre>
              )}
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
