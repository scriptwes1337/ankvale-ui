import extendedExamples from "./block-examples.json"
import type { BlockDefinition } from "@/lib/block-catalog"

export function blockUsage(
  definition: BlockDefinition,
  props: Record<string, unknown>
) {
  const example = (extendedExamples as Record<string, string>)[definition.id]
  if (example) return example
  return `import { ${definition.component} } from "@/components/blocks/${definition.module}"\n\nexport function Example() {\n  return (\n    <${definition.component}\n      {...${JSON.stringify(props, null, 2).replaceAll("\n", "\n      ")}}\n    />\n  )\n}`
}
