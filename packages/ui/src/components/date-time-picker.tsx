"use client"
import { useId, type ComponentProps } from "react"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type DateTimePickerProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  timeZone: string
  error?: string
}
/** Emits wall-clock YYYY-MM-DDTHH:mm strings. Resolve ambiguous/nonexistent DST times in the consuming domain before saving an instant. */
export function DateTimePicker({
  label,
  value,
  defaultValue = "",
  onValueChange,
  timeZone,
  error,
  id,
  ...props
}: DateTimePickerProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const [current, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <div data-slot="date-time-picker" className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        {...props}
        id={fieldId}
        type="datetime-local"
        value={current}
        onChange={(e) => set(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={`${fieldId}-zone${error ? ` ${fieldId}-error` : ""}`}
      />
      <p id={`${fieldId}-zone`} className="text-xs text-muted-foreground">
        Time zone: {timeZone}
      </p>
      {error && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}
export function DateTimeRangePicker({
  label,
  timeZone,
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  disabled,
}: {
  label: string
  timeZone: string
  value?: { start: string; end: string }
  defaultValue?: { start: string; end: string }
  onValueChange?: (value: { start: string; end: string }) => void
  disabled?: boolean
}) {
  const [range, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <fieldset data-slot="date-time-range-picker" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <DateTimePicker
          label="Start"
          timeZone={timeZone}
          value={range.start}
          disabled={disabled}
          onValueChange={(start) => set({ ...range, start })}
        />
        <DateTimePicker
          label="End"
          timeZone={timeZone}
          value={range.end}
          min={range.start}
          disabled={disabled}
          onValueChange={(end) => set({ ...range, end })}
          error={
            range.start && range.end && range.end < range.start
              ? "End must follow start."
              : undefined
          }
        />
      </div>
    </fieldset>
  )
}
