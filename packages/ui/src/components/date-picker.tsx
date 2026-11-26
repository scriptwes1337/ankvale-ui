"use client"
import { useId, type ComponentProps } from "react"
import { CalendarIcon } from "@phosphor-icons/react"
import { Calendar } from "@ankvale/ui/components/calendar"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ankvale/ui/components/popover"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
/** Date-only strings use YYYY-MM-DD, with no UTC conversion or timezone shift. */
export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [y, m, d] = value.split("-").map(Number)
  const date = new Date(0)
  date.setFullYear(y!, m! - 1, d!)
  date.setHours(12, 0, 0, 0)
  return date.getFullYear() === y &&
    date.getMonth() === m! - 1 &&
    date.getDate() === d
    ? date
    : undefined
}
export function formatDateOnly(date: Date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
export type DatePickerProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  error?: string
  locale?: ComponentProps<typeof Calendar>["locale"]
  presets?: { label: string; value: string }[]
}
export function DateField({
  label,
  value,
  defaultValue = "",
  onValueChange,
  error,
  className,
  id,
  ...props
}: Omit<DatePickerProps, "locale" | "presets">) {
  const generated = useId()
  const fieldId = id ?? generated
  const [current, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <div data-slot="date-field" className={cn("space-y-2", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        {...props}
        id={fieldId}
        type="date"
        value={current}
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
export function DatePicker({
  label,
  value,
  defaultValue = "",
  onValueChange,
  error,
  locale,
  presets = [],
  className,
  id,
  min,
  max,
  disabled,
  readOnly,
  ...props
}: DatePickerProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const [current, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [open, setOpen] = useControllableState({ defaultValue: false })
  const selected = parseDateOnly(current)
  return (
    <div data-slot="date-picker" className={cn("space-y-2", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          {...props}
          className="[&::-webkit-calendar-picker-indicator]:hidden"
          id={fieldId}
          type="date"
          min={min}
          max={max}
          disabled={disabled}
          readOnly={readOnly}
          value={current}
          onChange={(e) => set(e.target.value)}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={
            error ? `${fieldId}-error` : props["aria-describedby"]
          }
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled || readOnly}
                aria-label={`Choose ${label}`}
              />
            }
          >
            <CalendarIcon aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected}
              locale={locale}
              disabled={(date) =>
                (!!min && formatDateOnly(date) < String(min)) ||
                (!!max && formatDateOnly(date) > String(max))
              }
              onSelect={(date) => {
                set(date ? formatDateOnly(date) : "")
                setOpen(false)
              }}
            />
            <div className="flex flex-wrap gap-1 border-t p-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={
                    !parseDateOnly(preset.value) ||
                    (!!min && preset.value < String(min)) ||
                    (!!max && preset.value > String(max))
                  }
                  onClick={() => {
                    set(preset.value)
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!current || props.required}
                onClick={() => {
                  set("")
                  setOpen(false)
                }}
              >
                Clear date
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
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
export type DateRangeValue = { start: string; end: string }
export function DateRangePicker({
  label,
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  disabled,
  min,
  max,
  className,
  presets = [],
}: {
  label: string
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
  disabled?: boolean
  min?: string
  max?: string
  className?: string
  presets?: { label: string; value: DateRangeValue }[]
}) {
  const [range, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const invalid = !!range.start && !!range.end && range.end < range.start
  return (
    <fieldset
      data-slot="date-range-picker"
      disabled={disabled}
      className={cn("space-y-2", className)}
    >
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <DatePicker
          label="Start date"
          value={range.start}
          min={min}
          max={max}
          disabled={disabled}
          onValueChange={(start) => set({ ...range, start })}
        />
        <DatePicker
          label="End date"
          value={range.end}
          min={range.start || min}
          max={max}
          disabled={disabled}
          onValueChange={(end) => set({ ...range, end })}
          error={invalid ? "End date must follow start date." : undefined}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="ghost"
            size="sm"
            disabled={
              disabled ||
              !parseDateOnly(preset.value.start) ||
              !parseDateOnly(preset.value.end) ||
              preset.value.end < preset.value.start ||
              (!!min && preset.value.start < min) ||
              (!!max && preset.value.end > max)
            }
            onClick={() => set(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || (!range.start && !range.end)}
          onClick={() => set({ start: "", end: "" })}
        >
          Clear dates
        </Button>
      </div>
    </fieldset>
  )
}
