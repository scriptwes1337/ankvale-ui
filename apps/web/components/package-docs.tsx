import Link from "next/link"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { notFound } from "next/navigation"
import { SiteHeader } from "./site-header"
export type PackageApiDocument = {
  id: string
  title: string
  importPath: string
  sourcePath: string
  exports: { name: string; parameters: string[] }[]
  types: { name: string; declaration: string }[]
  registry: string | null
  example?: string | null
  variants?: {
    id: string
    name: string
    component: string
    registry: string
    example: string | null
  }[]
  preview: string | null
}
export async function packageDocuments(
  kind: "native" | "templates" | "block-modules"
): Promise<PackageApiDocument[]> {
  return JSON.parse(
    await readFile(path.join(process.cwd(), `public/api/${kind}.json`), "utf8")
  )
}
export async function PackageDocs({
  id,
  kind,
}: {
  id: string
  kind: "native" | "templates" | "block-modules"
}) {
  const doc = (await packageDocuments(kind)).find((d) => d.id === id)
  if (!doc) notFound()
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-4xl space-y-8 px-6 py-12"
      >
        <div>
          <Link
            href={
              kind === "native"
                ? "/native"
                : kind === "block-modules"
                  ? "/blocks"
                  : "/templates"
            }
            className="text-sm text-muted-foreground"
          >
            {kind === "native"
              ? "Native components"
              : kind === "block-modules"
                ? "Blocks"
                : "Templates"}
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {doc.title}
          </h1>
          <div className="mt-5 flex gap-5 text-sm text-primary">
            {doc.preview && <Link href={doc.preview}>Live preview →</Link>}
            {doc.registry && <a href={doc.registry}>Registry JSON →</a>}
          </div>
        </div>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Installation</h2>
          {kind === "native" ? (
            <div className="space-y-3 text-sm">
              <p>
                Use the source workspace package or its locally packed tarball.
                It requires React Native 0.88, React 19.3, and react-native-svg.
              </p>
              <pre className="overflow-auto rounded-lg border p-4">
                npm pack --workspace @ankvale/native-ui
              </pre>
              <p>
                Wrap your app in AnkvaleProvider from @ankvale/native-ui/theme.
                Browser previews use React Native Web; native device checks
                remain pending.
              </p>
            </div>
          ) : doc.registry ? (
            <pre className="overflow-auto rounded-lg border p-4 text-sm">{`npx shadcn@latest add <registry-origin>${doc.registry}`}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              Included as a helper when installing a block.
            </p>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Import</h2>
          <pre className="overflow-auto rounded-lg border p-4 text-sm">{`import { ${doc.exports.map((e) => e.name).join(", ")} } from "${doc.importPath}"`}</pre>
        </section>
        {kind === "templates" && (
          <p className="text-sm text-muted-foreground">
            Example data is local. Supply the template’s service callbacks to
            connect your application.
          </p>
        )}
        {doc.variants?.map((variant) => (
          <section key={variant.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{variant.name}</h2>
            <div className="flex gap-4 text-sm text-primary">
              <Link href={`/blocks#${variant.id}`}>Preview</Link>
              <a href={variant.registry}>Install manifest</a>
            </div>
            {variant.example && (
              <pre className="max-h-[600px] overflow-auto rounded-lg border p-4 text-xs leading-6">
                <code>{variant.example}</code>
              </pre>
            )}
          </section>
        ))}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Props and exports</h2>
          {doc.exports.map((e) => (
            <div key={e.name} className="rounded-lg border p-4">
              <h3 className="font-mono text-sm">{e.name}</h3>
              <pre className="mt-3 overflow-auto text-xs leading-6">
                {e.parameters.join(",\n")}
              </pre>
            </div>
          ))}
        </section>
        {doc.types.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Types</h2>
            {doc.types.map((t) => (
              <pre
                key={t.name}
                className="overflow-auto rounded-lg border p-4 text-xs leading-6"
              >
                {t.declaration}
              </pre>
            ))}
          </section>
        )}
      </main>
    </>
  )
}
