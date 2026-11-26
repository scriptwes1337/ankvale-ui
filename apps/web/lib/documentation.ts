import path from "node:path"
import catalog from "./documentation-catalog.json"

export const documentation = catalog
export const publicDocumentationFiles = [
  ...catalog.map((item) => item.file),
  "handbook/README.md",
  "legal/Ankvale-LICENSE.txt",
  "legal/THIRD_PARTY_NOTICES.txt",
  "legal/upstream/shadcn-ui-LICENSE.md",
  "legal/upstream/Inter-OFL.txt",
  "legal/upstream/GeistMono-OFL.txt",
  "agents/AGENTS.md",
  "agents/component-selection.md",
  "agents/design-guide.md",
  "agents/motion-guide.md",
  "agents/patterns.json",
]
const agentRoutes: Record<string, string> = {
  "agents/AGENTS.md": "/guides/agents",
  "agents/component-selection.md": "/guides/selection",
  "agents/design-guide.md": "/guides/design",
  "agents/motion-guide.md": "/guides/motion",
}

/** Map repository-relative Markdown references to published documentation routes. */
export function documentationLinks(content: string, file: string) {
  return content.replace(/\]\(([^)]+)\)/g, (match, href: string) => {
    if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) return match
    const [target, fragment] = href.split("#")
    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(file), target!)
    )
    const document = documentation.find((item) => item.file === resolved)
    let destination = document
      ? `/docs/system/${document.id}`
      : agentRoutes[resolved]
    if (!destination && publicDocumentationFiles.includes(resolved)) {
      destination = `/documentation/${resolved}`
    }
    if (!destination)
      throw new Error(`Unpublished documentation reference: ${file} -> ${href}`)
    return destination
      ? `](${destination}${fragment ? `#${fragment}` : ""})`
      : match
  })
}
