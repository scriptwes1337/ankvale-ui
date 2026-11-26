import { readFile, readdir, mkdir, writeFile, cp, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import ts from "typescript"
import postcss from "postcss"
import tailwind from "@tailwindcss/postcss"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = path.join(root, ".release")
const version = "0.1.0"
const ui = path.join(output, "ui")
const cli = path.join(ui, "cli")
const hash = (text) => createHash("sha256").update(text).digest("hex")
const readJSON = async (file) => JSON.parse(await readFile(file, "utf8"))
async function put(file, content) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content)
}
async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(file)))
    else files.push(file)
  }
  return files
}
// .release contains generated candidates only. Never publish a workspace root.
await rm(output, { recursive: true, force: true })
await mkdir(ui, { recursive: true })
await mkdir(cli, { recursive: true })
const source = path.join(root, "packages/ui/src")
const sourceFiles = (await walk(source)).filter((file) =>
  /\.(ts|tsx)$/.test(file)
)
const parsedConfig = ts.readConfigFile(
  path.join(root, "packages/ui/tsconfig.json"),
  ts.sys.readFile
)
const config = ts.parseJsonConfigFileContent(
  parsedConfig.config,
  ts.sys,
  path.join(root, "packages/ui")
)
const options = {
  ...config.options,
  rootDir: source,
  outDir: path.join(ui, "dist"),
  declaration: true,
  declarationMap: false,
  sourceMap: false,
  noEmit: false,
  emitDeclarationOnly: false,
  noEmitOnError: true,
  incremental: false,
}
const program = ts.createProgram(sourceFiles, options)
const diagnostics = ts.getPreEmitDiagnostics(program)
if (diagnostics.length)
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (file) => file,
      getNewLine: () => "\n",
    })
  )
