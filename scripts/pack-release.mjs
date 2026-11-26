import { mkdir, writeFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import path from "node:path"
const root = process.cwd()
const destination = path.join(root, ".release/tarballs")
await mkdir(destination, { recursive: true })
const reports = []
for (const packageName of ["ui"]) {
  const report = JSON.parse(
    execFileSync(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", destination],
      { cwd: path.join(root, ".release", packageName), encoding: "utf8" }
    )
  )
  reports.push(...report)
}
await writeFile(
  path.join(root, ".release/pack-report.json"),
  JSON.stringify(reports, null, 2) + "\n"
)
console.log(
  JSON.stringify(
    reports.map(({ name, version, size, unpackedSize, filename }) => ({
      name,
      version,
      size,
      unpackedSize,
      filename,
    })),
    null,
    2
  )
)
