export type ThemeTokens = {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  muted: string
  mutedForeground: string
  border: string
  radius: number
  spacing: number
  fontFamily: string
  fontSize: number
}
export type ComponentStyle = {
  radius?: number
  paddingX?: number
  paddingY?: number
  borderWidth?: number
  fontSize?: number
}
export type DesignSystem = {
  version: 1
  id: string
  name: string
  updatedAt: string
  brand: {
    website: string
    description: string
    audience: string
    tone: string
    logo: string
    assets: { name: string; url: string }[]
  }
  light: ThemeTokens
  dark: ThemeTokens
  components: Record<string, ComponentStyle>
  guidance: string
  locked: string[]
}
export const defaultTokens: ThemeTokens = {
  background: "#ffffff",
  foreground: "#191919",
  primary: "#0d6efd",
  primaryForeground: "#ffffff",
  muted: "#f5f5f5",
  mutedForeground: "#666666",
  border: "#e5e5e5",
  radius: 8,
  spacing: 4,
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: 14,
}
export function createDesignSystem(name = "Ankvale"): DesignSystem {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name,
    updatedAt: new Date().toISOString(),
    brand: {
      website: "",
      description: "",
      audience: "",
      tone: "Clear and direct",
      logo: "",
      assets: [],
    },
    light: { ...defaultTokens },
    dark: {
      ...defaultTokens,
      background: "#171717",
      foreground: "#f1f1f1",
      muted: "#303030",
      mutedForeground: "#a3a3a3",
      border: "#363636",
    },
    components: {},
    guidance:
      "Use white space, clear hierarchy, neutral borders, and blue for primary actions. Keep copy concise. Avoid gradients, glass, decorative slogans, and excessive badges.",
    locked: [],
  }
}
const hex = /^#[0-9a-f]{6}$/i
export function contrast(a: string, b: string) {
  function luminance(c: string) {
    const channels = [1, 3, 5]
      .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
  }
  if (!hex.test(a) || !hex.test(b)) return 0
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
export function validateDesignSystem(value: unknown): DesignSystem {
  if (!value || typeof value !== "object")
    throw new Error("Expected a design system object.")
  const v = value as DesignSystem
  if (
    v.version !== 1 ||
    typeof v.id !== "string" ||
    typeof v.name !== "string" ||
    !v.name.trim() ||
    v.name.length > 100
  )
    throw new Error("Invalid design system identity.")
  for (const mode of ["light", "dark"] as const) {
    const tokens = v[mode]
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens))
      throw new Error(`Missing ${mode} tokens.`)
    if (
      Object.keys(tokens).some(
        (key) => !Object.keys(defaultTokens).includes(key)
      )
    )
      throw new Error(`Unknown ${mode} token.`)
    for (const key of [
      "background",
      "foreground",
      "primary",
      "primaryForeground",
      "muted",
      "mutedForeground",
      "border",
    ] as const)
      if (!hex.test(tokens[key]))
        throw new Error(`Invalid ${mode} ${key} color.`)
    for (const [key, min, max] of [
      ["radius", 0, 32],
      ["spacing", 2, 12],
      ["fontSize", 12, 24],
    ] as const)
      if (
        !Number.isFinite(tokens[key]) ||
        tokens[key] < min ||
        tokens[key] > max
      )
        throw new Error(`Invalid ${key}.`)
    if (
      typeof tokens.fontFamily !== "string" ||
      !/^[a-zA-Z0-9 ,'"-]{1,120}$/.test(tokens.fontFamily)
    )
      throw new Error("Invalid font family.")
  }
  if (
    !v.brand ||
    ["website", "description", "audience", "tone", "logo"].some(
      (key) => typeof v.brand[key as keyof typeof v.brand] !== "string"
    ) ||
    !Array.isArray(v.brand.assets) ||
    v.brand.assets.length > 100 ||
    v.brand.assets.some(
      (a) => !a || typeof a.name !== "string" || typeof a.url !== "string"
    )
  )
    throw new Error("Invalid brand.")
  if (
    !Array.isArray(v.locked) ||
    v.locked.some((k) => typeof k !== "string") ||
    typeof v.guidance !== "string" ||
    !v.components ||
    typeof v.components !== "object" ||
    Array.isArray(v.components)
  )
    throw new Error("Invalid design guidance.")
  for (const [id, style] of Object.entries(v.components)) {
    if (!/^[a-z][a-z0-9-]*$/.test(id) || !style || typeof style !== "object")
      throw new Error("Invalid component style.")
    for (const [key, n] of Object.entries(style))
      if (
        !["radius", "paddingX", "paddingY", "borderWidth", "fontSize"].includes(
          key
        ) ||
        typeof n !== "number" ||
        !Number.isFinite(n) ||
        n < 0 ||
        n > 64
      )
        throw new Error("Invalid component style value.")
  }
  return JSON.parse(JSON.stringify(v)) as DesignSystem
}
const cssNames: Record<keyof ThemeTokens, string> = {
  background: "background",
  foreground: "foreground",
  primary: "primary",
  primaryForeground: "primary-foreground",
  muted: "muted",
  mutedForeground: "muted-foreground",
  border: "border",
  radius: "radius",
  spacing: "spacing",
  fontFamily: "font-sans",
  fontSize: "font-size",
}
function cssTokens(t: ThemeTokens) {
  return Object.entries(t)
    .map(
      ([key, value]) =>
        `  --${cssNames[key as keyof ThemeTokens]}: ${typeof value === "number" ? `${value}px` : value};`
    )
    .join("\n")
}
export type DesignExport =
  "web-css" | "native-theme" | "design-md" | "product-md" | "json"
