"use client"
import { useState, useId } from "react"
import {
  aggregateRows,
  pivotRows,
  calculateFormula,
  compileComputedColumns,
  type ComputedColumn,
} from "@ankvale/ui/lib/grid-analysis"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
export function DataAnalysis({
  data,
  label,
  groupKey,
  columnKey,
  valueKey,
  computedColumns = [],
  numericFields,
}: {
  data: Record<string, string | number>[]
  label: string
  groupKey: string
  columnKey: string
  valueKey: string
  computedColumns?: ComputedColumn[]
  numericFields?: string[]
}) {
  const helpId = useId()
  const [mode, setMode] = useState("groups")
  const [formula, setFormula] = useState(valueKey)
  let analysisData = data
  let computedError: string | undefined
  try {
    const graph = compileComputedColumns(
      computedColumns,
      numericFields ?? [
        ...new Set(
          data.flatMap((row) =>
            Object.entries(row)
              .filter(([, value]) => typeof value === "number")
              .map(([key]) => key)
          )
        ),
      ]
    )
    analysisData = data.map((row) => ({
      ...row,
      ...graph.evaluate(
        Object.fromEntries(
          Object.entries(row).filter(
            (entry): entry is [string, number] => typeof entry[1] === "number"
          )
        )
      ),
    }))
  } catch (error) {
    computedError =
      error instanceof Error ? error.message : "Invalid computed columns."
  }
  const grouped = aggregateRows(
    analysisData,
    (row) => String(row[groupKey]),
    (row) => Number(row[valueKey])
  )
  const pivot = pivotRows(
    analysisData,
    (row) => String(row[groupKey]),
    (row) => String(row[columnKey]),
    (row) => Number(row[valueKey])
  )
  return (
    <section data-slot="data-analysis" aria-label={label} className="space-y-3">
      {computedError && (
        <p role="alert" className="text-sm text-destructive">
          {computedError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {["groups", "pivot", "formula"].map((value) => (
          <Button
            key={value}
            variant={mode === value ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      {mode === "formula" && (
        <label className="grid gap-1 text-sm">
          Formula
          <Input
            value={formula}
            onChange={(event) => setFormula(event.target.value)}
            aria-describedby={helpId}
          />
          <span id={helpId} className="text-xs text-muted-foreground">
            Numeric field names, + − * / and parentheses.
          </span>
        </label>
      )}
      <div className="overflow-auto rounded border">
        <table className="w-full text-start text-sm">
          <caption className="sr-only">{label}</caption>
          {mode === "groups" ? (
            <>
              <thead>
                <tr>
                  {[groupKey, "Count", "Sum", "Average", "Min", "Max"].map(
                    (header) => (
                      <th key={header} className="p-3 text-start">
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {grouped.map((row) => (
                  <tr key={row.key} className="border-t">
                    {[
                      row.key,
                      row.count,
                      row.sum,
                      row.average,
                      row.min,
                      row.max,
                    ].map((value, i) => (
                      <td key={i} className="p-3 tabular-nums">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          ) : mode === "pivot" ? (
            <>
              <thead>
                <tr>
                  <th className="p-3 text-start">{groupKey}</th>
                  {pivot.columns.map((column) => (
                    <th key={column} className="p-3 text-start">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pivot.rows.map((row) => (
                  <tr key={row.key} className="border-t">
                    <th className="p-3 text-start">{row.key}</th>
                    {pivot.columns.map((column) => (
                      <td key={column} className="p-3 tabular-nums">
                        {row.values[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr>
                  <th className="p-3 text-start">Row</th>
                  <th className="p-3 text-start">Result</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map((row, i) => {
                  let result: string | number
                  try {
                    result = calculateFormula(
                      formula,
                      Object.fromEntries(
                        Object.entries(row).filter(
                          (entry): entry is [string, number] =>
                            typeof entry[1] === "number"
                        )
                      )
                    )
                  } catch (error) {
                    result =
                      error instanceof Error ? error.message : "Invalid formula"
                  }
                  return (
                    <tr key={i} className="border-t">
                      <th className="p-3 text-start">{i + 1}</th>
                      <td className="p-3">{result}</td>
                    </tr>
                  )
                })}
              </tbody>
            </>
          )}
        </table>
      </div>
    </section>
  )
}
