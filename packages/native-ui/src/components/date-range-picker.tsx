import { RangeCalendar } from "./range-calendar"
import type { CalendarProps } from "./calendar"
import type { DateRange } from "../lib/dates"
import { PickerDialog } from "../lib/picker-dialog"
import { useControllableState } from "../use-controllable-state"
export function DateRangePicker({
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  label = "Date range",
  disabled,
  ...props
}: Omit<
  CalendarProps,
  "value" | "defaultValue" | "onValueChange" | "range" | "onRangeChange"
> & {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange) => void
  disabled?: boolean
}) {
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return (
    <PickerDialog
      label={label}
      summary={selected.start ? `${selected.start} – ${selected.end}` : ""}
      disabled={disabled}
    >
      <RangeCalendar {...props} value={selected} onValueChange={setSelected} />
    </PickerDialog>
  )
}
