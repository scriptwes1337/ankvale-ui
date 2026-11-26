import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import postcss from "postcss"
import ts from "typescript"
import { build } from "esbuild"
import { registryItemSchema } from "shadcn/schema"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ui = path.join(root, "packages/ui")
const style = postcss.parse(
  await readFile(path.join(ui, "src/styles/globals.css"), "utf8")
)
const cssVars = { theme: {}, light: {}, dark: {} }
const css = {}

// Keep the installable theme and the playground on the same source of truth.
function toObject(nodes) {
  const result = {}
  for (const node of nodes ?? []) {
    if (node.type === "comment") continue
    if (node.type === "decl")
      result[node.prop] = node.value + (node.important ? " !important" : "")
    else {
      const key =
        node.type === "atrule"
          ? `@${node.name}${node.params ? ` ${node.params}` : ""}`
          : node.selector
      result[key] = { ...result[key], ...toObject(node.nodes) }
    }
  }
  return result
}
for (const node of style.nodes) {
  if (node.type === "rule" && [":root", ".dark"].includes(node.selector)) {
    const mode = node.selector === ":root" ? "light" : "dark"
    css[node.selector] = { ...css[node.selector], "color-scheme": mode }
    node.walkDecls((decl) => {
      if (!decl.prop.startsWith("--")) return
      const name = decl.prop.slice(2)
      if (["surface-shadow"].includes(name)) {
        css[node.selector][decl.prop] = decl.value
      } else cssVars[mode][name] = decl.value
    })
  } else if (node.type === "rule") {
    css[node.selector] = { ...css[node.selector], ...toObject(node.nodes) }
  } else if (node.type === "atrule" && node.name === "theme") {
    node.walkDecls((decl) => {
      if (decl.value !== `var(${decl.prop})`)
        cssVars.theme[decl.prop.slice(2)] = decl.value
    })
  } else if (
    node.type === "atrule" &&
    !["import", "source"].includes(node.name)
  ) {
    const key = `@${node.name} ${node.params}`
    css[key] = { ...css[key], ...toObject(node.nodes) }
  }
}
css['@import "maplibre-gl/dist/maplibre-gl.css"'] = {}
css['@import "tw-animate-css"'] = {}
css['@import "shadcn/tailwind.css"'] = {}
css['@import "react-big-calendar/lib/css/react-big-calendar.css"'] = {}
css['@import "react-big-calendar/lib/addons/dragAndDrop/styles.css"'] = {}
function registryCss(installed) {
  const result = { ...css }
  if (!installed.some((name) => name.startsWith("react-big-calendar@"))) {
    delete result['@import "react-big-calendar/lib/css/react-big-calendar.css"']
    delete result[
      '@import "react-big-calendar/lib/addons/dragAndDrop/styles.css"'
    ]
  }
  if (!installed.some((name) => name.startsWith("maplibre-gl@")))
    delete result['@import "maplibre-gl/dist/maplibre-gl.css"']
  return result
}
const files = []
for (const [directory, type] of [
  ["components", "registry:ui"],
  ["hooks", "registry:hook"],
  ["lib", "registry:lib"],
]) {
  for (const filename of (
    await readdir(path.join(ui, "src", directory))
  ).sort()) {
    if (!/\.tsx?$/.test(filename)) continue
    const content = (
      await readFile(path.join(ui, "src", directory, filename), "utf8")
    )
      .replaceAll("@ankvale/ui/components/", "@/components/ui/")
      .replaceAll("@ankvale/ui/hooks/", "@/hooks/")
      .replaceAll("@ankvale/ui/lib/", "@/lib/")
    files.push({
      path: `registry/ankvale/${directory}/${filename}`,
      type,
      content,
    })
  }
}
const heroFile = {
  path: "registry/ankvale/blocks/heroes.tsx",
  type: "registry:component",
  target: "@components/blocks/heroes.tsx",
  content: (await readFile(path.join(ui, "src/blocks/heroes.tsx"), "utf8"))
    .replaceAll("@ankvale/ui/lib/", "@/lib/")
    .replaceAll("@ankvale/ui/components/", "@/components/ui/")
    .replaceAll("@ankvale/ui/blocks/", "@/components/blocks/")
    .replaceAll("@ankvale/ui/hooks/", "@/hooks/"),
}
files.push(heroFile)
for (const filename of (await readdir(path.join(ui, "src/blocks"))).sort()) {
  if (!filename.endsWith(".tsx") || filename === "heroes.tsx") continue
  files.push({
    path: `registry/ankvale/blocks/${filename}`,
    type: "registry:component",
    target: `@components/blocks/${filename}`,
    content: (await readFile(path.join(ui, "src/blocks", filename), "utf8"))
      .replaceAll("@ankvale/ui/blocks/", "@/components/blocks/")
      .replaceAll("@ankvale/ui/components/", "@/components/ui/")
      .replaceAll("@ankvale/ui/lib/", "@/lib/")
      .replaceAll("@ankvale/ui/hooks/", "@/hooks/"),
  })
}
for (const filename of (await readdir(path.join(ui, "src/templates"))).sort()) {
  if (!filename.endsWith(".tsx")) continue
  const content = (
    await readFile(path.join(ui, "src/templates", filename), "utf8")
  )
    .replaceAll("@ankvale/ui/templates/", "@/components/templates/")
    .replaceAll("@ankvale/ui/components/", "@/components/ui/")
    .replaceAll("@ankvale/ui/hooks/", "@/hooks/")
    .replaceAll("@ankvale/ui/lib/", "@/lib/")
  files.push({
    path: `registry/ankvale/templates/${filename}`,
    type: "registry:component",
    target: `@components/templates/${filename}`,
    content,
  })
}
// Serve MapLibre's standalone module worker instead of its bundler-relative default URL.
const mapLibrePackage = JSON.parse(
  await readFile(
    path.join(root, "node_modules/maplibre-gl/package.json"),
    "utf8"
  )
)
const workerLicense = await readFile(
  path.join(root, "node_modules/maplibre-gl/LICENSE.txt"),
  "utf8"
)
const workerContent =
  `/*\n${workerLicense.replaceAll("*/", "* /")}\n*/\n` +
  (await readFile(
    path.join(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs"),
    "utf8"
  ))
const workerFile = {
  path: "registry/ankvale/assets/maplibre-gl-worker.mjs",
  type: "registry:file",
  target: "public/ankvale-assets/maplibre-gl-worker.mjs",
  content: workerContent,
}
files.push(workerFile)
// Copied/adapted shadcn source must travel with its upstream copyright and terms.
const sourceLicenseFile = {
  path: "registry/ankvale/licenses/shadcn-ui-LICENSE.md",
  type: "registry:file",
  target: "LICENSES/ankvale-shadcn-ui-LICENSE.md",
  content: await readFile(
    path.join(root, "docs/legal/upstream/shadcn-ui-LICENSE.md"),
    "utf8"
  ),
}
const ankvaleLicenseFile = {
  path: "registry/ankvale/licenses/Ankvale-LICENSE.txt",
  type: "registry:file",
  target: "LICENSES/ankvale-ui-LICENSE.txt",
  content: await readFile(path.join(root, "LICENSE"), "utf8"),
}
files.push(sourceLicenseFile, ankvaleLicenseFile)
await mkdir(path.join(root, "apps/web/public/ankvale-assets"), {
  recursive: true,
})
await writeFile(
  path.join(root, "apps/web/public/ankvale-assets/maplibre-gl-worker.mjs"),
  workerContent
)
const pkg = JSON.parse(await readFile(path.join(ui, "package.json"), "utf8"))
pkg.dependencies["maplibre-gl"] = mapLibrePackage.version
pkg.dependencies["@types/qrcode"] = pkg.devDependencies["@types/qrcode"]
const dependencies = Object.entries(pkg.dependencies)
  .filter(([name]) => !["react", "react-dom"].includes(name))
  .map(([name, version]) => `${name}@${version}`)
const item = registryItemSchema.parse({
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "ankvale-ui",
  title: "Ankvale UI",
  type: "registry:style",
  extends: "none",
  description: `${files.filter((file) => file.type === "registry:ui").length} Ankvale components, nine hero layouts, and reusable application/website blocks.`,
  dependencies,
  files,
  cssVars,
  css: registryCss(dependencies),
  docs: "Ankvale styles have been added to your global CSS. Wrap your app with TooltipProvider when using tooltips. Set your sans-serif font to Inter or your preferred system font. Theme switching uses the .dark class.",
})
const output = path.join(root, "apps/web/public/r")
await mkdir(output, { recursive: true })
await writeFile(
  path.join(output, "ankvale-ui.json"),
  JSON.stringify(item, null, 2) + "\n"
)
console.log(
  `Built Ankvale registry: ${files.length} source files, ${files.filter((f) => f.type === "registry:ui").length} components.`
)

const heroItem = registryItemSchema.parse({
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "hero-blocks",
  type: "registry:block",
  title: "Ankvale Hero Blocks",
  description:
    "Nine responsive hero layouts: statement, editorial, showcase, canvas, minimal, product, framed, split, and centered.",
  dependencies: dependencies.filter((name) =>
    ["cn@", "shadcn@", "tw-animate-css@"].some((prefix) =>
      name.startsWith(prefix)
    )
  ),
  files: files.filter(
    (file) =>
      file === heroFile ||
      file === sourceLicenseFile ||
      file === ankvaleLicenseFile ||
      /\/(utils\.ts|motion\.tsx|use-reduced-motion\.ts|ankvale-config\.ts|hero-graphics\.tsx)$/.test(
        file.path
      )
  ),
  cssVars,
  css: registryCss([]),
  docs: 'Import hero layouts from your configured components/blocks/heroes path. Pass your own title, description, actions, and visual as children. Use headingLevel="h1" for your page\'s primary heading.',
})
await writeFile(
  path.join(output, "hero-blocks.json"),
  JSON.stringify(heroItem, null, 2) + "\n"
)
console.log("Built nine installable hero blocks.")

// The gallery catalog is the source of truth for independently installable blocks.
const catalogSource = await readFile(
  path.join(root, "apps/web/lib/block-catalog.ts"),
  "utf8"
)
const catalogJs = (
  await build({
    stdin: {
      contents: catalogSource,
      loader: "ts",
      resolveDir: path.join(root, "apps/web/lib"),
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
  })
).outputFiles[0].text
const { blockDefinitions } = await import(
  `data:text/javascript;base64,${Buffer.from(catalogJs).toString("base64")}`
)

function aliasFor(file) {
  const name = file.path
    .split("/")
    .at(-1)
    .replace(/\.tsx?$/, "")
  if (file.path.includes("/templates/")) return `@/components/templates/${name}`
  if (file.path.includes("/blocks/")) return `@/components/blocks/${name}`
  if (file.type === "registry:ui") return `@/components/ui/${name}`
  if (file.type === "registry:hook") return `@/hooks/${name}`
  return `@/lib/${name}`
}
const byAlias = new Map(files.map((file) => [aliasFor(file), file]))
function closure(start) {
  const selected = new Map([
    [sourceLicenseFile.path, sourceLicenseFile],
    [ankvaleLicenseFile.path, ankvaleLicenseFile],
  ])
  function visit(file) {
    if (selected.has(file.path)) return
    selected.set(file.path, file)
    if (file.path.endsWith("/components/map.tsx")) visit(workerFile)
    for (const match of file.content.matchAll(
      /(?:from\s+|import\s*)["']([^"']+)["']/g
    )) {
      if (match[1].startsWith("@/")) {
        const next = byAlias.get(match[1])
        if (!next)
          throw new Error(
            `Unresolved registry dependency ${match[1]} in ${file.path}`
          )
        visit(next)
      }
    }
  }
  start.forEach(visit)
  return [...selected.values()]
}
for (const block of blockDefinitions) {
  const entry = byAlias.get(`@/components/blocks/${block.module}`)
  if (!entry) throw new Error(`Missing block module: ${block.module}`)
  if (!new RegExp(`export function ${block.component}\\b`).test(entry.content))
    throw new Error(`Missing export ${block.component}`)
  const blockFiles = closure([entry])
  const imports = blockFiles.flatMap((file) =>
    [...file.content.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)].map(
      (match) => match[1]
    )
  )
  const blockDependencies = Object.entries(pkg.dependencies)
    .filter(
      ([name]) =>
        !["react", "react-dom"].includes(name) &&
        imports.some((value) => value === name || value.startsWith(`${name}/`))
    )
    .map(([name, version]) => `${name}@${version}`)
  for (const name of ["shadcn", "tw-animate-css"])
    if (!blockDependencies.some((value) => value.startsWith(`${name}@`)))
      blockDependencies.push(`${name}@${pkg.dependencies[name]}`)
  const blockItem = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: block.id,
    title: block.name,
    type: "registry:block",
    description: `${block.name} with clean default styling.`,
    dependencies: blockDependencies,
    files: blockFiles,
    cssVars,
    css: registryCss(blockDependencies),
    docs: `Import ${block.component} from your configured components/blocks/${block.module} path. Supply your own content. Forms require your own service integration.`,
  })
  await writeFile(
    path.join(output, `${block.id}.json`),
    JSON.stringify(blockItem, null, 2) + "\n"
  )
}
for (const family of ["application", "website"]) {
  const definitions = blockDefinitions.filter(
    (block) => /^app-/.test(block.module) === (family === "application")
  )
  const bundleFiles = closure(
    [...new Set(definitions.map((block) => block.module))].map((name) =>
      byAlias.get(`@/components/blocks/${name}`)
    )
  )
  const imports = bundleFiles.flatMap((file) =>
    [...file.content.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)].map(
      (match) => match[1]
    )
  )
  const bundleDependencies = Object.entries(pkg.dependencies)
    .filter(
      ([name]) =>
        (!["react", "react-dom"].includes(name) &&
          imports.some(
            (value) => value === name || value.startsWith(`${name}/`)
          )) ||
        ["shadcn", "tw-animate-css"].includes(name)
    )
    .map(([name, version]) => `${name}@${version}`)
  const bundle = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `${family}-blocks`,
    title: `Ankvale ${family === "application" ? "Application" : "Website"} Blocks`,
    type: "registry:block",
    description: `${definitions.length} reusable ${family} blocks.`,
    dependencies: bundleDependencies,
    files: bundleFiles,
    cssVars,
    css: registryCss(bundleDependencies),
  })
  await writeFile(
    path.join(output, `${family}-blocks.json`),
    JSON.stringify(bundle, null, 2) + "\n"
  )
}
console.log(
  `Built ${blockDefinitions.length} independently installable application and website blocks.`
)

