"use client"
import { useId } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Textarea } from "@ankvale/ui/components/textarea"
import {
  queryOperators,
  resolveQueryLimits,
  validateQuery,
  type QueryField,
  type QueryGroup,
  type QueryNode,
  type QueryRule,
  type QueryLimits,
  type QueryScalar,
} from "@ankvale/ui/lib/query"
export type {
  QueryField,
  QueryGroup,
  QueryNode,
  QueryRule,
  QueryLimits,
} from "@ankvale/ui/lib/query"
export type QueryBuilderProps<T> = {
  value: QueryGroup
  onChange: (query: QueryGroup) => void
  fields: QueryField<T>[]
  label?: string
  limits?: QueryLimits
  disabled?: boolean
}
const labels: Record<QueryRule["operator"], string> = {
  eq: "equals",
  neq: "does not equal",
  contains: "contains",
  startsWith: "starts with",
  endsWith: "ends with",
  gt: "greater than",
  gte: "at least",
  lt: "less than",
  lte: "at most",
  between: "between",
  in: "is one of",
  notIn: "is not one of",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
}
function replaceNode(
  root: QueryGroup,
  id: string,
  replacement: QueryNode | null
): QueryGroup {
  if (root.id === id && replacement?.type === "group") return replacement
  return {
    ...root,
    children: root.children.flatMap((node) =>
      node.id === id
        ? replacement
          ? [replacement]
          : []
        : node.type === "group"
          ? [replaceNode(node, id, replacement)]
          : [node]
    ),
  }
}
function defaultRule<T>(
  field: QueryField<T>,
  id: string,
  operator: QueryRule["operator"] = "eq"
): QueryRule {
  const value =
    field.type === "number"
      ? 0
      : field.type === "boolean"
        ? true
        : field.type === "enum"
          ? (field.options?.[0]?.value ?? "")
          : ""
  if (operator === "isEmpty" || operator === "isNotEmpty")
    return { type: "rule", id, field: field.id, operator }
  return {
    type: "rule",
    id,
    field: field.id,
    operator,
    value:
      operator === "between"
        ? [value, value]
        : operator === "in" || operator === "notIn"
          ? [value]
          : value,
  } as QueryRule
}
/** Controlled recursive query editor. Persist values as structured data, never executable source. */
export function QueryBuilder<T extends object>({
  value,
  onChange,
  fields,
  label = "Filter records",
  limits,
  disabled = false,
}: QueryBuilderProps<T>) {
  const helpId = useId()
  const issues = validateQuery(value, fields, limits)
  const unsafe = issues.some(
    (issue) =>
      issue.code === "structure" ||
      issue.code === "limit" ||
      issue.path === "schema"
  )
  const { maxDepth, maxNodes } = resolveQueryLimits(limits)
  function count(node: QueryNode): number {
    return (
      1 +
      (node.type === "group"
        ? node.children.reduce((sum, child) => sum + count(child), 0)
        : 0)
    )
  }
  const canAdd = !unsafe && count(value) < maxNodes
  function update(node: QueryNode) {
    onChange(replaceNode(value, node.id, node))
  }
  function scalarInput(
    field: QueryField<T>,
    current: unknown,
    change: (value: QueryScalar) => void,
    suffix = ""
  ) {
    const ariaLabel = `${field.label} value${suffix}`
    if (field.type === "enum")
      return (
        <select
          aria-label={ariaLabel}
          value={String(current ?? "")}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          onChange={(event) => {
            const option = field.options?.find(
              (option) => String(option.value) === event.target.value
            )
            if (option) change(option.value)
          }}
        >
          {(field.options ?? []).map((option) => (
            <option
              key={`${typeof option.value}:${option.value}`}
              value={String(option.value)}
            >
              {option.label}
            </option>
          ))}
        </select>
      )
    if (field.type === "boolean")
      return (
        <select
          aria-label={ariaLabel}
          value={String(current)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          onChange={(event) => change(event.target.value === "true")}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )
    return (
      <Input
        aria-label={ariaLabel}
        type={
          field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : "text"
        }
        step={field.type === "number" ? "any" : undefined}
        value={
          typeof current === "number" && !Number.isFinite(current)
            ? ""
            : String(current ?? "")
        }
        onChange={(event) =>
          change(
            field.type === "number"
              ? event.target.value === ""
                ? NaN
                : Number(event.target.value)
              : event.target.value
          )
        }
        className="min-w-28 flex-1"
      />
    )
  }
  function ruleEditor(rule: QueryRule) {
    const field = fields.find((field) => field.id === rule.field)
    const values = Array.isArray(rule.value) ? rule.value : []
    return (
      <div
        key={rule.id}
        className="space-y-2 rounded-md border bg-background p-3"
        data-slot="query-rule"
      >
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Condition field"
            value={rule.field}
            className="h-9 rounded-md border bg-background px-2 text-sm"
            onChange={(event) => {
              const next = fields.find((item) => item.id === event.target.value)
              if (next) update(defaultRule(next, rule.id))
            }}
          >
            {!field && <option value={rule.field}>Unknown field</option>}
            {fields.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {field && (
            <>
              <select
                aria-label={`${field.label} operator`}
                value={rule.operator}
                className="h-9 rounded-md border bg-background px-2 text-sm"
                onChange={(event) =>
                  update(
                    defaultRule(
                      field,
                      rule.id,
                      event.target.value as QueryRule["operator"]
                    )
                  )
                }
              >
                {queryOperators[field.type].map((operator) => (
                  <option key={operator} value={operator}>
                    {labels[operator]}
                  </option>
                ))}
              </select>
              {rule.operator === "between" ? (
                <>
                  {scalarInput(
                    field,
                    values[0],
                    (next) =>
                      update({
                        ...rule,
                        value: [next, values[1]],
                      } as QueryRule),
                    " start"
                  )}
                  <span className="text-xs text-muted-foreground">and</span>
                  {scalarInput(
                    field,
                    values[1],
                    (next) =>
                      update({
                        ...rule,
                        value: [values[0], next],
                      } as QueryRule),
                    " end"
                  )}
                </>
              ) : rule.operator === "in" || rule.operator === "notIn" ? (
                field.type === "enum" ? (
                  <select
                    multiple
                    aria-label={`${field.label} values`}
                    className="min-w-32 rounded border bg-background p-2 text-sm"
                    value={values.map((item) => String(item))}
                    onChange={(event) =>
                      update({
                        ...rule,
                        value: Array.from(event.target.selectedOptions).map(
                          (option) =>
                            field.options!.find(
                              (item) => String(item.value) === option.value
                            )!.value
                        ),
                      })
                    }
                  >
                    {field.options?.map((option) => (
                      <option
                        key={`${typeof option.value}:${option.value}`}
                        value={String(option.value)}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <label className="grid min-w-40 flex-1 gap-1 text-xs">
                    {field.label} values (one per line)
                    <Textarea
                      aria-label={`${field.label} values`}
                      value={values.join("\n")}
                      onChange={(event) =>
                        update({
                          ...rule,
                          value: event.target.value
                            .split("\n")
                            .filter((item) => item !== "")
                            .map((item) =>
                              field.type === "number" ? Number(item) : item
                            ),
                        })
                      }
                    />
                  </label>
                )
              ) : rule.operator === "isEmpty" ||
                rule.operator === "isNotEmpty" ? null : (
                scalarInput(field, rule.value, (next) =>
                  update({ ...rule, value: next } as QueryRule)
                )
              )}
            </>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Remove ${field?.label ?? "unknown"} condition`}
            onClick={() => onChange(replaceNode(value, rule.id, null))}
          >
            Remove
          </Button>
        </div>
        {field?.type === "text" &&
          rule.operator !== "isEmpty" &&
          rule.operator !== "isNotEmpty" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="accent-primary"
                checked={rule.caseSensitive !== false}
                onChange={(event) =>
                  update({ ...rule, caseSensitive: event.target.checked })
                }
              />
              Case sensitive
            </label>
          )}
      </div>
    )
  }
  function groupEditor(group: QueryGroup, depth: number) {
    return (
      <fieldset
        key={group.id}
        className="min-w-0 space-y-3 rounded-lg border p-3"
        data-slot="query-group"
      >
        <legend className="px-1 text-xs font-medium">
          {depth === 1 ? label : "Condition group"}
        </legend>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Match</span>
          <select
            aria-label={depth === 1 ? "Root conjunction" : "Group conjunction"}
            value={group.conjunction}
            className="h-9 rounded-md border bg-background px-2"
            onChange={(event) =>
              update({
                ...group,
                conjunction: event.target.value as "and" | "or",
              })
            }
          >
            <option value="and">all conditions</option>
            <option value="or">any condition</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAdd || !fields.length}
            onClick={() =>
              update({
                ...group,
                children: [
                  ...group.children,
                  defaultRule(fields[0]!, crypto.randomUUID()),
                ],
              })
            }
          >
            Add condition
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAdd || depth >= maxDepth}
            onClick={() =>
              update({
                ...group,
                children: [
                  ...group.children,
                  {
                    type: "group",
                    id: crypto.randomUUID(),
                    conjunction: "and",
                    children: [],
                  },
                ],
              })
            }
          >
            Add group
          </Button>
          {depth > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Remove condition group"
              onClick={() => onChange(replaceNode(value, group.id, null))}
            >
              Remove group
            </Button>
          )}
        </div>
        {group.children.map((node) =>
          node.type === "group"
            ? groupEditor(node, depth + 1)
            : ruleEditor(node)
        )}
        {!group.children.length && (
          <p className="text-xs text-muted-foreground">
            {depth === 1
              ? "No filters. All records match."
              : "Add a condition to this group."}
          </p>
        )}
      </fieldset>
    )
  }
  return (
    <section
      data-slot="query-builder"
      aria-label={label}
      aria-describedby={helpId}
      className="space-y-3"
    >
      <p id={helpId} className="text-xs text-muted-foreground">
        Combine typed conditions with all/any groups. Dates use calendar days;
        missing values match only empty-value operators.
      </p>
      <fieldset disabled={disabled} className="min-w-0 border-0 p-0">
        {unsafe ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onChange({
                type: "group",
                id: crypto.randomUUID(),
                conjunction: "and",
                children: [],
              })
            }
          >
            Reset invalid query
          </Button>
        ) : (
          groupEditor(value, 1)
        )}
      </fieldset>
      {!!issues.length && (
        <ul role="alert" className="space-y-1 text-xs text-destructive">
          {issues.map((issue, index) => (
            <li key={`${issue.path}:${index}`}>{issue.message}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
