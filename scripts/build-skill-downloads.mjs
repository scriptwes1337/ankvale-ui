import { readFile, readdir, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { zipSync } from "fflate"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = path.join(root, "apps/web/public/downloads")
await mkdir(output, { recursive: true })
const license = new Uint8Array(await readFile(path.join(root, "LICENSE")))
const guides = {}
for (const file of await readdir(path.join(root, "docs/agents"))) {
  if (!/\.(md|json)$/.test(file)) continue
  guides[`agents/${file}`] = new Uint8Array(
    await readFile(path.join(root, "docs/agents", file))
  )
}

for (const id of ["ankvale-code", "ankvale-design"]) {
  const skill = (
    await readFile(path.join(root, "skills", id, "SKILL.md"), "utf8")
  ).replaceAll("../../docs/", "references/")
  const entries = {
    [`${id}/SKILL.md`]: new TextEncoder().encode(skill),
    [`${id}/LICENSE`]: license,
  }
  for (const [file, content] of Object.entries(guides))
    entries[`${id}/references/${file}`] = content
  await writeFile(path.join(output, `${id}.zip`), zipSync(entries))
}
const agentFiles = { "ankvale-ui/LICENSE": license }
for (const [file, content] of Object.entries(guides))
  agentFiles[`ankvale-ui/${file.replace(/^agents\//, "")}`] = content
await writeFile(
  path.join(output, "ankvale-agent-guide.zip"),
  zipSync(agentFiles)
)
console.log("Built two self-contained agent skills and the agent guide bundle.")
