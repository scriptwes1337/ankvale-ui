import { build } from "esbuild"
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
await mkdir(path.join(root, ".cache"), { recursive: true })
const output = path.join(root, ".cache/ankvale-mcp.mjs")
await build({
  entryPoints: [path.join(root, "mcp/server.ts")],
  bundle: true,
  packages: "external",
  platform: "node",
  format: "esm",
  outfile: output,
  logLevel: "silent",
})
await (await import(pathToFileURL(output).href)).start()
