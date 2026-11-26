import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { GuideContent } from "../apps/web/components/guide-content"
import { readFile, readdir, access, mkdir, writeFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import path from "node:path"
import { unzipSync, strFromU8 } from "fflate"
import {
  documentation,
  documentationLinks,
  publicDocumentationFiles,
} from "../apps/web/lib/documentation"

export async function run() {
  const links = renderToString(
    createElement(GuideContent, {
      content:
        "[Overview](/docs/system/overview) and [MIT](https://opensource.org/license/mit)",
    })
  )
  assert(links.includes('href="/docs/system/overview"'))
  assert(links.includes('href="https://opensource.org/license/mit"'))
  assert(
    !links.includes("<button"),
    "Handbook links should navigate directly without confirmation dialogs"
  )
  const stale = "apps/web/public/documentation/internal/stale-review.md"
  await mkdir(path.dirname(stale), { recursive: true })
  await writeFile(stale, "Internal review fixture")
  execFileSync(process.execPath, ["scripts/build-documentation.mjs"], {
    stdio: "pipe",
  })
  await assert.rejects(access(stale))
  assert.throws(
    () =>
      documentationLinks(
        "[Internal](../internal/licensing-audit.md)",
        "handbook/overview.md"
      ),
    /Unpublished documentation reference/
  )
  const zip = unzipSync(
    await readFile("apps/web/public/downloads/ankvale-documentation.zip")
  )
  assert.equal(
    new Set(documentation.map((item) => item.id)).size,
    documentation.length
  )
  for (const document of documentation) {
    const content = await readFile(path.join("docs", document.file), "utf8")
    assert(content.startsWith("# "))
    assert(
      !/audit machine|Open findings before release|first available Git record|Declared by|npm run registry:build/i.test(
        content
      ),
      `${document.id} must be written for users`
    )
    assert.equal(strFromU8(zip[`docs/${document.file}`]!), content)
    const published = await readFile(
      path.join("apps/web/public/documentation", document.file),
      "utf8"
    )
    assert.equal(published, documentationLinks(content, document.file))
    const withoutCode = content.replace(/```[\s\S]*?```/g, "")
    for (const match of withoutCode.matchAll(/\]\(([^)]+)\)/g)) {
      const href = match[1]!
      if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) continue
      await access(
        path.resolve("docs", path.dirname(document.file), href.split("#")[0]!)
      )
    }
    for (const match of published.matchAll(/\]\(([^)]+)\)/g)) {
      const href = match[1]!.split("#")[0]!
      if (href.startsWith("/documentation/"))
        await access(path.join("apps/web/public", href))
      if (href.startsWith("/docs/system/"))
        assert(documentation.some((item) => `/docs/system/${item.id}` === href))
    }
  }
  const allowedArchiveFiles = new Set([
    "LICENSE",
    "README.md",
    ...publicDocumentationFiles.map((file) => `docs/${file}`),
  ])
  for (const file of Object.keys(zip))
    assert(allowedArchiveFiles.has(file), `Unpublished archive file: ${file}`)
  for (const file of [
    "legal/dependency-inventory.json",
    "legal/dependency-inventory.csv",
    "legal/dependencies.md",
    "legal/assets.md",
    "handbook/architecture.md",
    "handbook/documentation-roadmap.md",
    "implementation/cli-setup.md",
    "tooling/README.md",
  ]) {
    await assert.rejects(
      access(path.join("apps/web/public/documentation", file))
    )
    assert(!zip[`docs/${file}`])
  }
  const ownLicense = await readFile("LICENSE", "utf8")
  assert(ownLicense.includes("Built with Ankvale UI by Ankvale Labs"))
  assert(ownLicense.includes("Every application or website"))
  assert(
    ownLicense.includes("Third-party material is governed by its own licenses")
  )
  assert.equal(strFromU8(zip.LICENSE!), ownLicense)
  assert.equal(
    await readFile("docs/legal/Ankvale-LICENSE.txt", "utf8"),
    ownLicense
  )
  for (const base of [
    ".",
    "apps/web",
    "packages/ui",
    "packages/native-ui",
    "packages/design-system",
    "packages/eslint-config",
    "packages/typescript-config",
  ]) {
    const manifest = JSON.parse(
      await readFile(path.join(base, "package.json"), "utf8")
    )
    assert.equal(manifest.license, "SEE LICENSE IN LICENSE")
    assert.equal(await readFile(path.join(base, "LICENSE"), "utf8"), ownLicense)
  }
  for (const id of ["ankvale-code", "ankvale-design", "ankvale-agent-guide"]) {
    const archive = unzipSync(
      await readFile(`apps/web/public/downloads/${id}.zip`)
    )
    const file = Object.keys(archive).find((entry) =>
      entry.endsWith("/LICENSE")
    )!
    assert.equal(strFromU8(archive[file]!), ownLicense)
  }
  const report = JSON.parse(
    await readFile("docs/legal/dependency-inventory.json", "utf8")
  )
  const lock = await readFile("package-lock.json")
  assert.equal(
    report.lockfileSha256,
    createHash("sha256").update(lock).digest("hex")
  )
  const lockObject = JSON.parse(lock.toString())
  const instances = Object.entries(lockObject.packages).filter(
    ([location, item]: [string, any]) =>
      location.includes("node_modules/") && !item.link
  )
  assert.equal(report.packages.length, instances.length)
  assert.equal(report.summary.packageInstances, report.packages.length)
  assert.equal(report.summary.versionMismatches, 0)
  assert(
    report.packages.every((item: any) => item.firstInstallationDate === null)
  )
  assert(report.direct.every((item: any) => item.resolved?.version))
  const notices = await readFile("docs/legal/THIRD_PARTY_NOTICES.txt", "utf8")
  for (const item of report.packages) {
    assert.equal(item.version, lockObject.packages[item.location].version)
    if (item.firstRepositoryRecord)
      assert(/^[a-f0-9]{40}$/.test(item.firstRepositoryRecord.commit))
    for (const file of item.licenseFiles) {
      const bytes = await readFile(path.join(item.location, file.path))
      assert.equal(
        file.sha256,
        createHash("sha256").update(bytes).digest("hex")
      )
      assert(notices.includes(bytes.toString("utf8")))
    }
  }
  const shadcnLicense = await readFile(
    "docs/legal/upstream/shadcn-ui-LICENSE.md",
    "utf8"
  )
  assert.equal(
    shadcnLicense,
    await readFile("node_modules/shadcn/LICENSE.md", "utf8")
  )
  let registries = 0
  for (const file of await readdir("apps/web/public/r")) {
    if (!file.endsWith(".json")) continue
    const item = JSON.parse(
      await readFile(path.join("apps/web/public/r", file), "utf8")
    )
    if (!item.files) continue
    const notice = item.files.find(
      (entry: any) => entry.target === "LICENSES/ankvale-shadcn-ui-LICENSE.md"
    )
    assert(notice, `${file} must retain source license`)
    assert.equal(notice.content, shadcnLicense)
    const ownNotice = item.files.find(
      (entry: any) => entry.target === "LICENSES/ankvale-ui-LICENSE.txt"
    )
    assert.equal(
      ownNotice?.content,
      ownLicense,
      `${file} must retain Ankvale terms`
    )
    registries++
  }
  assert(registries > 176)
  console.log(
    `✓ ${documentation.length} complete handbook pages, local/published links and archive; ${report.packages.length} dependency versions and retained notice hashes; ${registries} source registries retain Ankvale and shadcn terms; internal pages excluded`
  )
}
