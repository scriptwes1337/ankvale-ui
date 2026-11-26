import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const output = path.join(root, "docs/legal")
const hash = (value) => createHash("sha256").update(value).digest("hex")
const lockText = await readFile(path.join(root, "package-lock.json"), "utf8")
const lock = JSON.parse(lockText)
const auditedOn = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Singapore",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date())
const firstPackages = new Map()
const firstVersions = new Map()
const history = execFileSync(
  "git",
  ["log", "--reverse", "--format=%H|%aI", "--", "package-lock.json"],
  { cwd: root, encoding: "utf8" }
)
  .trim()
  .split("\n")
  .filter(Boolean)
const packageName = (key) => key.split("node_modules/").at(-1)
for (const entry of history) {
  const [commit, date] = entry.split("|")
  let oldLock
  try {
    oldLock = JSON.parse(
      execFileSync("git", ["show", `${commit}:package-lock.json`], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 30_000_000,
      })
    )
  } catch {
    continue
  }
  for (const [location, item] of Object.entries(oldLock.packages ?? {})) {
    if (!location.includes("node_modules/") || item.link) continue
    const name = item.name ?? packageName(location)
    if (!firstPackages.has(name)) firstPackages.set(name, { date, commit })
    const versionKey = `${name}@${item.version}`
    if (!firstVersions.has(versionKey))
      firstVersions.set(versionKey, { date, commit })
  }
}
const manifests = ["package.json"]
for (const parent of ["apps", "packages"]) {
  for (const folder of await readdir(path.join(root, parent), {
    withFileTypes: true,
  })) {
    if (folder.isDirectory()) {
      const file = `${parent}/${folder.name}/package.json`
      try {
        await readFile(path.join(root, file))
        manifests.push(file)
      } catch {}
    }
  }
}
const declarations = []
for (const manifestPath of manifests) {
  const manifest = JSON.parse(
    await readFile(path.join(root, manifestPath), "utf8")
  )
  for (const kind of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [name, requested] of Object.entries(manifest[kind] ?? {})) {
      if (name.startsWith("@ankvale/") || name.startsWith("@workspace/"))
        continue
      let directory = path.dirname(manifestPath)
      let location
      while (true) {
        const candidate = path.posix.join(directory, "node_modules", name)
        if (lock.packages[candidate] && !lock.packages[candidate].link) {
          location = candidate
          break
        }
        if (directory === ".") break
        directory = path.dirname(directory)
      }
      declarations.push({
        owner: manifest.name,
        manifest: manifestPath,
        kind,
        name,
        requested,
        location: location ?? null,
      })
    }
  }
}
const texts = new Map()
async function collectNotices(base, relative = "", depth = 0) {
  let entries
  try {
    entries = await readdir(path.join(base, relative), { withFileTypes: true })
  } catch {
    return []
  }
  const found = []
  for (const entry of entries) {
    const file = path.posix.join(relative, entry.name)
    if (
      entry.isDirectory() &&
      !["node_modules", ".git", "test", "tests", "__tests__"].includes(
        entry.name
      ) &&
      depth < 12
    ) {
      found.push(...(await collectNotices(base, file, depth + 1)))
    } else if (
      entry.isFile() &&
      /^(licen[sc]e|copying|notice|copyright)([.\-_]|$)/i.test(entry.name) &&
      !/\.(js|ts|map|wasm|node|json)$/i.test(entry.name)
    ) {
      const bytes = await readFile(path.join(base, file))
      const sha256 = hash(bytes)
      if (!texts.has(sha256))
        texts.set(sha256, { text: bytes.toString("utf8"), sources: [] })
      found.push({ path: file, sha256 })
    }
  }
  return found
}
const locations = Object.entries(lock.packages).filter(
  ([location, item]) => location.includes("node_modules/") && !item.link
)
const rows = []
for (const [location, item] of locations) {
  const name = item.name ?? packageName(location)
  let installed = null
  try {
    installed = JSON.parse(
      await readFile(path.join(root, location, "package.json"), "utf8")
    )
  } catch {}
  const legacyLicense = installed?.licenses
    ?.map((license) => license.type)
    .join(" OR ")
  const declaredLicense =
    typeof installed?.license === "string"
      ? installed.license
      : installed?.license?.type
  const license = declaredLicense ?? legacyLicense ?? item.license ?? "UNKNOWN"
  const licenseFiles = installed
    ? await collectNotices(path.join(root, location))
    : []
  for (const file of licenseFiles)
    texts
      .get(file.sha256)
      .sources.push(`${name}@${item.version}: ${location}/${file.path}`)
  rows.push({
    name,
    version: item.version,
    location,
    license,
    lockfileLicense: item.license ?? null,
    installedVersion: installed?.version ?? null,
    installed: !!installed,
    optional: !!item.optional,
    devOnly: !!item.dev,
    repository:
      typeof installed?.repository === "string"
        ? installed.repository
        : (installed?.repository?.url ?? null),
    homepage: installed?.homepage ?? null,
    integrity: item.integrity ?? null,
    firstInstallationDate: null,
    firstRepositoryRecord: firstPackages.get(name) ?? null,
    firstVersionRepositoryRecord:
      firstVersions.get(`${name}@${item.version}`) ?? null,
    licenseFiles,
    review: [
      ...(!installed
        ? [
            "Not installed on audit platform; package metadata/text not inspected",
          ]
        : []),
      ...(installed && !licenseFiles.length
        ? [
            "No standalone license/notice file found; inspect README and upstream source",
          ]
        : []),
      ...(license === "UNKNOWN" ? ["License metadata unresolved"] : []),
      ...(installed && installed.version !== item.version
        ? ["Installed version differs from lockfile"]
        : []),
      ...(/LGPL|MPL|CC-BY|AFL/.test(license)
        ? ["Distribution-specific obligations require artifact review"]
        : []),
    ],
  })
}
rows.sort(
  (a, b) =>
    a.name.localeCompare(b.name) ||
    a.version.localeCompare(b.version) ||
    a.location.localeCompare(b.location)
)
const direct = declarations.map((item) => ({
  ...item,
  resolved: rows.find((row) => row.location === item.location) ?? null,
}))
const summary = {
  packageInstances: rows.length,
  uniquePackages: new Set(rows.map((row) => row.name)).size,
  directPackageNames: new Set(direct.map((row) => row.name)).size,
  installedInstances: rows.filter((row) => row.installed).length,
  absentInstances: rows.filter((row) => !row.installed).length,
  installedWithoutStandaloneNotice: rows.filter(
    (row) => row.installed && !row.licenseFiles.length
  ).length,
  unresolvedLicenseMetadata: rows.filter((row) => row.license === "UNKNOWN")
    .length,
  versionMismatches: rows.filter(
    (row) => row.installed && row.installedVersion !== row.version
  ).length,
  licenseFiles: rows.reduce((total, row) => total + row.licenseFiles.length, 0),
  uniqueNoticeTexts: texts.size,
}
await mkdir(output, { recursive: true })
const report = {
  schemaVersion: 1,
  auditedOn,
  timeZone: "Asia/Singapore",
  lockfileSha256: hash(lockText),
  historyCommitsInspected: history.length,
  complianceStatus:
    "Evidence collected; distribution review remains open. Not a legal certification.",
  installationDatePolicy:
    "Actual first-install timestamps were not recorded. Git dates are first repository evidence only; null means unavailable in committed history.",
  summary,
  direct,
  packages: rows,
}
await writeFile(
  path.join(output, "dependency-inventory.json"),
  JSON.stringify(report, null, 2) + "\n"
)
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`
const columns = [
  "name",
  "version",
  "license",
  "location",
  "installedVersion",
  "optional",
  "devOnly",
  "firstInstallationDate",
]
const csvHeader = [
  ...columns,
  "firstRepositoryRecord",
  "firstVersionRepositoryRecord",
  "review",
]
  .map(escape)
  .join(",")
const csvRows = rows.map((row) =>
  [
    ...columns.map((column) => row[column]),
    row.firstRepositoryRecord?.date,
    row.firstVersionRepositoryRecord?.date,
    row.review.join("; "),
  ]
    .map(escape)
    .join(",")
)
await writeFile(
  path.join(output, "dependency-inventory.csv"),
  [csvHeader, ...csvRows].join("\n") + "\n"
)
await writeFile(
  path.join(output, "THIRD_PARTY_NOTICES.txt"),
  `ANKVALE UI — THIRD-PARTY LICENSE AND NOTICE TEXTS\n\nThis file retains copyright and license texts for third-party software used by Ankvale UI and its supporting tools. Each license applies to its respective material. Preserve the applicable notices when redistributing that material. Ankvale's original work is licensed separately under the Ankvale Attribution License.\n\n` +
    [...texts.entries()]
      .map(
        ([sha256, entry]) =>
          `===== SHA-256 ${sha256} =====\nSource files:\n${entry.sources.join("\n")}\n\n${entry.text}\n`
      )
      .join("\n")
)
const table = [
  "# Direct dependency versions and provenance",
  "",
  `Generated on ${auditedOn} from workspace manifests, package-lock.json, installed artifacts and committed lockfile history.`,
  "",
  "**First installation date: not recorded for any package.** The date below is the first available Git record of the package name, not an installation timestamp. New uncommitted additions are marked unavailable. Exact-version first-record evidence is in the JSON inventory. Versions are this snapshot, not claims about latest releases.",
  "",
  "| Package | Exact locked version | License evidence | First repository record | Declared by |",
  "| --- | --- | --- | --- | --- |",
]
for (const name of [...new Set(direct.map((row) => row.name))].sort()) {
  const uses = direct.filter((row) => row.name === name)
  const resolved = [
    ...new Set(uses.map((row) => row.resolved?.version ?? "Unresolved")),
  ].join(", ")
  const licenses = [
    ...new Set(uses.map((row) => row.resolved?.license ?? "UNKNOWN")),
  ].join("; ")
  table.push(
    `| ${name} | ${resolved} | ${licenses} | ${firstPackages.get(name)?.date ?? "Unavailable in committed history"} | ${uses.map((row) => `${row.owner} (${row.kind})`).join("; ")} |`
  )
}
table.push(
  "",
  "Full transitive records: [JSON](dependency-inventory.json), [CSV](dependency-inventory.csv). Preserved texts: [third-party notices](THIRD_PARTY_NOTICES.txt). License identifiers are inventory evidence, not a substitute for package-specific terms."
)
await writeFile(path.join(output, "dependencies.md"), table.join("\n") + "\n")
console.log(JSON.stringify(summary, null, 2))

const publicTable = [
  "# Dependency versions and licenses",
  "",
  `Package snapshot: ${auditedOn}.`,
  "",
  "Ankvale uses the following packages across its components, native package, website and development tools. Individual registry items install only their declared dependencies; you do not need every package listed here in each application.",
  "",
  "| Package | Version | License |",
  "| --- | --- | --- |",
]
for (const name of [...new Set(direct.map((row) => row.name))].sort()) {
  const uses = direct.filter((row) => row.name === name)
  const versions = [
    ...new Set(uses.map((row) => row.resolved?.version ?? "Not resolved")),
  ].join(", ")
  const licenses = [
    ...new Set(uses.map((row) => row.resolved?.license ?? "See package terms")),
  ].join("; ")
  publicTable.push(`| ${name} | ${versions} | ${licenses} |`)
}
publicTable.push(
  "",
  "License identifiers summarize the package metadata; the applicable package terms and copyright notices remain authoritative. See [Credits](../legal/credits.md) and [third-party notices](../legal/THIRD_PARTY_NOTICES.txt). Ankvale's original work uses the [Ankvale Attribution License](../legal/licensing.md)."
)
await writeFile(
  path.join(root, "docs/handbook/dependencies.md"),
  publicTable.join("\n") + "\n"
)
