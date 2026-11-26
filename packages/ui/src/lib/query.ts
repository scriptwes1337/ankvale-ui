export type QueryScalar = string | number | boolean
export type QueryRule = {
  type: "rule"
  id: string
  field: string
  caseSensitive?: boolean
} & (
  | { operator: "eq" | "neq"; value: QueryScalar }
  | { operator: "contains" | "startsWith" | "endsWith"; value: string }
  | { operator: "gt" | "gte" | "lt" | "lte"; value: string | number }
  | { operator: "in" | "notIn"; value: (string | number)[] }
  | { operator: "between"; value: [number, number] | [string, string] }
  | { operator: "isEmpty" | "isNotEmpty"; value?: never }
)
export type QueryGroup = {
  type: "group"
  id: string
  conjunction: "and" | "or"
  children: QueryNode[]
}
export type QueryNode = QueryGroup | QueryRule
export type QueryField<T = Record<string, unknown>> = {
  id: string
  label: string
  type: "text" | "number" | "date" | "boolean" | "enum"
  options?: { value: string | number; label: string }[]
  getValue?: (row: T) => unknown
}
export type QueryLimits = { maxDepth?: number; maxNodes?: number }
export type QueryIssue = {
  path: string
  code: "structure" | "limit" | "schema" | "value"
  message: string
}
export const queryOperators: Record<
  QueryField["type"],
  readonly QueryRule["operator"][]
