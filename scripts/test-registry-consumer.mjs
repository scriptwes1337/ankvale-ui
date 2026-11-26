import {
  readFile,
  readdir,
  mkdtemp,
  mkdir,
  writeFile,
  rm,
} from "node:fs/promises"
import path from "node:path"
import ts from "typescript"
const root = process.cwd(),
  directory = await mkdtemp(path.join(root, ".cache-consumer-"))
try {
  // Check every independently installable item in isolation. The workspace package
  // must never accidentally satisfy an unresolved consumer import in this fixture.
  let manifestCount = 0
  for (const name of await readdir("apps/web/public/r")) {
    if (!name.endsWith(".json")) continue
    const manifest = JSON.parse(
      await readFile(`apps/web/public/r/${name}`, "utf8")
    )
    if (!manifest.files) continue
    const aliases = new Set(
      manifest.files.map((file) => {
        const stem = path.basename(file.path).replace(/\.tsx?$/, "")
        if (file.path.includes("/blocks/")) return `@/components/blocks/${stem}`
        if (file.path.includes("/templates/"))
          return `@/components/templates/${stem}`
        return `${file.type === "registry:ui" ? "@/components/ui" : file.type === "registry:hook" ? "@/hooks" : "@/lib"}/${stem}`
      })
    )
    for (const file of manifest.files) {
      for (const match of (file.content ?? "").matchAll(
        /(?:from\s+|import\s*|import\s*\()["']([^"']+)["']/g
      )) {
        const imported = match[1]
        if (
          imported.startsWith("@workspace/") ||
          imported.startsWith("@ankvale/")
        )
          throw new Error(`${name} leaks workspace import ${imported}`)
        if (imported.startsWith("@/") && !aliases.has(imported))
          throw new Error(`${name} omits local dependency ${imported}`)
      }
    }
    manifestCount++
  }
  console.log(
    `✓ ${manifestCount} standalone registry manifests have complete local imports and no workspace aliases`
  )
  const item = JSON.parse(
    await readFile("apps/web/public/r/ankvale-ui.json", "utf8")
  )
  const mapItem = JSON.parse(
    await readFile("apps/web/public/r/map.json", "utf8")
  )
  if (
    !mapItem.files.some(
      (entry) => entry.target === "public/ankvale-assets/maplibre-gl-worker.mjs"
    )
  )
    throw new Error("Map worker asset missing from installable registry")
  const files = []
  for (const entry of item.files) {
    let relative
    if (entry.type === "registry:ui")
      relative = `components/ui/${path.basename(entry.path)}`
    else if (entry.type === "registry:hook")
      relative = `hooks/${path.basename(entry.path)}`
    else if (entry.type === "registry:lib")
      relative = `lib/${path.basename(entry.path)}`
    else if (entry.target)
      relative = entry.target.replace(/^@components\//, "components/")
    else throw new Error(`Unresolved target: ${entry.path}`)
    const target = path.join(directory, relative)
    if (!target.startsWith(directory + path.sep))
      throw new Error("Invalid target")
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, entry.content)
    if (/\.tsx?$/.test(target)) files.push(target)
  }
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    baseUrl: directory,
    paths: { "@/*": ["./*"] },
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
  })
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
      `✓ ${files.length} registry source files type-check under consumer aliases`
    )
} finally {
  await rm(directory, { recursive: true, force: true })
}
