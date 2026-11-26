import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises"
import path from "node:path"
import ts from "typescript"
const root = process.cwd(),
  directory = await mkdtemp(path.join(root, ".cache-api-"))
try {
  const docs = JSON.parse(
    await readFile("apps/web/public/api/components.json", "utf8")
  )
  const blocks = JSON.parse(
    await readFile("apps/web/lib/block-examples.json", "utf8")
  )
  const appDefinitions = JSON.parse(
    await readFile("apps/web/lib/app-block-definitions.json", "utf8")
  )
  const siteDefinitions = JSON.parse(
    await readFile("apps/web/lib/site-block-definitions.json", "utf8")
  )
  const definitions = [...appDefinitions, ...siteDefinitions]
  if (new Set(definitions.map((item) => item.id)).size !== definitions.length)
    throw new Error("Duplicate block IDs")
  for (const definition of definitions) {
    if (!blocks[definition.id])
      throw new Error(`Missing copyable example: ${definition.id}`)
    const manifest = JSON.parse(
      await readFile(`apps/web/public/r/${definition.id}.json`, "utf8")
    )
    if (
      !manifest.files.some((file) =>
        file.path.endsWith(`/${definition.module}.tsx`)
      )
    )
      throw new Error(`Missing block source in registry: ${definition.id}`)
    const blockDoc = JSON.parse(
      await readFile(
        `apps/web/public/api/block-modules/${definition.module}.json`,
        "utf8"
      )
    )
    if (!blockDoc.variants.some((variant) => variant.id === definition.id))
      throw new Error(`Missing block API documentation: ${definition.id}`)
  }
  const examples = [
    ...docs,
    ...Object.entries(blocks).map(([id, example]) => ({
      id: `block-${id}`,
      example,
    })),
  ]
  for (const doc of examples) {
    const filename = path.join(directory, `${doc.id}.tsx`)
    await writeFile(filename, doc.example)
  }
  const config = ts.readConfigFile("apps/web/tsconfig.json", ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.join(root, "apps/web")
  )
  const program = ts.createProgram(
    examples.map((doc) => path.join(directory, `${doc.id}.tsx`)),
    {
      ...parsed.options,
      baseUrl: root,
      paths: {
        "@/components/ui/*": ["packages/ui/src/components/*"],
        "@/components/blocks/*": ["packages/ui/src/blocks/*"],
        "@/hooks/*": ["packages/ui/src/hooks/*"],
        "@/lib/*": ["packages/ui/src/lib/*"],
        "@ankvale/ui/*": ["packages/ui/src/*"],
      },
      noEmit: true,
    }
  )
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file?.fileName.startsWith(directory))
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (f) => f,
        getNewLine: () => "\n",
      })
    )
    process.exitCode = 1
  } else
    console.log(
      `✓ ${docs.length} component and ${Object.keys(blocks).length} block examples type-check in consumer import paths; all extended blocks have source manifests and API documentation`
    )
} finally {
  await rm(directory, { recursive: true, force: true })
}
