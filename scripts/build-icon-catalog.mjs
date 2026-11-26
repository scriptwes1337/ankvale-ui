import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as icons from "@phosphor-icons/react/ssr"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const packageRoot = path.dirname(
  fileURLToPath(import.meta.resolve("@phosphor-icons/react/package.json"))
)
const names = (await readdir(path.join(packageRoot, "dist/defs")))
  .filter((name) => name.endsWith(".es.js"))
  .map((name) => name.replace(/\.es\.js$/, ""))
  .sort()
const catalog = names.map((name) => ({
  name,
  title: name
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2"),
}))
const destination = path.join(root, "apps/web/public/icon-assets")
await mkdir(destination, { recursive: true })
for (const weight of ["thin", "light", "regular", "bold", "fill", "duotone"]) {
  const symbols = names
    .map((name) => {
      const Icon = icons[`${name}Icon`]
      if (!Icon) throw new Error(`Missing Phosphor export: ${name}Icon`)
      const markup = renderToStaticMarkup(createElement(Icon, { weight }))
      const content = markup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")
      return `<symbol id="${name}" viewBox="0 0 256 256" fill="currentColor">${content}</symbol>`
    })
    .join("")
  await writeFile(
    path.join(destination, `${weight}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg"><!-- Phosphor Icons, MIT; see LICENSE.txt -->${symbols}</svg>\n`
  )
}
await writeFile(
  path.join(destination, "LICENSE.txt"),
  await readFile(path.join(packageRoot, "LICENSE"))
)
await writeFile(
  path.join(root, "apps/web/lib/icon-catalog.json"),
  JSON.stringify(catalog) + "\n"
)
console.log(`Built ${catalog.length} Phosphor icon previews in six weights.`)
