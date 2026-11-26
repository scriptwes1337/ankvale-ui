import { View, Text, Pressable, ScrollView } from "react-native"
import { Calendar, type CalendarProps } from "./calendar"
import { dateKey } from "../lib/dates"
import { useControllableState } from "../use-controllable-state"
import { useAnkvaleTheme } from "../theme"
export type NativeAgendaEvent = {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
}
export function Agenda({
  events,
  value,
  defaultValue = dateKey(new Date()),
  onValueChange,
  onEventPress,
  ...props
}: CalendarProps & {
  events: NativeAgendaEvent[]
  onEventPress?: (event: NativeAgendaEvent) => void
}) {
  const theme = useAnkvaleTheme(),
    [date, setDate] = useControllableState(value, defaultValue, onValueChange)
  const list = events
    .filter((e) => dateKey(e.start) <= date && dateKey(e.end) >= date)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  return (
    <View style={{ gap: 16 }}>
      <Calendar {...props} value={date} onValueChange={setDate} />
      <Text
        accessibilityRole="header"
        style={{ fontWeight: "600", color: theme.foreground }}
      >
        {date}
      </Text>
      <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: 8 }}>
        {list.map((event) => (
          <Pressable
            key={event.id}
            accessibilityRole={onEventPress ? "button" : undefined}
            disabled={!onEventPress}
            onPress={() => onEventPress?.(event)}
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: theme.radius,
              gap: 4,
            }}
          >
            <Text style={{ color: theme.foreground, fontWeight: "600" }}>
              {event.title}
            </Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>
              {event.start.toLocaleTimeString(props.locale, {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {event.end.toLocaleTimeString(props.locale, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
            {event.description && (
              <Text style={{ color: theme.muted }}>{event.description}</Text>
            )}
          </Pressable>
        ))}
        {!list.length && <Text style={{ color: theme.muted }}>No events</Text>}
      </ScrollView>
    </View>
  )
}