> = {
  text: [
    "eq",
    "neq",
    "contains",
    "startsWith",
    "endsWith",
    "in",
    "notIn",
    "isEmpty",
    "isNotEmpty",
  ],
  number: [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "in",
    "notIn",
    "isEmpty",
    "isNotEmpty",
  ],
  date: [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "isEmpty",
    "isNotEmpty",
  ],
  boolean: ["eq", "neq", "isEmpty", "isNotEmpty"],
  enum: ["eq", "neq", "in", "notIn", "isEmpty", "isNotEmpty"],
}
function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + "T00:00:00Z")) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  )
}
export function resolveQueryLimits(limits: QueryLimits = {}) {
  const bound = (value: number | undefined, fallback: number, cap: number) =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(cap, Math.max(1, Math.floor(value)))
      : fallback
  return {
    maxDepth: bound(limits.maxDepth, 6, 20),
    maxNodes: bound(limits.maxNodes, 200, 10000),
  }
}
export function validateQuery<T>(
  query: QueryGroup,
  fields: QueryField<T>[],
  limits: QueryLimits = {}
): QueryIssue[] {
  const issues: QueryIssue[] = []
  const schema = new Map(fields.map((field) => [field.id, field]))
  if (
    schema.size !== fields.length ||
    fields.some(
      (field) => !field.id || !Object.hasOwn(queryOperators, field.type)
    )
  )
    issues.push({
      path: "schema",
      code: "schema",
      message: "Fields require unique IDs and supported types.",
    })
  for (const field of fields) {
    if (
      field.type === "enum" &&
      (!Array.isArray(field.options) ||
        !field.options.length ||
        field.options.some(
          (option) =>
            typeof option.value !== "string" &&
            !(typeof option.value === "number" && Number.isFinite(option.value))
        ) ||
        new Set(field.options.map((option) => String(option.value))).size !==
          field.options.length)
    )
      issues.push({
        path: "schema",
        code: "schema",
        message: `${field.label} requires distinct finite enum options.`,
      })
  }
  const ids = new Set<string>()
  const { maxDepth, maxNodes } = resolveQueryLimits(limits)
  let count = 0
  function issue(path: string, code: QueryIssue["code"], message: string) {
    issues.push({ path, code, message })
  }
  function walk(node: QueryNode, path: string, depth: number) {
    if (++count > maxNodes) {
      if (count === maxNodes + 1)
        issue(path, "limit", `Query exceeds ${maxNodes} nodes.`)
      return
    }
    if (depth > maxDepth) {
      issue(path, "limit", `Query exceeds ${maxDepth} group levels.`)
      return
    }
    if (
      !node ||
      typeof node !== "object" ||
      typeof node.id !== "string" ||
      !node.id ||
      ids.has(node.id)
    ) {
      issue(path, "structure", "Nodes require unique nonempty IDs.")
      return
    }
    ids.add(node.id)
    if (node.type === "group") {
      if (
        !Array.isArray(node.children) ||
        !["and", "or"].includes(node.conjunction)
      ) {
        issue(path, "structure", "Invalid query group.")
        return
      }
      if (depth > 1 && !node.children.length)
        issue(path, "value", "Add a condition or remove this empty group.")
      for (
        let index = 0;
        index < node.children.length && count <= maxNodes;
        index++
      )
        walk(
          node.children[index]!,
          `${path}.children[${index}]`,
          depth + (node.children[index]?.type === "group" ? 1 : 0)
        )
      return
    }
    if (node.type !== "rule") {
      issue(path, "structure", "Unknown query node type.")
      return
    }
    const field = schema.get(node.field)
    if (!field || !Object.hasOwn(queryOperators, field.type)) {
      issue(path, "schema", `Unknown query field: ${node.field}`)
      return
    }
    if (!queryOperators[field.type].includes(node.operator)) {
      issue(path, "schema", `Unsupported operator for ${field.label}.`)
      return
    }
    if (node.operator === "isEmpty" || node.operator === "isNotEmpty") return
    const value = node.value
    function scalar(item: unknown) {
      return field!.type === "number"
        ? typeof item === "number" && Number.isFinite(item)
        : field!.type === "boolean"
          ? typeof item === "boolean"
          : field!.type === "date"
            ? validDate(item)
            : field!.type === "enum"
              ? (field!.options ?? []).some((option) =>
                  Object.is(option.value, item)
                )
              : typeof item === "string"
    }
    if (node.operator === "in" || node.operator === "notIn") {
      if (
        !Array.isArray(value) ||
        !value.length ||
        value.length > 1000 ||
        !value.every(scalar)
      )
        issue(path, "value", `Choose valid values for ${field.label}.`)
    } else if (node.operator === "between") {
      if (
        !Array.isArray(value) ||
        value.length !== 2 ||
        !value.every(scalar) ||
        value[0]! > value[1]!
      )
        issue(path, "value", `Provide an ordered range for ${field.label}.`)
    } else if (!scalar(value))
      issue(
        path,
        "value",
        `Provide a valid ${field.type} value for ${field.label}.`
      )
    if (
      node.caseSensitive !== undefined &&
      typeof node.caseSensitive !== "boolean"
    )
      issue(path, "value", "Case sensitivity must be boolean.")
  }
  if (query?.type !== "group")
    issue("query", "structure", "The query root must be a group.")
  else walk(query, "query", 1)
  return issues
}
export class QueryValidationError extends Error {
  constructor(public readonly issues: QueryIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join(" "))
    this.name = "QueryValidationError"
  }
}
/** Typed field/value predicates; never interpolates SQL or executes expression source. */
export function compileQuery<T extends object>(
  query: QueryGroup,
  fields: QueryField<T>[],
  limits?: QueryLimits
): (row: T) => boolean {
  const issues = validateQuery(query, fields, limits)
  if (issues.length) throw new QueryValidationError(issues)
  const schema = new Map(fields.map((field) => [field.id, field]))
  function compile(node: QueryNode): (row: T) => boolean {
    if (node.type === "group") {
      const children = node.children.map(compile)
      if (!children.length) return () => true
      return node.conjunction === "and"
        ? (row) => children.every((test) => test(row))
        : (row) => children.some((test) => test(row))
    }
    const field = schema.get(node.field)!,
      type = field.type,
      fieldId = field.id,
      operator = node.operator
    const getValue =
      field.getValue ??
      ((row: T) =>
        Object.hasOwn(row, fieldId) ? row[fieldId as keyof T] : undefined)
    const sensitive = node.caseSensitive !== false
    const normalize = (value: unknown): unknown =>
      type === "text" && !sensitive && typeof value === "string"
        ? value.toLowerCase()
        : value
    const expected = Array.isArray(node.value)
      ? node.value.map(normalize)
      : normalize(node.value)
    const acceptedEnums = new Set(field.options?.map((option) => option.value))
    return (row) => {
      const raw = getValue(row),
        empty = raw === undefined || raw === null || raw === ""
      if (operator === "isEmpty") return empty
      if (operator === "isNotEmpty") return !empty
      if (empty) return false
      const valid =
        type === "number"
          ? typeof raw === "number" && Number.isFinite(raw)
          : type === "boolean"
            ? typeof raw === "boolean"
            : type === "date"
              ? validDate(raw)
              : type === "enum"
                ? acceptedEnums.has(raw as string | number)
                : typeof raw === "string"
      if (!valid) return false
      const actual = normalize(raw) as QueryScalar
      if (operator === "eq") return actual === expected
      if (operator === "neq") return actual !== expected
      if (operator === "in" || operator === "notIn")
        return (expected as unknown[]).includes(actual) === (operator === "in")
      if (operator === "contains")
        return String(actual).includes(String(expected))
      if (operator === "startsWith")
        return String(actual).startsWith(String(expected))
      if (operator === "endsWith")
        return String(actual).endsWith(String(expected))
      if (operator === "between") {
        const [low, high] = expected as [number, number] | [string, string]
        return actual >= low && actual <= high
      }
      if (operator === "gt") return actual > (expected as string | number)
      if (operator === "gte") return actual >= (expected as string | number)
      if (operator === "lt") return actual < (expected as string | number)
      return actual <= (expected as string | number)
    }
  }
  return compile(query)
}
