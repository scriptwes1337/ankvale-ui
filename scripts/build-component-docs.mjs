import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import { build } from "esbuild"
import { componentExamples } from "./component-examples.mjs"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const examples = await componentExamples(root)
const blockExamples = await componentExamples(root, [
  "app-block-previews.tsx",
  "site-block-previews.tsx",
])
const catalog = await build({
  entryPoints: [path.join(root, "apps/web/lib/block-catalog.ts")],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
})
const { blockDefinitions: extendedDefinitions } = await import(
  `data:text/javascript;base64,${Buffer.from(catalog.outputFiles[0].text).toString("base64")}`
)
export async function buildApi(directory, output, platform) {
  await mkdir(output, { recursive: true })
  const index = []
  for (const filename of (await readdir(directory))
    .filter((file) => file.endsWith(".tsx"))
    .sort()) {
    const source = await readFile(path.join(directory, filename), "utf8"),
      ast = ts.createSourceFile(
        filename,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      ),
      exports = [],
      types = []
    const signature = (name, node) => ({
      name,
      parameters:
        node?.parameters?.map((parameter) => parameter.getText(ast)) ?? [],
      typeParameters:
        node?.typeParameters?.map((parameter) => parameter.getText(ast)) ?? [],
    })
    for (const node of ast.statements) {
      const exported = node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
      if (
        exported &&
        (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node))
      )
        types.push({ name: node.name.text, declaration: node.getText(ast) })
      if (ts.isFunctionDeclaration(node) && node.name && exported)
        exports.push(signature(node.name.text, node))
      if (ts.isVariableStatement(node) && exported)
        for (const declaration of node.declarationList.declarations) {
          if (
            ts.isIdentifier(declaration.name) &&
            /^[A-Z]/.test(declaration.name.text)
          )
            exports.push(
              signature(
                declaration.name.text,
                declaration.initializer &&
                  (ts.isArrowFunction(declaration.initializer) ||
                    ts.isFunctionExpression(declaration.initializer))
                  ? declaration.initializer
                  : undefined
              )
            )
        }
      if (
        ts.isExportDeclaration(node) &&
        node.exportClause &&
        ts.isNamedExports(node.exportClause)
      )
        for (const element of node.exportClause.elements) {
          if (node.isTypeOnly || element.isTypeOnly) continue
          const declaration = ast.statements.find(
            (item) =>
              ts.isFunctionDeclaration(item) &&
              item.name?.text === (element.propertyName ?? element.name).text
          )
          exports.push(signature(element.name.text, declaration))
        }
    }
    const ownModules = new Set()
    for (const node of ast.statements) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const module = node.moduleSpecifier.text
        if (module.startsWith(".") || module.startsWith("@ankvale/ui/"))
          ownModules.add(
            module.startsWith(".")
              ? path.resolve(directory, module)
              : path.join(
                  root,
                  "packages/ui/src",
                  module.slice("@ankvale/ui/".length)
                )
          )
      }
    }
    for (const ownModule of ownModules) {
      let content, reference
      for (const extension of [".ts", ".tsx"]) {
        try {
          content = await readFile(ownModule + extension, "utf8")
          reference = ownModule + extension
          break
        } catch {}
      }
      if (!content) continue
      const importedAst = ts.createSourceFile(
        reference,
        content,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      )
      for (const node of importedAst.statements)
        if (
          (ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node)) &&
          !types.some((item) => item.name === node.name.text)
        )
          types.push({
            name: node.name.text,
            declaration: node.getText(importedAst),
          })
    }
    const id = filename.replace(/\.tsx$/, ""),
      isNative = platform === "native",
      isTemplate = platform === "template",
      isBlock = platform === "block",
      variants = isBlock
        ? extendedDefinitions.filter(
            (item) => item.module === filename.replace(/\.tsx$/, "")
          )
        : []
    const doc = {
      id,
      title: id
        .split("-")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" "),
      platform,
      importPath: isNative
        ? `@ankvale/native-ui/components/${id}`
        : isTemplate
          ? `@/components/templates/${id}`
          : isBlock
            ? `@/components/blocks/${id}`
            : `@/components/ui/${id}`,
      sourcePath: path.relative(root, path.join(directory, filename)),
      exports,
      types,
      slots: [
        ...new Set(
          Array.from(
            source.matchAll(/data-slot="([a-z][a-z0-9-]*)"/g),
            (match) => match[1]
          )
        ),
      ],
      example: isBlock
        ? (blockExamples.get(variants[0]?.id) ?? null)
        : isNative || isTemplate
          ? null
          : (examples.get(id) ?? null),
      variants: isBlock
        ? variants.map((item) => ({
            ...item,
            registry: `/r/${item.id}.json`,
            example: blockExamples.get(item.id) ?? null,
          }))
        : undefined,
      registry:
        isNative || (isTemplate && id === "shared")
          ? null
          : isBlock
            ? variants[0]
              ? `/r/${variants[0].id}.json`
              : id === "heroes"
                ? "/r/hero-blocks.json"
                : null
            : `/r/${id}${isTemplate ? "-template" : ""}.json`,
      preview: isNative
        ? `/native#${id}`
        : isBlock
          ? id === "heroes"
            ? "/blocks/heroes"
            : variants[0]
              ? `/blocks#${variants[0].id}`
              : null
          : isTemplate
            ? id === "shared"
              ? null
              : `/examples/${id}`
            : `/playground#${id}`,
    }
    await writeFile(
      path.join(output, `${id}.json`),
      JSON.stringify(doc, null, 2) + "\n"
    )
    index.push(doc)
  }
  return index
}
const api = path.join(root, "apps/web/public/api")
for (const [platform, directory, folder] of [
  ["web", "packages/ui/src/components", "components"],
  ["native", "packages/native-ui/src/components", "native"],
  ["template", "packages/ui/src/templates", "templates"],
  ["block", "packages/ui/src/blocks", "block-modules"],
]) {
  const docs = await buildApi(
    path.join(root, directory),
    path.join(api, folder),
    platform
  )
  await writeFile(
    path.join(api, `${folder}.json`),
    JSON.stringify(docs, null, 2) + "\n"
  )
  console.log(`Built ${docs.length} ${platform} API documents.`)
}
