import { WheelTimePicker, type TimePickerProps } from "./wheel-time-picker"
import { PickerDialog } from "../lib/picker-dialog"
import { useControllableState } from "../use-controllable-state"
export function TimePicker({
  value,
  defaultValue = "09:00",
  onValueChange,
  label = "Time",
  disabled,
  ...props
}: TimePickerProps) {
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return (
    <PickerDialog label={label} summary={selected} disabled={disabled}>
      <WheelTimePicker
        {...props}
        disabled={disabled}
        value={selected}
        onValueChange={setSelected}
      />
    </PickerDialog>
  )
}
