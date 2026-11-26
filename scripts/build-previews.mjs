import { readFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { componentExamples } from "./component-examples.mjs"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  output = path.join(root, "apps/web/components/generated-previews")
const inventory = JSON.parse(
  await readFile(path.join(root, "docs/expansion/inventory.json"), "utf8")
)
const examples = await componentExamples(root)
const names=[...examples.keys()].sort()
await mkdir(output, { recursive: true })
for (const id of names) {
  const example = examples.get(id)
  if (!example) throw new Error(`Missing ${id} preview`)
  await writeFile(
    path.join(output, `${id}.tsx`),
    example
      .replaceAll("@/components/ui/", "@ankvale/ui/components/")
      .replaceAll("@/hooks/", "@ankvale/ui/hooks/")
      .replaceAll("@/lib/", "@ankvale/ui/lib/") + "\n"
  )
}
await writeFile(
  path.join(output, "index.tsx"),
  `"use client"\nimport dynamic from "next/dynamic"\nimport type {ExpansionPreviewName} from "@/lib/expansion-preview-names"\nconst previews={\n${names.map((id) => `${JSON.stringify(id)}:dynamic(()=>import("./${id}"),{loading:()=> <p data-preview-loading role="status" className="text-sm text-muted-foreground">Loading preview…</p>})`).join(",\n")}\n}\nexport function ComponentPreview({name}:{name:string}){const Preview=previews[name as keyof typeof previews];return Preview?<Preview/>:<p>Unknown component.</p>}\nexport function ExpansionPreview({name}:{name:ExpansionPreviewName}){return <ComponentPreview name={name}/> }\n`
)
console.log(`Built ${names.length} independently loaded component previews.`)
