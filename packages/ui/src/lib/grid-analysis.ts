/** Data operations are separate from rendering and never evaluate JavaScript source. */
export function aggregateRows<T>(
  rows: T[],
  key: (row: T) => string,
  value: (row: T) => number
) {
  const groups = new Map<
    string,
    {
      key: string
      count: number
      sum: number
      min: number
      max: number
      average: number
    }
  >()
  for (const row of rows) {
    const name = key(row),
      number = value(row)
    if (!Number.isFinite(number)) continue
    const group = groups.get(name) ?? {
      key: name,
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
      average: 0,
    }
    group.count++
    group.sum += number
    group.min = Math.min(group.min, number)
    group.max = Math.max(group.max, number)
    group.average = group.sum / group.count
    groups.set(name, group)
  }
  return [...groups.values()]
}
export function pivotRows<T>(
  rows: T[],
  rowKey: (row: T) => string,
  columnKey: (row: T) => string,
  value: (row: T) => number
) {
  const columns = [...new Set(rows.map(columnKey))]
  const result = new Map<string, Record<string, number>>()
  for (const row of rows) {
    const key = rowKey(row)
    const cells =
      result.get(key) ??
      Object.fromEntries(columns.map((column) => [column, 0]))
    const number = value(row)
    if (Number.isFinite(number))
      cells[columnKey(row)] = (cells[columnKey(row)] ?? 0) + number
    result.set(key, cells)
  }
  return {
    columns,
    rows: [...result].map(([key, values]) => ({ key, values })),
  }
}
type FormulaNode =
  | { kind: "number"; value: number }
  | { kind: "field"; name: string }
  | { kind: "negate"; value: FormulaNode }
  | { kind: "binary"; op: string; left: FormulaNode; right: FormulaNode }
function parseFormula(expression: string): {
  node: FormulaNode
  dependencies: string[]
} {
  if (expression.length > 10000)
    throw new Error("Formula exceeds the 10,000 character limit.")
  const tokens =
    expression.match(/[A-Za-z_]\w*|(?:\d+(?:\.\d*)?|\.\d+)|[()+*/-]/g) ?? []
  if (tokens.join("") !== expression.replace(/\s/g, ""))
    throw new Error("Unsupported formula syntax.")
  let position = 0
  let depth = 0
  const dependencies = new Set<string>()
  function primary(): FormulaNode {
    if (++depth > 128) throw new Error("Formula exceeds the nesting limit.")
    try {
      const token = tokens[position++]
      if (token === "-") return { kind: "negate", value: primary() }
      if (token === "(") {
        const result = expressionNode(0)
        if (tokens[position++] !== ")")
          throw new Error("Unmatched parenthesis.")
        return result
      }
      if (token && /^[\d.]/.test(token)) {
        const value = Number(token)
        if (!Number.isFinite(value))
          throw new Error("Non-finite numeric literal.")
        return { kind: "number", value }
      }
      if (token && /^[A-Za-z_]/.test(token)) {
        dependencies.add(token)
        return { kind: "field", name: token }
      }
      throw new Error("Incomplete formula.")
    } finally {
      depth--
    }
  }
  function expressionNode(minimum: number): FormulaNode {
    let left = primary()
    while (true) {
      const op = tokens[position]
      const precedence =
        op === "+" || op === "-" ? 1 : op === "*" || op === "/" ? 2 : 0
      if (!precedence || precedence < minimum) break
      position++
      left = {
        kind: "binary",
        op: op!,
        left,
        right: expressionNode(precedence + 1),
      }
    }
    return left
  }
  const node = expressionNode(0)
  if (position !== tokens.length) throw new Error("Invalid formula.")
  return { node, dependencies: [...dependencies] }
}
function evaluateFormula(
  node: FormulaNode,
  record: Record<string, number>
): number {
  if (node.kind === "number") return node.value
  if (node.kind === "field") {
    if (
      !Object.hasOwn(record, node.name) ||
      !Number.isFinite(record[node.name])
    )
      throw new Error(`Unknown numeric field: ${node.name}`)
    return record[node.name]!
  }
  if (node.kind === "negate") return -evaluateFormula(node.value, record)
  const left = evaluateFormula(node.left, record),
    right = evaluateFormula(node.right, record)
  if (node.op === "/" && right === 0) throw new Error("Division by zero.")
  const value =
    node.op === "+"
      ? left + right
      : node.op === "-"
        ? left - right
        : node.op === "*"
          ? left * right
          : left / right
  if (!Number.isFinite(value)) throw new Error("Non-finite formula result.")
  return value
}
export function calculateFormula(
  expression: string,
  record: Record<string, number>
) {
  return evaluateFormula(parseFormula(expression).node, record)
}
export type ComputedColumn = { id: string; expression: string }
/** Compile once; dependencies are resolved deterministically in declaration order. */
export function compileComputedColumns(
  columns: ComputedColumn[],
  inputFields: string[]
) {
  if (columns.length > 1000)
    throw new Error("Computed graph exceeds 1,000 columns.")
  const inputs = new Set(inputFields)
  const definitions = new Map<string, ReturnType<typeof parseFormula>>()
  for (const column of columns) {
    if (
      !/^[A-Za-z_]\w*$/.test(column.id) ||
      inputs.has(column.id) ||
      definitions.has(column.id)
    )
      throw new Error(`Duplicate or invalid computed field: ${column.id}`)
    definitions.set(column.id, parseFormula(column.expression))
  }
  const visiting = new Set<string>(),
    visited = new Set<string>(),
    order: string[] = []
  function visit(id: string) {
    if (visited.has(id)) return
    if (visiting.has(id))
      throw new Error(`Computed column cycle: ${[...visiting, id].join(" → ")}`)
    visiting.add(id)
    for (const dependency of definitions.get(id)!.dependencies) {
      if (definitions.has(dependency)) visit(dependency)
      else if (!inputs.has(dependency))
        throw new Error(`Unknown computed reference: ${dependency}`)
    }
    visiting.delete(id)
    visited.add(id)
    order.push(id)
  }
  for (const id of definitions.keys()) visit(id)
  return {
    order: Object.freeze([...order]),
    evaluate(record: Record<string, number>): Record<string, number> {
      const result = Object.assign(
        Object.create(null) as Record<string, number>,
        record
      )
      for (const id of order)
        result[id] = evaluateFormula(definitions.get(id)!.node, result)
      return result
    },
  }
}
/** Quoted TSV round-trips embedded tabs, newlines and quotation marks. */
export function serializeDelimitedRows(rows: unknown[][], delimiter = "\t") {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "")
          return text.includes(delimiter) || /["\r\n]/.test(text)
            ? '"' + text.replaceAll('"', '""') + '"'
            : text
        })
        .join(delimiter)
    )
    .join("\r\n")
}
export function parseDelimitedRows(text: string, delimiter = ",") {
  const rows: string[][] = []
  let row: string[] = [],
    cell = "",
    quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"'
        i++
      } else quoted = !quoted
    } else if (!quoted && c === delimiter) {
      row.push(cell)
      cell = ""
    } else if (!quoted && (c === "\n" || c === "\r")) {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else cell += c
  }
  if (quoted) throw new Error("Unclosed quoted field.")
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}
