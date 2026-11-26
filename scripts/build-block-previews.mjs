import { readFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { componentExamples } from "./component-examples.mjs"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const exampleFiles = []
for (const file of ["app-block-previews.tsx", "site-block-previews.tsx"]) {
  try {
    await readFile(path.join(root, "apps/web/components", file))
    exampleFiles.push(file)
  } catch (error) {
    if (error.code !== "ENOENT") throw error
  }
}
export const blockExamples = await componentExamples(root, exampleFiles)
const output = path.join(root, "apps/web/components/generated-block-previews")
await mkdir(output, { recursive: true })
for (const [id, example] of blockExamples) {
  await writeFile(
    path.join(output, `${id}.tsx`),
    example
      .replaceAll("@/components/blocks/", "@ankvale/ui/blocks/")
      .replaceAll("@/components/ui/", "@ankvale/ui/components/")
      .replaceAll("@/hooks/", "@ankvale/ui/hooks/")
      .replaceAll("@/lib/", "@ankvale/ui/lib/") + "\n"
  )
}
await writeFile(
  path.join(output, "index.tsx"),
  `"use client"\nimport dynamic from "next/dynamic"\nconst previews={\n${[...blockExamples.keys()].map((id) => `${JSON.stringify(id)}:dynamic(()=>import("./${id}"),{loading:()=> <p role="status" className="p-6 text-sm text-muted-foreground">Loading preview…</p>})`).join(",\n")}\n}\nexport function ExtendedBlockPreview({name}:{name:string}){const Preview=previews[name as keyof typeof previews];return Preview?<Preview/>:<p role="status">Preview unavailable.</p>}\n`
)
await writeFile(
  path.join(root, "apps/web/lib/block-examples.json"),
  JSON.stringify(Object.fromEntries(blockExamples), null, 2) + "\n"
)
console.log(
  `Built ${blockExamples.size} independently loaded extended block previews.`
)
