export type InterfaceNode = {
  id: string
  type: "heading" | "text" | "button" | "input" | "card" | "separator" | "badge"
  text: string
  label?: string
  variant?: "default" | "outline" | "secondary"
  width?: "full" | "auto"
}
export type InterfaceDocument = {
  version: 1
  name: string
  layout: "stack" | "two-column"
  nodes: InterfaceNode[]
}
export function validateInterface(value: unknown): InterfaceDocument {
  const d = value as InterfaceDocument
  if (
    !d ||
    d.version !== 1 ||
    typeof d.name !== "string" ||
    d.name.length > 100 ||
    !["stack", "two-column"].includes(d.layout) ||
    !Array.isArray(d.nodes) ||
    d.nodes.length > 100
  )
    throw new Error("Invalid interface document.")
  const ids = new Set<string>()
  for (const n of d.nodes) {
    if (
      !n ||
      typeof n.id !== "string" ||
      ids.has(n.id) ||
      ![
        "heading",
        "text",
        "button",
        "input",
        "card",
        "separator",
        "badge",
      ].includes(n.type) ||
      typeof n.text !== "string" ||
      n.text.length > 2000 ||
      (n.label !== undefined && typeof n.label !== "string") ||
      (n.variant !== undefined &&
        !["default", "outline", "secondary"].includes(n.variant)) ||
      (n.width !== undefined && !["full", "auto"].includes(n.width))
    )
      throw new Error("Invalid interface node.")
    ids.add(n.id)
  }
  return structuredClone(d)
}
export function exportInterface(input: InterfaceDocument) {
  const d = validateInterface(input),
    components = new Set<string>()
  const lines = d.nodes.map((n) => {
    const text = `{${JSON.stringify(n.text)}}`
    switch (n.type) {
      case "heading":
        return `<h1 className="text-3xl font-semibold tracking-tight">${text}</h1>`
      case "text":
        return `<p className="text-muted-foreground">${text}</p>`
      case "button":
        components.add("Button")
        return `<Button variant="${n.variant ?? "default"}"${n.width === "full" ? ' className="w-full"' : ""}>${text}</Button>`
      case "input":
        components.add("Input")
        return `<label className="grid gap-2 text-sm"><span>{${JSON.stringify(n.label ?? n.text)}}</span><Input placeholder={${JSON.stringify(n.text)}} /></label>`
      case "card":
        components.add("Card")
        components.add("CardContent")
        return `<Card><CardContent className="p-6">${text}</CardContent></Card>`
      case "separator":
        components.add("Separator")
        return `<Separator />`
      case "badge":
        components.add("Badge")
        return `<Badge variant="${n.variant ?? "secondary"}">${text}</Badge>`
    }
  })
  const imports = [...components]
    .filter((n) => n !== "CardContent")
    .map(
      (n) =>
        `import { ${n === "Card" ? "Card, CardContent" : n} } from "@/components/ui/${n.toLowerCase()}"`
    )
    .join("\n")
  return `${imports}\n\nexport default function Page() {\n  return (\n    <main className="mx-auto ${d.layout === "two-column" ? "grid max-w-5xl gap-6 md:grid-cols-2" : "flex max-w-2xl flex-col items-start gap-6"} p-8">\n      ${lines.join("\n      ")}\n    </main>\n  )\n}\n`
}
