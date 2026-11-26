import ts from "typescript"
import { readFile } from "node:fs/promises"
import path from "node:path"
export async function componentExamples(
  root,
  sourceFiles = [
    "animation-previews.tsx",
    "asset-previews.tsx",
    "query-previews.tsx",
    "enhancement-previews.tsx",
    "system-previews.tsx",
    "expansion-previews.tsx",
    "component-previews.tsx",
    "playground.tsx",
  ]
) {
  const result = new Map()
  for (const file of sourceFiles) {
    const source = await readFile(
        path.join(root, "apps/web/components", file),
        "utf8"
      ),
      ast = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      )
    const definitions = new Map(),
      imports = []
    let map
    for (const node of ast.statements) {
      if (ts.isImportDeclaration(node)) {
        imports.push(node)
        continue
      }
      if (
        (ts.isFunctionDeclaration(node) ||
          ts.isTypeAliasDeclaration(node) ||
          ts.isInterfaceDeclaration(node)) &&
        node.name
      )
        definitions.set(node.name.text, node)
      if (ts.isVariableStatement(node))
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            definitions.set(declaration.name.text, node)
            if (
              ["previews", "demos"].includes(declaration.name.text) &&
              declaration.initializer
            ) {
              let value = declaration.initializer
              while (
                ts.isAsExpression(value) ||
                ts.isSatisfiesExpression(value) ||
                ts.isParenthesizedExpression(value)
              )
                value = value.expression
              if (ts.isObjectLiteralExpression(value)) map = value
            }
          }
        }
    }
    if (!map) continue
    for (const property of map.properties) {
      if (!ts.isPropertyAssignment(property)) continue
      const id = property.name.getText(ast).replace(/^['"]|['"]$/g, "")
      const refs = new Set(),
        statements = new Set()
      function visit(node) {
        if (ts.isIdentifier(node)) {
          refs.add(node.text)
          const definition = definitions.get(node.text)
          if (definition && !statements.has(definition) && definition !== map) {
            statements.add(definition)
            ts.forEachChild(definition, visit)
          }
        }
        ts.forEachChild(node, visit)
      }
      visit(property.initializer)
      const selectedImports = imports.flatMap((node) => {
        const clause = node.importClause
        if (!clause) return [node.getText(ast)]
        const name =
          clause.name && refs.has(clause.name.text) ? clause.name : undefined
        let bindings = clause.namedBindings
        if (bindings && ts.isNamedImports(bindings)) {
          const elements = bindings.elements.filter((element) =>
            refs.has(element.name.text)
          )
          bindings = elements.length
            ? ts.factory.updateNamedImports(bindings, elements)
            : undefined
        } else if (bindings && !refs.has(bindings.name.text))
          bindings = undefined
        if (!name && !bindings) return []
        const selected = ts.factory.updateImportDeclaration(
          node,
          node.modifiers,
          ts.factory.updateImportClause(
            clause,
            clause.isTypeOnly,
            name,
            bindings
          ),
          node.moduleSpecifier,
          node.attributes
        )
        return [
          ts.createPrinter().printNode(ts.EmitHint.Unspecified, selected, ast),
        ]
      })
      const declarations = [...statements]
        .sort((a, b) => a.pos - b.pos)
        .map((node) => node.getText(ast).replace(/^export /, ""))
      const initializer = property.initializer.getText(ast)
      const example = ts.isIdentifier(property.initializer)
        ? `export default function Example(){return <${initializer} />}`
        : `const Example = ${initializer}\nexport default Example`
      const text = [
        '"use client"',
        ...selectedImports,
        ...declarations,
        example,
      ]
        .join("\n\n")
        .replaceAll("@ankvale/ui/blocks/", "@/components/blocks/")
        .replaceAll("@ankvale/ui/components/", "@/components/ui/")
        .replaceAll("@ankvale/ui/hooks/", "@/hooks/")
        .replaceAll("@ankvale/ui/lib/", "@/lib/")
      result.set(id, text)
    }
  }
  return result
}