// Components are individually installable with their local dependency closure.
for (const entry of files.filter((file) => file.type === "registry:ui")) {
  const componentFiles = closure([entry])
  const imports = componentFiles.flatMap((file) =>
    [...file.content.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)].map(
      (match) => match[1]
    )
  )
  const componentDependencies = Object.entries(pkg.dependencies)
    .filter(
      ([name]) =>
        !["react", "react-dom"].includes(name) &&
        imports.some((value) => value === name || value.startsWith(`${name}/`))
    )
    .map(([name, version]) => `${name}@${version}`)
  for (const name of ["shadcn", "tw-animate-css"])
    if (!componentDependencies.some((value) => value.startsWith(`${name}@`)))
      componentDependencies.push(`${name}@${pkg.dependencies[name]}`)
  if (
    componentDependencies.some((name) => name.startsWith("react-big-calendar@"))
  )
    componentDependencies.push(
      `@types/react-big-calendar@${pkg.dependencies["@types/react-big-calendar"]}`
    )
  if (componentDependencies.some((name) => name.startsWith("qrcode@")))
    componentDependencies.push(
      `@types/qrcode@${pkg.dependencies["@types/qrcode"]}`
    )
  const name = path.basename(entry.path, ".tsx")
  const componentItem = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    title: name
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" "),
    type: "registry:ui",
    dependencies: componentDependencies,
    files: componentFiles,
    cssVars,
    css: registryCss(componentDependencies),
  })
  await writeFile(
    path.join(output, `${name}.json`),
    JSON.stringify(componentItem, null, 2) + "\n"
  )
}
console.log("Built individual component registry items.")

await import("./build-block-previews.mjs")
await import("./build-component-docs.mjs")

for (const entry of files.filter(
  (file) =>
    file.path.includes("/templates/") && !file.path.endsWith("/shared.tsx")
)) {
  const name = path.basename(entry.path, ".tsx") + "-template"
  const templateItem = registryItemSchema.parse({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:block",
    title: name,
    files: closure([entry]),
    dependencies,
    cssVars,
    css: registryCss(dependencies),
    docs: "Template data is local by default. Supply service callbacks to connect your application.",
  })
  await writeFile(
    path.join(output, `${name}.json`),
    JSON.stringify(templateItem, null, 2) + "\n"
  )
}
console.log("Built five installable application templates.")

await import("./build-previews.mjs")

await import("./build-skill-downloads.mjs")

const { buildAgentDocs } = await import("./build-agent-docs.mjs")
await buildAgentDocs(blockDefinitions)

await import("./build-icon-catalog.mjs")

await import("./build-documentation.mjs")
