import { View } from "react-native"
import { WheelPickerGroup } from "./wheel-picker-group"
import { WheelTimePicker, type TimePickerProps } from "./wheel-time-picker"
import { dateKey, parseDate } from "../lib/dates"
import { useControllableState } from "../use-controllable-state"
export type DateTimePickerProps = Omit<
  TimePickerProps,
  "value" | "defaultValue" | "onValueChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  min?: string
  max?: string
  locale?: string
}
export function WheelDateTimePicker({
  value,
  defaultValue = `${dateKey(new Date())}T09:00`,
  onValueChange,
  min,
  max,
  locale = "en",
  ...props
}: DateTimePickerProps) {
  const [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    [datePart, time = "09:00"] = selected.split("T"),
    date = parseDate(datePart ?? "") ?? new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate()
  const start = min ? Number(min.slice(0, 4)) : year - 100,
    end = max ? Number(max.slice(0, 4)) : year + 100
  function commit(next: string) {
    if (min && next < min) next = min
    if (max && next > max) next = max
    setSelected(next)
  }
  return (
    <View style={{ gap: 16 }}>
      <WheelPickerGroup
        disabled={props.disabled}
        columns={[
          {
            id: "year",
            label: "Year",
            options: Array.from(
              { length: Math.max(0, Math.min(1000, end - start + 1)) },
              (_, i) => ({ value: String(start + i), label: String(start + i) })
            ),
          },
          {
            id: "month",
            label: "Month",
            options: Array.from({ length: 12 }, (_, i) => ({
              value: String(i + 1),
              label: new Date(2024, i, 1).toLocaleDateString(locale, {
                month: "short",
              }),
            })),
          },
          {
            id: "day",
            label: "Day",
            options: Array.from(
              { length: new Date(year, month, 0).getDate() },
              (_, i) => ({ value: String(i + 1), label: String(i + 1) })
            ),
          },
        ]}
        value={{ year: String(year), month: String(month), day: String(day) }}
        onValueChange={(next) => {
          const y = Number(next.year),
            m = Number(next.month),
            d = Math.min(Number(next.day), new Date(y, m, 0).getDate())
          commit(`${dateKey(new Date(y, m - 1, d))}T${time}`)
        }}
      />
      <WheelTimePicker
        {...props}
        value={time}
        onValueChange={(next) => commit(`${dateKey(date)}T${next}`)}
      />
    </View>
  )
}
