import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import {
  validateDesignSystem,
  exportDesignSystem,
} from "../packages/design-system/src"
const slug = z.string().regex(/^[a-z][a-z0-9-]{0,80}$/)
export function createAnkvaleServer(
  root: string,
  designDirectory = path.join(root, "design-systems")
) {
  const server = new McpServer({ name: "ankvale-ui", version: "0.1.0" })
  const text = (value: unknown) => ({
    content: [
      {
        type: "text" as const,
        text:
          typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  })
  const readJson = async (file: string) =>
    JSON.parse(await readFile(file, "utf8"))
  const nativeDir = path.join(root, "packages/native-ui/src/components")
  const apiDir = path.join(root, "apps/web/public/api")
  const readonly = {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  }
  server.registerTool(
    "list_components",
    {
      description:
        "List Ankvale web or native components, optionally filtering names.",
      inputSchema: {
        platform: z.enum(["web", "native"]).default("web"),
        query: z.string().max(100).optional(),
      },
      annotations: readonly,
    },
    async ({ platform, query }) => {
      const items =
        platform === "web"
          ? await readJson(path.join(apiDir, "components.json"))
          : (await readdir(nativeDir))
              .filter((n) => n.endsWith(".tsx"))
              .map((n) => ({
                id: n.slice(0, -4),
                sourcePath: `packages/native-ui/src/components/${n}`,
              }))
      return text(
        items
          .filter(
            (item: { id: string }) =>
              !query || item.id.includes(query.toLowerCase())
          )
          .map(
            ({
              id,
              ...item
            }: {
              id: string
              title?: string
              preview?: string
              sourcePath: string
            }) => ({
              id,
              title: item.title,
              preview: item.preview,
              sourcePath: item.sourcePath,
            })
          )
      )
    }
  )
  server.registerTool(
    "get_component",
    {
      description:
        "Read a component API document and source. Native returns source and its preview link.",
      inputSchema: {
        name: slug,
        platform: z.enum(["web", "native"]).default("web"),
      },
      annotations: readonly,
    },
    async ({ name, platform }) => {
      const source = await readFile(
        path.join(
          root,
          platform === "web"
            ? "packages/ui/src/components"
            : "packages/native-ui/src/components",
          `${name}.tsx`
        ),
        "utf8"
      )
      const api =
        platform === "web"
          ? await readJson(path.join(apiDir, "components", `${name}.json`))
          : await readJson(path.join(apiDir, "native", `${name}.json`))
      return text({ api, source })
    }
  )
  server.registerTool(
    "get_registry_item",
    {
      description:
        "Return an installable shadcn registry item including source and dependencies.",
      inputSchema: { name: slug },
      annotations: readonly,
    },
    async ({ name }) =>
      text(await readJson(path.join(root, "apps/web/public/r", `${name}.json`)))
  )
  server.registerTool(
    "get_template",
    {
      description:
        "Read a local Ankvale application template and install manifest.",
      inputSchema: {
        name: z.enum(["dashboard", "mail", "chat", "crm", "finances"]),
      },
      annotations: readonly,
    },
    async ({ name }) =>
      text({
        source: await readFile(
          path.join(root, "packages/ui/src/templates", `${name}.tsx`),
          "utf8"
        ),
        registry: await readJson(
          path.join(root, "apps/web/public/r", `${name}-template.json`)
        ),
      })
  )
  server.registerTool(
    "list_blocks",
    {
      description:
        "Discover website blocks and hero layouts with exact exports, module names, previews and install URLs.",
      inputSchema: { query: z.string().max(100).optional() },
      annotations: readonly,
    },
    async ({ query }) => {
      const items = await readJson(path.join(apiDir, "blocks.json"))
      const term = query?.toLowerCase()
      return text(
        items.filter(
          (item: { id: string; name: string; category: string }) =>
            !term ||
            `${item.id} ${item.name} ${item.category}`
              .toLowerCase()
              .includes(term)
        )
      )
    }
  )
  server.registerTool(
    "recommend_patterns",
    {
      description:
        "Find existing templates, blocks and components for a screen or section before building it. Read the recommended APIs before implementing.",
      inputSchema: { task: z.string().min(1).max(500) },
      annotations: readonly,
    },
    async ({ task }) => {
      const patterns = await readJson(path.join(apiDir, "patterns.json"))
      const words = ` ${task
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()} `
      return text(
        patterns
          .map((item: { keywords: string[] }) => ({
            ...item,
            score: item.keywords.filter((keyword) =>
              words.includes(` ${keyword} `)
            ).length,
          }))
          .filter((item: { score: number }) => item.score > 0)
          .sort(
            (a: { score: number }, b: { score: number }) => b.score - a.score
          )
          .slice(0, 5)
      )
    }
  )
  server.registerTool(
    "get_guide",
    {
      description:
        "Read Ankvale's agent workflow, task-to-component selection, design rules or motion policy.",
      inputSchema: {
        name: z.enum(["agents", "selection", "design", "motion"]),
      },
      annotations: readonly,
    },
    async ({ name }) =>
      text(await readFile(path.join(apiDir, "guides", `${name}.md`), "utf8"))
  )
  server.registerTool(
    "list_design_systems",
    {
      description:
        "List JSON designs in the configured local design-systems directory.",
      inputSchema: {},
      annotations: readonly,
    },
    async () => {
      let files: string[]
      try {
        files = await readdir(designDirectory)
      } catch {
        return text([])
      }
      const systems = await Promise.all(
        files
          .filter((f) => /^[a-z][a-z0-9-]*\.json$/.test(f))
          .map(async (f) => {
            try {
              const s = validateDesignSystem(
                await readJson(path.join(designDirectory, f))
              )
              return {
                name: s.name,
                id: s.id,
                file: f.slice(0, -5),
                updatedAt: s.updatedAt,
              }
            } catch {
              return null
            }
          })
      )
      return text(systems.filter(Boolean))
    }
  )
  server.registerTool(
    "get_design_system_manifest",
    {
      description:
        "Read a saved local design system. Export JSON from /design into the configured directory first.",
      inputSchema: { name: slug },
      annotations: readonly,
    },
    async ({ name }) =>
      text(
        validateDesignSystem(
          await readJson(path.join(designDirectory, `${name}.json`))
        )
      )
  )
  server.registerTool(
    "get_design_system_export",
    {
      description:
        "Export a saved system as web CSS, native theme JSON, design guidance, product context, or JSON.",
      inputSchema: {
        name: slug,
        format: z.enum([
          "web-css",
          "native-theme",
          "design-md",
          "product-md",
          "json",
        ]),
      },
      annotations: readonly,
    },
    async ({ name, format }) =>
      text(
        exportDesignSystem(
          validateDesignSystem(
            await readJson(path.join(designDirectory, `${name}.json`))
          ),
          format
        )
      )
  )
  return server
}
export async function start() {
  const root = process.env.ANKVALE_UI_ROOT ?? process.cwd()
  const server = createAnkvaleServer(root, process.env.ANKVALE_DESIGN_SYSTEMS_DIR)
  await server.connect(new StdioServerTransport())
}
