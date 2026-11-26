import { Calendar, type CalendarProps } from "./calendar"
import { PickerDialog } from "../lib/picker-dialog"
import { useControllableState } from "../use-controllable-state"
export function DatePicker({
  value,
  defaultValue = "",
  onValueChange,
  label = "Date",
  disabled,
  ...props
}: Omit<CalendarProps, "range" | "onRangeChange"> & { disabled?: boolean }) {
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return (
    <PickerDialog label={label} summary={selected} disabled={disabled}>
      <Calendar {...props} value={selected} onValueChange={setSelected} />
    </PickerDialog>
  )
}