const writes = []
const emitted = program.emit(undefined, (file, content) => {
  const transformed = content.replace(
    /(["'])@ankvale\/ui\/([^"']+)\1/g,
    (_match, quote, subpath) => {
      let relative = path
        .relative(path.dirname(file), path.join(ui, "dist", `${subpath}.js`))
        .split(path.sep)
        .join("/")
      if (!relative.startsWith(".")) relative = `./${relative}`
      return `${quote}${relative}${quote}`
    }
  )
  writes.push(put(file, transformed))
})
if (emitted.emitSkipped) throw new Error("Runtime compilation did not emit")
await Promise.all(writes)
await put(
  path.join(ui, "dist/index.js"),
  '"use client";\nexport { AnkvaleProvider, useAnkvaleConfig } from "./components/ankvale-provider.js";\nexport { Button } from "./components/button.js";\n'
)
await put(
  path.join(ui, "dist/index.d.ts"),
  'export { AnkvaleProvider, useAnkvaleConfig } from "./components/ankvale-provider.js";\nexport { Button } from "./components/button.js";\n'
)
for (const [file, entry, directive] of [
  ["icons", "@phosphor-icons/react", '"use client";\n'],
  ["icons-ssr", "@phosphor-icons/react/ssr", ""],
]) {
  await put(
    path.join(ui, `dist/${file}.js`),
    `${directive}export * from "${entry}";\n`
  )
  await put(path.join(ui, `dist/${file}.d.ts`), `export * from "${entry}";\n`)
}
let css = await readFile(path.join(source, "styles/globals.css"), "utf8")
css = css.replace(
  '@import "tailwindcss";',
  '@layer theme, base, components, utilities;\n@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/preflight.css" layer(base);\n@import "tailwindcss/utilities.css" layer(utilities);'
)
css = css.replace(
  '@import "shadcn/tailwind.css";',
  await readFile(
    path.join(root, "node_modules/shadcn/dist/tailwind.css"),
    "utf8"
  )
)
css = css.replace(/^@source .+;$/gm, "")
css += `\n@source ${JSON.stringify(source)};\n@source ${JSON.stringify(path.join(root, "node_modules/streamdown/dist"))};\n`
css +=
  '\n[data-slot="ankvale-provider"] { font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif); line-height: 1.5; color: var(--foreground); background: var(--background); box-sizing: border-box; }\n'
const result = await postcss([tailwind({ optimize: false })]).process(css, {
  from: path.join(root, "packages/ui/release.css"),
})
const scoped = postcss.parse(result.css)
const scope = ':where([data-slot="ankvale-provider"])'
scoped.walkRules((rule) => {
  let parent = rule.parent
  while (parent && parent.type !== "root") {
    if (
      parent.type === "rule" ||
      (parent.type === "atrule" && /keyframes$/i.test(parent.name))
    )
      return
    parent = parent.parent
  }
  if (
    rule.selectors.every((selector) =>
      /^(?::root|:host|\.dark)$/.test(selector.trim())
    )
  )
    return
  if (
    rule.selectors.some((selector) => /^(?:body|html)$/.test(selector.trim()))
  ) {
    rule.remove()
    return
  }
  rule.selectors = rule.selectors.flatMap((selector) => {
    if (selector.includes('[data-slot="ankvale-provider"]')) return [selector]
    return selector.includes("::")
      ? [`${scope} ${selector}`]
      : [`${scope} ${selector}`, `${selector}${scope}`]
  })
})
await put(path.join(ui, "dist/styles.css"), scoped.toString())
await put(
  path.join(ui, "dist/reset.css"),
  await readFile(path.join(root, "node_modules/tailwindcss/preflight.css"))
)
const sourcePkg = await readJSON(path.join(root, "packages/ui/package.json"))
const dependencies = {}
for (const name of Object.keys(sourcePkg.dependencies)) {
  if (["react", "react-dom", "shadcn", "next-themes"].includes(name)) continue
  dependencies[name] = (
    await readJSON(path.join(root, "node_modules", name, "package.json"))
  ).version
}
dependencies.typescript = ts.version
dependencies["@types/qrcode"] = (
  await readJSON(path.join(root, "node_modules/@types/qrcode/package.json"))
).version
const exports = {
  ".": { types: "./dist/index.d.ts", import: "./dist/index.js" },
  "./styles.css": "./dist/styles.css",
  "./globals.css": "./dist/styles.css",
  "./reset.css": "./dist/reset.css",
  "./icons": { types: "./dist/icons.d.ts", import: "./dist/icons.js" },
  "./icons/ssr": {
    types: "./dist/icons-ssr.d.ts",
    import: "./dist/icons-ssr.js",
  },
  "./package.json": "./package.json",
  "./assets/*": "./assets/*",
}
for (const folder of ["components", "blocks", "templates", "hooks", "lib"])
  exports[`./${folder}/*`] = {
    types: `./dist/${folder}/*.d.ts`,
    import: `./dist/${folder}/*.js`,
  }
const common = {
  version,
  type: "module",
  license: "SEE LICENSE IN LICENSE",
  author: "Ankvale Labs",
  repository: {
    type: "git",
    url: "git+https://github.com/scriptwes1337/ankvale-ui.git",
  },
  homepage: "https://github.com/scriptwes1337/ankvale-ui#readme",
  bugs: "https://github.com/scriptwes1337/ankvale-ui/issues",
  engines: { node: ">=22.13.0" },
  publishConfig: { access: "public" },
}
await put(
  path.join(ui, "package.json"),
  JSON.stringify(
    {
      name: "@ankvalelabs/ui",
      ...common,
      description:
        "React frontend system: components, blocks, templates, animations, icons and product graphics",
      bin: { ankvale: "./cli/index.mjs" },
      sideEffects: ["**/*.css"],
      files: [
        "dist",
        "cli",
        "assets",
        "context",
        "LICENSE",
        "THIRD_PARTY_NOTICES.txt",
        "README.md",
      ],
      exports,
      peerDependencies: { react: "^19.3.0", "react-dom": "^19.3.0" },
      dependencies,
    },
    null,
    2
  ) + "\n"
)
await cp(
  path.join(root, "apps/web/public/ankvale-assets"),
  path.join(ui, "assets"),
  { recursive: true }
)
const context = path.join(ui, "context")
const rewrite = (content) =>
  content
    .replaceAll("@ankvale/ui/", "@ankvalelabs/ui/")
    .replaceAll("@/components/ui/", "@ankvalelabs/ui/components/")
    .replaceAll("@/components/blocks/", "@ankvalelabs/ui/blocks/")
    .replaceAll("@/components/templates/", "@ankvalelabs/ui/templates/")
    .replaceAll("@/hooks/", "@ankvalelabs/ui/hooks/")
    .replaceAll("@/lib/", "@ankvalelabs/ui/lib/")
const apis = []
for (const kind of ["components", "blocks", "templates"]) {
  for (const file of await readdir(
    path.join(
      root,
      "apps/web/public/api",
      kind === "blocks" ? "block-modules" : kind
    )
  )) {
    if (!file.endsWith(".json")) continue
    const api = JSON.parse(
      rewrite(
        await readFile(
          path.join(
            root,
            "apps/web/public/api",
            kind === "blocks" ? "block-modules" : kind,
            file
          ),
          "utf8"
        )
      )
    )
    delete api.registry
    delete api.sourcePath
    delete api.preview
    if (api.variants)
      api.variants = api.variants.map(
        ({ registry, preview, ...variant }) => variant
      )
    await put(
      path.join(context, "api", kind, file),
      JSON.stringify(api, null, 2) + "\n"
    )
    apis.push({
      id: api.id,
      kind,
      importPath: api.importPath,
      file: `api/${kind}/${file}`,
      exports: api.exports?.map((item) => item.name) ?? [],
    })
  }
}
const blocks = await readJSON(
  path.join(root, "apps/web/public/api/blocks.json")
)
for (const block of blocks) {
  const module = block.module
  if (!module) continue
  apis.push({
    id: block.id,
    name: block.name,
    kind: "blocks",
    importPath: `@ankvalelabs/ui/blocks/${module}`,
    file: `api/blocks/${module}.json`,
    exports: block.component ? [block.component] : (block.exports ?? []),
  })
}
await put(
  path.join(context, "catalog.json"),
  JSON.stringify(
    { version, package: "@ankvalelabs/ui", entries: apis },
    null,
    2
  ) + "\n"
)
await put(
  path.join(context, "patterns.json"),
  await readFile(path.join(root, "docs/agents/patterns.json"))
)
for (const [name, input] of [
  ["design.md", "docs/agents/design-guide.md"],
  ["motion.md", "docs/agents/motion-guide.md"],
  ["customization.md", "docs/handbook/customization.md"],
])
  await put(
    path.join(context, name),
    rewrite(await readFile(path.join(root, input), "utf8"))
      .replaceAll("(motion-assets.md)", "(motion.md)")
      .replace(
        /## Design manifests and the studio[\s\S]*?(?=## Motion customization)/,
        "## Product design decisions\n\nKeep brand tokens, typography, density and component exceptions in your project alongside its agent instructions. The hosted Ankvale design editor can export CSS and JSON; adapt exported CSS selectors to the provider scope. The npm runtime does not include the repository-only design-system authoring package.\n\n"
      )
  )
await put(
  path.join(context, "AGENTS.md"),
  `# Ankvale UI ${version}\n\nUse the installed @ankvalelabs/ui package. Import compiled styles once and wrap the app in AnkvaleProvider. No shadcn CLI or consumer Tailwind build is required. Read catalog.json to find real imports and api/<kind>/<id>.json for exact APIs. Start from a matching template or block before composing primitives. patterns.json contains selection recipes; registry IDs are discovery names, not install commands. Check catalog import paths and exports before coding.\n\nRead design.md for presentation, customization.md for branding and motion.md for animations. Use direct feature imports; defer heavy widgets. Products own authentication, data, permissions and persistence. Templates use demo data until callbacks are connected. Preserve keyboard, focus and reduced-motion behavior.\n\nEvery app or website using Ankvale UI must visibly display “Built with Ankvale UI by Ankvale Labs” in its footer or a normally accessible About/Credits/Legal screen. Retain LICENSE and third-party notices. Product instructions and the user's explicit design choices take precedence over default appearance.\n`
)
for (const id of ["ankvale-code", "ankvale-design"]) {
  const content = `---\nname: ${id}\ndescription: ${id === "ankvale-code" ? "Compose React interfaces with the installed Ankvale frontend system and its exact component, block and template APIs." : "Apply Ankvale design, theme and motion conventions to a React product using its installed design manifest."}\n---\n\nUse this skill when building or customizing interfaces with @ankvalelabs/ui. Start with [the local Ankvale guide](references/AGENTS.md), then read the selected API from references/api using references/catalog.json. Use a suitable template or block before composing controls. Read references/design.md, references/motion.md or references/customization.md for the task. These resources match ${version}; do not infer APIs from a different UI library. The project owns service integrations and product decisions. Preserve the required visible Ankvale attribution.\n`
  await put(path.join(context, "skills", id, "SKILL.md"), content)
}
for (const directory of [ui]) {
  await cp(path.join(root, "LICENSE"), path.join(directory, "LICENSE"))
  await cp(
    path.join(root, "docs/legal/THIRD_PARTY_NOTICES.txt"),
    path.join(directory, "THIRD_PARTY_NOTICES.txt")
  )
}
await put(
  path.join(ui, "README.md"),
  `# @ankvalelabs/ui\n\nAnkvale UI ${version}: a React frontend system by Ankvale Labs.\n\nInstall with npm install @ankvalelabs/ui react react-dom, or initialize a Next.js App Router project with npx @ankvalelabs/ui init.\n\nImport @ankvalelabs/ui/styles.css once and wrap the application in AnkvaleProvider from @ankvalelabs/ui. Import components from @ankvalelabs/ui/components/<id>, blocks from /blocks/<module>, templates from /templates/<name>, and icons from /icons (or /icons/ssr for server rendering). Read context/catalog.json and the selected API rather than guessing export names.\n\nStyles are precompiled; consumer Tailwind/shadcn setup is not required. Component selectors are scoped to AnkvaleProvider; semantic default variables are global. reset.css is a separate optional application reset. Load product overrides after styles.css. Do not wrap the provider in a transformed or clipped ancestor when using fixed overlays.\n\nThe CLI installs the version-matched MapLibre worker under public/ankvale-assets. For manual setup, copy assets/maplibre-gl-worker.mjs to that path or pass a hosted workerUrl to Map. Map tiles/styles and their attribution are your responsibility.\n\nThe package includes local catalog/API/design resources, not the Ankvale marketing website or documentation application. Native components are a separate source package and are not included here.\n\nEvery app or website using Ankvale must visibly display: Built with Ankvale UI by Ankvale Labs. See LICENSE for the custom attribution terms. Third-party materials retain their own licenses.\n`
)
const cliSource = path.join(root, "packages/cli/src/index.mjs")
await cp(cliSource, path.join(cli, "index.mjs"))
await put(
  path.join(ui, "README.md"),
  (await readFile(path.join(ui, "README.md"), "utf8")) +
    `\n## Project setup\n\nRun npx @ankvalelabs/ui init in a Next.js App Router project. Options: --cwd <app>, --agent codex|claude|both|none, --dry-run, --no-install, --runtime <tarball-or-version>, --reset. Init installs this package at the matching version, provider/styles, local .ankvale docs/catalogs and project-local skills. It creates or extends AGENTS.md while preserving project instructions and existing routes.\n\nRun npx @ankvalelabs/ui update to refresh managed context; npx @ankvalelabs/ui doctor to inspect setup; npx @ankvalelabs/ui add <dashboard|mail|chat|crm|finances> --path app/<route>/page.tsx to scaffold a selected template. Use --dry-run to review changes. Edited managed files are preserved and reported as conflicts. Global agent settings are not modified. Initialization invokes npm with lifecycle scripts disabled. The Node CLI and its TypeScript parser have a separate entry from the browser runtime.\n`
)
const artifactReport = {
  version,
  builtFrom: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim(),
  workingTreeDirty: Boolean(
    execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      encoding: "utf8",
    }).trim()
  ),
  packages: [],
}
for (const directory of [ui]) {
  const files = await walk(directory)
  const manifest = await readJSON(path.join(directory, "package.json"))
  if (files.some((file) => /\/apps\/web\//.test(file)))
    throw new Error("Website content leaked into release")
  for (const file of files.filter((file) => /\.(?:js|mjs|ts)$/.test(file))) {
    if (
      /['"](?:@ankvale\/|@workspace\/|@\/)/.test(await readFile(file, "utf8"))
    )
      throw new Error(`Unresolved workspace alias: ${file}`)
  }
  artifactReport.packages.push({
    name: manifest.name,
    version,
    files: files.length,
    unpackedBytes: (
      await Promise.all(
        files.map(async (file) => (await readFile(file)).byteLength)
      )
    ).reduce((a, b) => a + b, 0),
    manifestSha256: hash(await readFile(path.join(directory, "package.json"))),
  })
}
await put(
  path.join(output, "report.json"),
  JSON.stringify(artifactReport, null, 2) + "\n"
)
console.log(JSON.stringify(artifactReport, null, 2))
