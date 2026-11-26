"use client"
import { useId, type ComponentProps } from "react"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type TimePickerProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  error?: string
}
/** Local wall time; browser provides locale-aware keyboard/spinner selection. Step is in seconds. */
export function TimePicker({
  label,
  value,
  defaultValue = "",
  onValueChange,
  error,
  id,
  className,
  ...props
}: TimePickerProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const [time, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <div data-slot="time-picker" className={cn("space-y-2", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        {...props}
        id={fieldId}
        type="time"
        value={time}
        onChange={(e) => set(e.target.value)}
        aria-invalid={!!error || props["aria-invalid"]}
        aria-describedby={
          error ? `${fieldId}-error` : props["aria-describedby"]
        }
      />
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
export function TimeRangePicker({
  label,
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  disabled = false,
  step = 60,
  allowOvernight = false,
}: {
  label: string
  value?: { start: string; end: string }
  defaultValue?: { start: string; end: string }
  onValueChange?: (value: { start: string; end: string }) => void
  disabled?: boolean
  step?: number
  allowOvernight?: boolean
}) {
  const [range, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <fieldset data-slot="time-range-picker" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <TimePicker
          label="Start time"
          value={range.start}
          step={step}
          disabled={disabled}
          onValueChange={(start) => set({ ...range, start })}
        />
        <TimePicker
          label="End time"
          value={range.end}
          step={step}
          disabled={disabled}
          min={allowOvernight ? undefined : range.start}
          onValueChange={(end) => set({ ...range, end })}
          error={
            !allowOvernight &&
            range.start &&
            range.end &&
            range.end < range.start
              ? "End time must follow start time."
              : undefined
          }
        />
      </div>
    </fieldset>
  )
}
