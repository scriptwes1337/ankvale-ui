import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { Button } from "./button"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
import { dateKey, parseDate, addDays, type DateRange } from "../lib/dates"
export type CalendarProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (date: string) => void
  min?: string
  max?: string
  isDateDisabled?: (date: string) => boolean
  locale?: string
  weekStartsOn?: number
  range?: DateRange
  onRangeChange?: (range: DateRange) => void
  label?: string
}
export function Calendar({
  value,
  defaultValue = "",
  onValueChange,
  min,
  max,
  isDateDisabled,
  locale = "en",
  weekStartsOn = 0,
  range,
  onRangeChange,
  label = "Choose date",
}: CalendarProps) {
  const theme = useAnkvaleTheme()
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const [month, setMonth] = useState(() => {
    const d = parseDate(range?.start ?? selected) ?? new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [anchor, setAnchor] = useState<string | null>(null)
  const [years, setYears] = useState(false)
  const [rangeError, setRangeError] = useState("")
  const offset = (month.getDay() - weekStartsOn + 7) % 7
  const first = addDays(month, -offset)
  function choose(key: string) {
    setRangeError("")
    if (onRangeChange) {
      if (!anchor) {
        setAnchor(key)
        onRangeChange({ start: key, end: key })
      } else {
        const from = anchor < key ? anchor : key,
          to = anchor < key ? key : anchor
        let cursor = parseDate(from)!
        while (dateKey(cursor) <= to) {
          if (isDateDisabled?.(dateKey(cursor))) {
            setRangeError("This range includes unavailable dates.")
            return
          }
          cursor = addDays(cursor, 1)
        }
        onRangeChange({
          start: anchor < key ? anchor : key,
          end: anchor < key ? key : anchor,
        })
        setAnchor(null)
      }
    } else setSelected(key)
  }
  function move(amount: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1))
  }
  return (
    <View accessibilityLabel={label} style={{ gap: 8, maxWidth: 420 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button variant="ghost" label="Previous month" onPress={() => move(-1)}>
          ‹
        </Button>
        <Button
          variant="ghost"
          label="Choose year"
          onPress={() => setYears(!years)}
        >
          {month.toLocaleDateString(locale, { month: "long", year: "numeric" })}
        </Button>
        <Button variant="ghost" label="Next month" onPress={() => move(1)}>
          ›
        </Button>
      </View>
      {years ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from(
            { length: 21 },
            (_, i) => month.getFullYear() - 10 + i
          ).map((year) => (
            <View key={year} style={{ width: "33.333%" }}>
              <Button
                variant="ghost"
                onPress={() => {
                  setMonth(new Date(year, month.getMonth(), 1))
                  setYears(false)
                }}
              >
                {year}
              </Button>
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row" }}>
            {Array.from({ length: 7 }, (_, i) => (
              <Text
                key={i}
                style={{
                  width: "14.285%",
                  textAlign: "center",
                  color: theme.muted,
                  fontSize: 12,
                  paddingVertical: 8,
                }}
              >
                {addDays(
                  new Date(2024, 0, 7),
                  i + weekStartsOn
                ).toLocaleDateString(locale, { weekday: "narrow" })}
              </Text>
            ))}
          </View>
          {Array.from({ length: 6 }, (_, week) => (
            <View key={week} style={{ flexDirection: "row" }}>
              {Array.from({ length: 7 }, (_, day) => {
                const date = addDays(first, week * 7 + day),
                  key = dateKey(date),
                  disabled = !!(
                    (min && key < min) ||
                    (max && key > max) ||
                    isDateDisabled?.(key)
                  ),
                  active = onRangeChange
                    ? !!range?.start && key >= range.start && key <= range.end
                    : key === selected
                return (
                  <Pressable
                    key={key}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={date.toLocaleDateString(locale, {
                      dateStyle: "full",
                    })}
                    aria-selected={active}
                    accessibilityState={{ selected: active, disabled }}
                    onPress={() => choose(key)}
                    style={{
                      width: "14.285%",
                      minHeight: 44,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: theme.radius,
                      backgroundColor: active ? theme.primary : "transparent",
                      opacity: disabled
                        ? 0.3
                        : date.getMonth() !== month.getMonth()
                          ? 0.5
                          : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: active
                          ? theme.primaryForeground
                          : theme.foreground,
                      }}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ))}
        </>
      )}
      {onRangeChange && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: theme.muted, fontSize: 12 }}
        >
          {rangeError ||
            (anchor ? "Choose an end date" : "Choose a start date")}
        </Text>
      )}
    </View>
  )
}
