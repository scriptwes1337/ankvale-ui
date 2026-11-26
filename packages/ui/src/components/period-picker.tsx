"use client"
import { useId } from "react"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type PeriodPickerProps = {
  label: string
  kind: "month" | "week" | "quarter" | "year"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  min?: string
  max?: string
  disabled?: boolean
  name?: string
  error?: string
}
/** ISO month/week, YYYY-Qn quarter, or YYYY year. Empty string clears the field. */
export function PeriodPicker({
  label,
  kind,
  value,
  defaultValue = "",
  onValueChange,
  error,
  ...props
}: PeriodPickerProps) {
  const id = useId()
  const [current, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <div data-slot="period-picker" className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        {...props}
        id={id}
        type={kind === "quarter" ? "text" : kind === "year" ? "number" : kind}
        value={current}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={kind === "quarter" ? "2026-Q1" : undefined}
        pattern={kind === "quarter" ? "[0-9]{4}-Q[1-4]" : undefined}
        min={props.min ?? (kind === "year" ? "1" : undefined)}
        max={props.max ?? (kind === "year" ? "9999" : undefined)}
        onChange={(e) => set(e.target.value)}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function PeriodRangePicker({
  label,
  kind,
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  disabled,
  min,
  max,
}: {
  label: string
  kind: PeriodPickerProps["kind"]
  value?: { start: string; end: string }
  defaultValue?: { start: string; end: string }
  onValueChange?: (value: { start: string; end: string }) => void
  disabled?: boolean
  min?: string
  max?: string
}) {
  const [range, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const ordered = (a: string, b: string) =>
    kind === "year" ? Number(a) > Number(b) : a > b
  return (
    <fieldset data-slot="period-range-picker" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <PeriodPicker
          label="Start period"
          kind={kind}
          value={range.start}
          disabled={disabled}
          min={min}
          max={max}
          onValueChange={(start) => set({ ...range, start })}
        />
        <PeriodPicker
          label="End period"
          kind={kind}
          value={range.end}
          disabled={disabled}
          min={range.start || min}
          max={max}
          onValueChange={(end) => set({ ...range, end })}
          error={
            range.start && range.end && ordered(range.start, range.end)
              ? "End period must follow start period."
              : undefined
          }
        />
      </div>
    </fieldset>
  )
}
