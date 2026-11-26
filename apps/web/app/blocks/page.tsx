import type { Metadata } from "next"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { BlockGallery } from "@/components/block-gallery"

export const metadata: Metadata = {
  title: "Blocks — Ankvale UI",
  description:
    "Reusable application workflows, website sections and hero layouts.",
}
export default async function Page() {
  const directory = path.resolve(process.cwd(), "../../packages/ui/src/blocks")
  const files = (await readdir(directory)).filter((file) =>
    file.endsWith(".tsx")
  )
  const entries = await Promise.all(
    files.map(async (file) => [
      file.replace(".tsx", ""),
      (await readFile(path.join(directory, file), "utf8"))
        .replaceAll("@ankvale/ui/blocks/", "@/components/blocks/")
        .replaceAll("@ankvale/ui/components/", "@/components/ui/")
        .replaceAll("@ankvale/ui/lib/", "@/lib/")
        .replaceAll("@ankvale/ui/hooks/", "@/hooks/"),
    ])
  )
  return <BlockGallery sources={Object.fromEntries(entries)} />
}
