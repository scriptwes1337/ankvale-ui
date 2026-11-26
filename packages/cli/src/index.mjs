#!/usr/bin/env node
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  rename,
  rm,
  lstat,
  realpath,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"
import ts from "typescript"

const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ownPackage = JSON.parse(
  await readFile(path.join(ownRoot, "package.json"), "utf8")
)
const version = ownPackage.version
const runtimeName = "@ankvalelabs/ui"
const startMarker = "<!-- BEGIN ANKVALE -->"
const endMarker = "<!-- END ANKVALE -->"
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex")
async function readOptional(file) {
  try {
    return await readFile(file)
  } catch (error) {
    if (error.code === "ENOENT") return null
    throw error
  }
}
const args = process.argv.slice(2)
const command = args.shift() ?? "help"
const options = new Map()
const positional = []
const booleanOptions = new Set(["dry-run", "no-install", "reset", "help"])
for (let index = 0; index < args.length; index++) {
  const arg = args[index]
  if (!arg.startsWith("--")) {
    positional.push(arg)
    continue
  }
  const key = arg.slice(2)
  if (booleanOptions.has(key)) options.set(key, true)
  else if (
    ["cwd", "agent", "runtime", "path"].includes(key) &&
    args[index + 1] &&
    !args[index + 1].startsWith("--")
  )
    options.set(key, args[++index])
  else {
    console.error(`Ankvale: Unknown or incomplete option: ${arg}`)
    process.exit(1)
  }
}
const cwd = path.resolve(options.get("cwd") ?? process.cwd())
const manifestFile = path.join(cwd, ".ankvale/setup.json")
async function target(relative) {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes(".."))
    throw new Error(`Unsafe project path: ${relative}`)
  const output = path.resolve(cwd, relative)
  if (!output.startsWith(cwd + path.sep))
    throw new Error(`Unsafe project path: ${relative}`)
  let parent = output
  while (parent !== cwd) {
    try {
      const stat = await lstat(parent)
      if (stat.isSymbolicLink())
        throw new Error(`Refusing symlink target: ${relative}`)
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }
    parent = path.dirname(parent)
  }
  return output
}
async function resourceFiles(directory, relative = "") {
  const result = []
  for (const entry of await readdir(path.join(directory, relative), {
    withFileTypes: true,
  })) {
    if (entry.name === "skills" && !relative) continue
    const file = path.posix.join(relative, entry.name)
    if (entry.isDirectory())
      result.push(...(await resourceFiles(directory, file)))
    else if (entry.isFile()) result.push(file)
  }
  return result
}
async function project() {
  const bytes = await readOptional(path.join(cwd, "package.json"))
  if (!bytes)
    throw new Error(
      "No package.json found. Use --cwd to select the Next.js application."
    )
  return JSON.parse(bytes.toString())
}
async function agentAdapters(saved) {
  const requested = options.get("agent")
  if (requested && !["codex", "claude", "both", "none"].includes(requested))
    throw new Error("--agent must be codex, claude, both or none")
  if (!requested && saved?.agents) return saved.agents
  if (requested === "none") return []
  if (!requested && !saved) {
    let hasClaude = false,
      hasCodex = false
    try {
      hasClaude = (await lstat(path.join(cwd, ".claude"))).isDirectory()
    } catch {}
    try {
      hasCodex = (await lstat(path.join(cwd, ".agents"))).isDirectory()
    } catch {}
    if (hasClaude) return hasCodex ? ["codex", "claude"] : ["claude"]
  }
  return requested === "both" ? ["codex", "claude"] : [requested ?? "codex"]
}
async function findLayout(saved) {
  if (saved?.layout) {
    await target(saved.layout)
    return saved.layout
  }
  for (const candidate of [
    "src/app/layout.tsx",
    "app/layout.tsx",
    "src/app/layout.jsx",
    "app/layout.jsx",
  ])
    if (await readOptional(path.join(cwd, candidate))) return candidate
  throw new Error(
    "Expected a Next.js App Router layout.tsx or layout.jsx. Pages Router setup is not supported by this initializer."
  )
}
function integrateLayout(content, filename) {
  if (
    content.includes("<AnkvaleSystemRoot>") &&
    content.includes('"./ankvale-provider"')
  ) {
    if (!content.includes('"@ankvalelabs/ui/styles.css"'))
      throw new Error(
        "The managed provider exists but its stylesheet import is missing. Restore it before updating."
      )
    return content
  }
  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  if (source.parseDiagnostics.length)
    throw new Error(
      "The root layout has syntax errors; resolve them before setup."
    )
  const bodies = []
  function visit(node) {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(source) === "body"
    )
      bodies.push(node)
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (bodies.length !== 1 || /\bAnkvaleSystemRoot\b/.test(content))
    throw new Error(
      "Expected one <body> in the root layout and an unused AnkvaleSystemRoot name. Integrate the provider manually before retrying this layout."
    )
  const body = bodies[0]
  const edits = [
    { at: body.openingElement.end, value: "\n<AnkvaleSystemRoot>" },
    {
      at: body.closingElement.getStart(source),
      value: "</AnkvaleSystemRoot>\n",
    },
  ]
  let importAt = 0
  for (const statement of source.statements) {
    if (
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression)
    )
      importAt = statement.end
    else break
  }
  edits.push({
    at: importAt,
    value:
      '\nimport "@ankvalelabs/ui/styles.css";\n' +
      (options.has("reset") ? 'import "@ankvalelabs/ui/reset.css";\n' : "") +
      'import { AnkvaleSystemRoot } from "./ankvale-provider";\n',
  })
  for (const edit of edits.sort((a, b) => b.at - a.at))
    content = content.slice(0, edit.at) + edit.value + content.slice(edit.at)
  return content
}
async function installedRuntime() {
  try {
    const require = createRequire(path.join(cwd, "package.json"))
    return JSON.parse(
      await readFile(require.resolve(`${runtimeName}/package.json`), "utf8")
    )
  } catch {
    return null
  }
}
async function applyPlan(plan) {
  const changed = []
  for (const [file, bytes] of plan) {
    const current = await readOptional(await target(file))
    if (!current?.equals(bytes)) changed.push({ file, before: current, bytes })
  }
  console.log(
    `${options.has("dry-run") ? "Dry run: " : ""}${changed.length} file(s) ${options.has("dry-run") ? "would change" : "to update"}`
  )
  for (const { file, before } of changed)
    console.log(`  ${before ? "update" : "create"} ${file}`)
  if (options.has("dry-run")) return
  const written = []
  try {
    for (const item of changed) {
      const file = await target(item.file)
      await mkdir(path.dirname(file), { recursive: true })
      const temporary = `${file}.ankvale-${process.pid}.tmp`
      try {
        await writeFile(temporary, item.bytes)
        await rename(temporary, file)
      } finally {
        await rm(temporary, { force: true })
      }
      written.push(item)
    }
  } catch (error) {
    for (const item of written.reverse()) {
      const file = await target(item.file)
      if (item.before) await writeFile(file, item.before)
      else await rm(file, { force: true })
    }
    throw error
  }
}
async function initialize(update = false) {
  await realpath(cwd)
  const pkg = await project()
  if (!pkg.dependencies?.next && !pkg.devDependencies?.next)
    throw new Error(
      "Choose the Next.js application package with --cwd; initialization does not modify a monorepo's sibling apps."
    )
  const priorBytes = await readOptional(manifestFile)
  const prior = priorBytes ? JSON.parse(priorBytes.toString()) : null
  if (update && !prior)
    throw new Error("No Ankvale setup found. Run init first.")
  const agents = await agentAdapters(prior)
  const layout = await findLayout(prior)
  const provider = path.posix.join(
    path.posix.dirname(layout),
    "ankvale-provider.tsx"
  )
  const contextRoot = path.join(ownRoot, "context")
  const files = await resourceFiles(contextRoot)
  const plan = new Map()
  const managed = {}
  const addManaged = async (file, bytes) => {
    const buffer = Buffer.from(bytes)
    const existing = await readOptional(await target(file))
    const priorHash = prior?.managedFiles?.[file]
    if (
      existing &&
      !existing.equals(buffer) &&
      (!priorHash || digest(existing) !== priorHash)
    )
      throw new Error(
        `Locally edited or unowned file: ${file}. It has been preserved; resolve the conflict before retrying.`
      )
    plan.set(file, buffer)
    managed[file] = digest(buffer)
  }
  for (const file of files)
    await addManaged(
      `.ankvale/${file}`,
      await readFile(path.join(contextRoot, file))
    )
  await addManaged(
    ".ankvale/LICENSE",
    await readFile(path.join(ownRoot, "LICENSE"))
  )
  await addManaged(
    ".ankvale/THIRD_PARTY_NOTICES.txt",
    await readFile(path.join(ownRoot, "THIRD_PARTY_NOTICES.txt"))
  )
  for (const agent of agents) {
    const base = agent === "claude" ? ".claude/skills" : ".agents/skills"
    for (const id of ["ankvale-code", "ankvale-design"]) {
      await addManaged(
        `${base}/${id}/SKILL.md`,
        await readFile(path.join(contextRoot, "skills", id, "SKILL.md"))
      )
      await addManaged(
        `${base}/${id}/LICENSE`,
        await readFile(path.join(ownRoot, "LICENSE"))
      )
      for (const file of files)
        await addManaged(
          `${base}/${id}/references/${file}`,
          await readFile(path.join(contextRoot, file))
        )
    }
  }
  const providerSource =
    '"use client"\nimport type { ReactNode } from "react"\nimport { AnkvaleProvider } from "@ankvalelabs/ui"\n\nexport function AnkvaleSystemRoot({ children }: { children: ReactNode }) {\n  return <AnkvaleProvider appearance="inherit" style={{ minHeight: "100svh" }}>{children}<footer style={{ padding: 16, fontSize: 12 }}><a href="https://github.com/scriptwes1337/ankvale-ui">Built with Ankvale UI by Ankvale Labs</a></footer></AnkvaleProvider>\n}\n'
  await addManaged(
    provider,
    layout.endsWith(".jsx")
      ? providerSource
          .replace('import type { ReactNode } from "react"\n', "")
          .replace(": { children: ReactNode }", "")
      : providerSource
  )
  const layoutBytes = await readFile(await target(layout), "utf8")
  const layoutNext = integrateLayout(layoutBytes, layout)
  if (layoutNext !== layoutBytes) plan.set(layout, Buffer.from(layoutNext))
  for (const file of await resourceFiles(path.join(ownRoot, "assets")))
    await addManaged(
      `public/ankvale-assets/${file}`,
      await readFile(path.join(ownRoot, "assets", file))
    )
  const existingInstructions =
    (await readOptional(await target("AGENTS.md")))?.toString() ?? ""
  const block = `${startMarker}\nUse ./.ankvale/AGENTS.md for Ankvale UI ${version}, and read ./.ankvale/catalog.json plus the selected local API before implementation. Follow the product's own design choices and instructions. Keep the visible Ankvale attribution.\n${endMarker}`
  const starts = existingInstructions.split(startMarker).length - 1
  const ends = existingInstructions.split(endMarker).length - 1
  if (starts !== ends || starts > 1)
    throw new Error(
      "AGENTS.md contains duplicate or incomplete Ankvale markers. Existing instructions were preserved."
    )
  let instructions
  if (starts) {
    const begin = existingInstructions.indexOf(startMarker)
    const end = existingInstructions.indexOf(endMarker) + endMarker.length
    const previousBlock = existingInstructions.slice(begin, end)
    if (
      previousBlock !== block &&
      (!prior?.agentsBlockSha256 ||
        digest(previousBlock) !== prior.agentsBlockSha256)
    )
      throw new Error(
        "The Ankvale section in AGENTS.md was edited locally. Existing instructions were preserved."
      )
    instructions =
      existingInstructions.slice(0, begin) +
      block +
      existingInstructions.slice(end)
  } else
    instructions =
      existingInstructions +
      (existingInstructions && !existingInstructions.endsWith("\n")
        ? "\n"
        : "") +
      (existingInstructions ? "\n" : "") +
      block +
      "\n"
  plan.set("AGENTS.md", Buffer.from(instructions))
  // Preserve adapters and their owned files when an explicit update adds another adapter.
  if (prior?.managedFiles)
    for (const [file, value] of Object.entries(prior.managedFiles))
      if (!(file in managed)) managed[file] = value
  const state = {
    schemaVersion: 1,
    cliVersion: version,
    runtimeVersion: version,
    agents,
    layout,
    managedFiles: managed,
    agentsBlockSha256: digest(block),
  }
  plan.set(
    ".ankvale/setup.json",
    Buffer.from(JSON.stringify(state, null, 2) + "\n")
  )
  const runtimeSpec =
    options.get("runtime") ??
    (update ? version : (pkg.dependencies?.[runtimeName] ?? version))
  if (typeof runtimeSpec !== "string" || /[\r\n\0]/.test(runtimeSpec))
    throw new Error("Invalid runtime package specifier")
  const dependency =
    runtimeSpec.startsWith("file:") || runtimeSpec.endsWith(".tgz")
      ? runtimeSpec
      : `${runtimeName}@${runtimeSpec}`
  const packageNext = {
    ...pkg,
    dependencies: { ...pkg.dependencies, [runtimeName]: runtimeSpec },
  }
  plan.set(
    "package.json",
    Buffer.from(JSON.stringify(packageNext, null, 2) + "\n")
  )
  if (!options.has("dry-run") && !options.has("no-install")) {
    console.log(`Installing ${dependency} with lifecycle scripts disabled…`)
    const npmArguments = [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      dependency,
    ]
    const result = process.env.npm_execpath
      ? spawnSync(
          process.execPath,
          [process.env.npm_execpath, ...npmArguments],
          { cwd, stdio: "inherit" }
        )
      : spawnSync("npm", npmArguments, { cwd, stdio: "inherit" })
    if (result.error || result.status !== 0)
      throw new Error(
        "Runtime installation failed. Project UI/context files have not been changed."
      )
    plan.delete("package.json")
  }
  if (!options.has("dry-run")) {
    const installed = await installedRuntime()
    if (installed && installed.version !== version)
      throw new Error(
        `Runtime/context mismatch: installed ${installed.version}, expected ${version}. Project UI/context files have not been changed.`
      )
    if (!installed && !options.has("no-install"))
      throw new Error("Runtime could not be resolved after installation")
  }
  await applyPlan(plan)
  console.log(
    options.has("dry-run")
      ? "No files changed and no installation performed."
      : `Ankvale ${version} configured for ${agents.join(", ") || "AGENTS.md only"}. Run ankvale doctor to inspect setup.`
  )
}
async function doctor() {
  const bytes = await readOptional(manifestFile)
  if (!bytes) throw new Error("No setup manifest. Run init first.")
  const state = JSON.parse(bytes.toString())
  const problems = []
  const runtime = await installedRuntime()
  if (runtime?.version !== state.runtimeVersion)
    problems.push(
      `Expected ${runtimeName}@${state.runtimeVersion}; found ${runtime?.version ?? "not installed"}`
    )
  for (const [file, expected] of Object.entries(state.managedFiles)) {
    const content = await readOptional(await target(file))
    if (!content || digest(content) !== expected)
      problems.push(`Missing or locally changed managed file: ${file}`)
  }
  const instructions =
    (await readOptional(await target("AGENTS.md")))?.toString() ?? ""
  const begin = instructions.indexOf(startMarker)
  const end = instructions.indexOf(endMarker) + endMarker.length
  if (
    begin < 0 ||
    digest(instructions.slice(begin, end)) !== state.agentsBlockSha256 ||
    instructions.split(startMarker).length !== 2
  )
    problems.push("AGENTS.md Ankvale section is missing, duplicated or changed")
  const layout =
    (await readOptional(await target(state.layout)))?.toString() ?? ""
  if (
    !layout.includes("<AnkvaleSystemRoot>") ||
    !layout.includes('"@ankvalelabs/ui/styles.css"')
  )
    problems.push("Root provider or stylesheet import is missing")
  const context = JSON.parse(
    (await readFile(await target(".ankvale/catalog.json"))).toString()
  )
  if (context.version !== state.runtimeVersion)
    problems.push("Local catalog version does not match the runtime")
  for (const entry of context.entries)
    if (!(await readOptional(await target(`.ankvale/${entry.file}`))))
      problems.push(`Missing API: ${entry.file}`)
  if (problems.length) throw new Error(problems.join("\n"))
  console.log(
    `Ankvale ${state.runtimeVersion}: runtime, ${state.agents.join(", ") || "AGENTS.md"}, local APIs, provider/styles and managed files verified. Product flows, appearance and attribution placement still require application review.`
  )
}
async function addTemplate() {
  const template = positional[0]
  const exports = {
    dashboard: "DashboardTemplate",
    mail: "MailTemplate",
    chat: "ChatTemplate",
    crm: "CrmTemplate",
    finances: "FinancesTemplate",
  }
  if (!exports[template] || !options.get("path"))
    throw new Error(
      "Use add <dashboard|mail|chat|crm|finances> --path app/<route>/page.tsx"
    )
  if (!(await readOptional(manifestFile)))
    throw new Error("Run init before adding a template route")
  const file = options.get("path")
  if (!/^(?:src\/)?app\/.+\/page\.tsx$/.test(file))
    throw new Error(
      "Choose an explicit App Router page.tsx under app/ or src/app/"
    )
  if (await readOptional(await target(file)))
    throw new Error(`Route already exists and was preserved: ${file}`)
  await applyPlan(
    new Map([
      [
        file,
        Buffer.from(
          `"use client"\nimport { ${exports[template]} } from "@ankvalelabs/ui/templates/${template}"\n\nexport default function Page() { return <${exports[template]} /> }\n`
        ),
      ],
    ])
  )
}
try {
  if (command === "init") await initialize()
  else if (command === "update") await initialize(true)
  else if (command === "doctor") await doctor()
  else if (command === "add") await addTemplate()
  else if (["help", "--help", "-h"].includes(command) || options.has("help"))
    console.log(
      `Ankvale CLI ${version}\ninit | update | doctor | add <template> --path app/<route>/page.tsx\n--cwd <app> --agent codex|claude|both|none --dry-run --no-install --runtime <version-or-tarball> --reset`
    )
  else throw new Error(`Unknown command: ${command}`)
} catch (error) {
  console.error(`Ankvale: ${error.message}`)
  process.exitCode = 1
}