export function exportDesignSystem(
  input: DesignSystem,
  format: DesignExport
): string {
  const s = validateDesignSystem(input)
  if (format === "json") return JSON.stringify(s, null, 2)
  if (format === "web-css") {
    const overrides = Object.entries(s.components)
      .map(
        ([name, style]) =>
          `[data-slot="${name}"] {\n${Object.entries(style)
            .map(([key, n]) => {
              const fields: Record<string, string> = {
                radius: "border-radius",
                paddingX: "padding-inline",
                paddingY: "padding-block",
                borderWidth: "border-width",
                fontSize: "font-size",
              }
              return `  ${fields[key]}: ${n}px;`
            })
            .join("\n")}\n}`
      )
      .join("\n")
    return `/* ${s.name.replaceAll("*/", "").replace(/[<>]/g, "")} */\n:root {\n${cssTokens(s.light)}\n}\n.dark {\n${cssTokens(s.dark)}\n}\n${overrides}\n`
  }
  if (format === "native-theme") {
    const convert = (t: ThemeTokens) => ({
      background: t.background,
      surface: t.background,
      foreground: t.foreground,
      muted: t.mutedForeground,
      border: t.border,
      secondary: t.muted,
      primary: t.primary,
      primaryForeground: t.primaryForeground,
      accent: t.muted,
      radius: t.radius,
    })
    return JSON.stringify(
      { light: convert(s.light), dark: convert(s.dark) },
      null,
      2
    )
  }
  if (format === "design-md")
    return `# ${s.name} design\n\n${s.guidance}\n\nPrimary: ${s.light.primary}. Surface: ${s.light.background}. Text: ${s.light.foreground}.\nFont: ${s.light.fontFamily}, ${s.light.fontSize}px. Radius: ${s.light.radius}px. Spacing unit: ${s.light.spacing}px.\n\nUse semantic tokens and component APIs. Verify keyboard access, contrast, small screens, reduced motion, loading, empty and error states.\n`
  return `# ${s.name}\n\n${s.brand.description}\n\nAudience: ${s.brand.audience}\nTone: ${s.brand.tone}\nWebsite: ${s.brand.website}\n`
}
export type BrandImport = {
  name: string
  description: string
  colors: string[]
  fonts: string[]
  logo: string
  website: string
}
function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}
export function extractBrand(
  html: string,
  website: string,
  css = ""
): BrandImport {
  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ??
    "Imported brand"
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  const description =
    tags
      .find((tag) => /\bname\s*=\s*["']description["']/i.test(tag))
      ?.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1] ?? ""
  const raw = html + "\n" + css
  const colors = Array.from(
    new Set((raw.match(/#[0-9a-f]{6}\b/gi) ?? []).map((c) => c.toLowerCase()))
  ).slice(0, 20)
  const fonts = Array.from(
    new Set(
      Array.from(raw.matchAll(/font-family\s*:\s*([^;}]+)/gi), (m) =>
        m[1]!.trim()
      ).filter((f) => /^[a-zA-Z0-9 ,'"-]{1,120}$/.test(f))
    )
  ).slice(0, 10)
  const icon = (
    html.match(/<link\b[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/i)?.[0] ?? ""
  ).match(/href=["']([^"']+)["']/i)?.[1]
  let logo = ""
  try {
    if (icon) {
      const url = new URL(icon, website)
      if (url.protocol === "https:" || url.protocol === "http:") logo = url.href
    }
  } catch {}
  return {
    name: decode(title).slice(0, 100),
    description: decode(description),
    colors,
    fonts,
    logo,
    website,
  }
}
export * from "./interface"
export type DesignPatch = {
  mode: "light" | "dark"
  tokens?: Partial<ThemeTokens>
  guidance?: string
  components?: Record<string, ComponentStyle>
  brand?: Partial<
    Pick<
      DesignSystem["brand"],
      "description" | "audience" | "tone" | "website" | "logo" | "assets"
    >
  >
}
export function applyDesignPatch(system: DesignSystem, patch: DesignPatch) {
  const next = structuredClone(system)
  for (const [key, value] of Object.entries(patch.tokens ?? {}))
    if (!system.locked.includes(`${patch.mode}.${key}`))
      (next[patch.mode] as unknown as Record<string, unknown>)[key] = value
  if (patch.guidance !== undefined && !system.locked.includes("guidance"))
    next.guidance = patch.guidance
  for (const [key, value] of Object.entries(patch.brand ?? {}))
    if (!system.locked.includes(`brand.${key}`))
      (next.brand as unknown as Record<string, unknown>)[key] = value
  for (const [id, style] of Object.entries(patch.components ?? {})) {
    const merged = { ...next.components[id] }
    for (const [key, value] of Object.entries(style))
      if (
        !system.locked.includes(`components.${id}`) &&
        !system.locked.includes(`components.${id}.${key}`)
      )
        (merged as Record<string, number>)[key] = value
    next.components[id] = merged
  }
  next.updatedAt = new Date().toISOString()
  return validateDesignSystem(next)
}
