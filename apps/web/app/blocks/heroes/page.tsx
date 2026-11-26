import type { Metadata } from "next"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { HeroGallery } from "@/components/hero-gallery"

export const metadata: Metadata = {
  title: "Hero blocks — Ankvale UI",
  description:
    "Nine art-directed hero layouts with original vector graphics, interactive product previews, and responsive typography.",
}

export default async function Page() {
  const directory = path.resolve(process.cwd(), "../../packages/ui/src/blocks")
  const [source, graphicsSource] = await Promise.all([
    readFile(path.join(directory, "heroes.tsx"), "utf8"),
    readFile(path.join(directory, "hero-graphics.tsx"), "utf8"),
  ])
  const consumerSource = (text: string) =>
    text
      .replaceAll("@ankvale/ui/lib/", "@/lib/")
      .replaceAll("@ankvale/ui/blocks/", "@/components/blocks/")
      .replaceAll("@ankvale/ui/components/", "@/components/ui/")
  return (
    <HeroGallery
      source={consumerSource(source)}
      graphicsSource={consumerSource(graphicsSource)}
    />
  )
}
