import { Calendar, type CalendarProps } from "./calendar"
import { useControllableState } from "../use-controllable-state"
import type { DateRange } from "../lib/dates"
export function RangeCalendar({
  value,
  defaultValue = { start: "", end: "" },
  onValueChange,
  ...props
}: Omit<
  CalendarProps,
  "value" | "defaultValue" | "onValueChange" | "range" | "onRangeChange"
> & {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange) => void
}) {
  const [range, setRange] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return <Calendar {...props} range={range} onRangeChange={setRange} />
}
export type { DateRange } from "../lib/dates"
