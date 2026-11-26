import { readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = path.join(root, "apps/web/public")
const guideNames = {
  agents: "AGENTS.md",
  selection: "component-selection.md",
  design: "design-guide.md",
  motion: "motion-guide.md",
}
export async function buildAgentDocs(blocks) {
  const patterns = JSON.parse(
    await readFile(path.join(root, "docs/agents/patterns.json"), "utf8")
  )
  for (const pattern of patterns) {
    for (const id of [
      ...pattern.blocks,
      ...pattern.components,
      ...pattern.templates.map((name) => `${name}-template`),
    ]) {
      const item = JSON.parse(
        await readFile(path.join(output, "r", `${id}.json`), "utf8")
      )
      if (item.name !== id) throw new Error(`Invalid recommendation: ${id}`)
    }
  }
  await mkdir(path.join(output, "api/guides"), { recursive: true })
  await writeFile(
    path.join(output, "api/patterns.json"),
    JSON.stringify(patterns, null, 2) + "\n"
  )
  await writeFile(
    path.join(output, "api/blocks.json"),
    JSON.stringify(
      [
        ...blocks.map((block) => ({
          ...block,
          registry: `/r/${block.id}.json`,
          preview: `/blocks#${block.id}`,
        })),
        {
          id: "hero-blocks",
          name: "Hero layouts",
          module: "heroes",
          category: "Heroes",
          registry: "/r/hero-blocks.json",
          preview: "/blocks/heroes",
          exports: [
            "HeroMinimal",
            "HeroProduct",
            "HeroFramed",
            "HeroSplit",
            "HeroCentered",
            "HeroStatement",
            "HeroEditorial",
            "HeroShowcase",
            "HeroCanvas",
          ],
        },
      ],
      null,
      2
    ) + "\n"
  )
  const guides = []
  for (const [name, file] of Object.entries(guideNames)) {
    const content = (
      await readFile(path.join(root, "docs/agents", file), "utf8")
    )
      .replaceAll("(component-selection.md)", "(/api/guides/selection.md)")
      .replaceAll("(design-guide.md)", "(/api/guides/design.md)")
      .replaceAll("(motion-guide.md)", "(/api/guides/motion.md)")
    await writeFile(path.join(output, "api/guides", `${name}.md`), content)
    guides.push(content)
  }
  await writeFile(
    path.join(output, "llms.txt"),
    `# Ankvale UI\n\n> React frontend system with components, blocks, templates, motion, icons, graphics and agent guidance. Current delivery is a source registry; standalone npm/CLI delivery is planned.\n\n## Start here\n\n- [Project handbook](/docs)\n- [Installation and release status](/documentation/handbook/getting-started.md)\n- [Customization](/documentation/handbook/customization.md)\n- [License and attribution](/docs/system/licensing)\n- [Agent workflow](/api/guides/agents.md)\n- [Component selection](/api/guides/selection.md)\n- [Design guide](/api/guides/design.md)\n- [Motion guide](/api/guides/motion.md)\n- [Task patterns](/api/patterns.json)\n- [Block catalog](/api/blocks.json)\n- [Web component APIs](/api/components.json)\n- [Full guides](/llms-full.txt)\n\nRead only the selected component's /api/components/<id>.json and /r/<id>.json. Native APIs are /api/native/<id>.json; application templates are /r/<name>-template.json. Do not infer HeroUI props. Live guides are at /guides.\n`
  )
  await writeFile(
    path.join(output, "llms-full.txt"),
    guides.join("\n\n---\n\n")
  )
  console.log(
    `Built agent discovery: ${patterns.length} patterns and four guides.`
  )
}
