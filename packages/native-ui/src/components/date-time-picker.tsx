import {
  WheelDateTimePicker,
  type DateTimePickerProps,
} from "./wheel-date-time-picker"
import { PickerDialog } from "../lib/picker-dialog"
import { dateKey } from "../lib/dates"
import { useControllableState } from "../use-controllable-state"
export function DateTimePicker({
  value,
  defaultValue = `${dateKey(new Date())}T09:00`,
  onValueChange,
  label = "Date and time",
  ...props
}: DateTimePickerProps) {
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return (
    <PickerDialog
      label={label}
      summary={selected.replace("T", " · ")}
      disabled={props.disabled}
    >
      <WheelDateTimePicker
        {...props}
        value={selected}
        onValueChange={setSelected}
      />
    </PickerDialog>
  )
}
