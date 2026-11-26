import { mkdir, readFile, writeFile, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "esbuild"
import { zipSync } from "fflate"
import { createHash } from "node:crypto"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const publicRoot = path.join(root, "apps/web/public")
const result = await build({
  entryPoints: [path.join(root, "apps/web/lib/documentation.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
})
const { documentation, documentationLinks, publicDocumentationFiles } =
  await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  )
const inventory = JSON.parse(
  await readFile(
    path.join(root, "docs/legal/dependency-inventory.json"),
    "utf8"
  )
)
const lockfile = await readFile(path.join(root, "package-lock.json"))
if (
  inventory.lockfileSha256 !==
  createHash("sha256").update(lockfile).digest("hex")
) {
  throw new Error(
    "Dependency evidence is stale. Run npm run audit:dependencies and review its findings before building documentation."
  )
}
// This directory contains generated output only. Remove withdrawn pages as well
// as refreshing current ones so old internal reports cannot remain public.
const publishedRoot = path.join(publicRoot, "documentation")
const prepared = []
for (const file of new Set(publicDocumentationFiles)) {
  const bytes = await readFile(path.join(root, "docs", file))
  prepared.push({
    file,
    bytes,
    published: file.endsWith(".md")
      ? documentationLinks(bytes.toString("utf8"), file)
      : bytes,
  })
}
const license = await readFile(path.join(root, "LICENSE"))
const entries = { LICENSE: new Uint8Array(license) }
await rm(publishedRoot, { recursive: true, force: true })
for (const { file, bytes, published } of prepared) {
  entries[`docs/${file}`] = new Uint8Array(bytes)
  const target = path.join(publishedRoot, file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, published)
}
const landing = await readFile(path.join(root, "docs/handbook/README.md"))
entries["README.md"] = new Uint8Array(landing)
await writeFile(
  path.join(publishedRoot, "README.md"),
  documentationLinks(landing.toString("utf8"), "handbook/README.md")
)
await mkdir(path.join(publicRoot, "downloads"), { recursive: true })
await writeFile(
  path.join(publicRoot, "downloads/ankvale-documentation.zip"),
  zipSync(entries)
)
console.log(
  `Built ${documentation.length} user documentation pages and a ${Object.keys(entries).length}-file public reference bundle.`
)
