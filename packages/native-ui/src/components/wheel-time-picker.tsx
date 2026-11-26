import { WheelPickerGroup } from "./wheel-picker-group"
import { useControllableState } from "../use-controllable-state"
export type TimePickerProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  hourCycle?: 12 | 24
  minuteStep?: number
  disabled?: boolean
  label?: string
}
export function WheelTimePicker({
  value,
  defaultValue = "09:00",
  onValueChange,
  hourCycle = 24,
  minuteStep = 1,
  disabled,
}: TimePickerProps) {
  const [time, setTime] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const [rawHour, rawMinute] = time.split(":").map(Number),
    hour = Number.isFinite(rawHour) ? Math.max(0, Math.min(23, rawHour!)) : 9,
    minute = Number.isFinite(rawMinute)
      ? Math.max(0, Math.min(59, rawMinute!))
      : 0
  const step = Math.max(1, Math.min(30, Math.floor(minuteStep)))
  const minutes = Array.from(
    new Set([
      ...Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step),
      minute,
    ])
  ).sort((a, b) => a - b)
  const columns = [
    {
      id: "hour",
      label: "Hour",
      options: Array.from({ length: hourCycle }, (_, i) => ({
        value: String(hourCycle === 12 ? i + 1 : i),
        label: String(hourCycle === 12 ? i + 1 : i).padStart(2, "0"),
      })),
    },
    {
      id: "minute",
      label: "Minute",
      options: minutes.map((i) => ({
        value: String(i),
        label: String(i).padStart(2, "0"),
      })),
    },
    ...(hourCycle === 12
      ? [
          {
            id: "period",
            label: "Period",
            options: [
              { value: "AM", label: "AM" },
              { value: "PM", label: "PM" },
            ],
          },
        ]
      : []),
  ]
  return (
    <WheelPickerGroup
      columns={columns}
      value={{
        hour: String(hourCycle === 12 ? hour % 12 || 12 : hour),
        minute: String(minute),
        period: hour >= 12 ? "PM" : "AM",
      }}
      disabled={disabled}
      onValueChange={(next) => {
        let h = Number(next.hour)
        if (hourCycle === 12) h = (h % 12) + (next.period === "PM" ? 12 : 0)
        setTime(
          `${String(h).padStart(2, "0")}:${String(next.minute).padStart(2, "0")}`
        )
      }}
    />
  )
}
