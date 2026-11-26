import { useEffect, useState } from "react"
import { View, Text, TextInput } from "react-native"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
import { parseDate } from "../lib/dates"
export type DateFieldProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  min?: string
  max?: string
  disabled?: boolean
  onInvalid?: (value: string) => void
}
export function DateField({
  value,
  defaultValue = "",
  onValueChange,
  label = "Date",
  min,
  max,
  disabled,
  onInvalid,
}: DateFieldProps) {
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    [draft, setDraft] = useState(selected),
    [error, setError] = useState("")
  useEffect(() => setDraft(selected), [selected])
  function commit() {
    if (!draft) {
      setSelected("")
      setError("")
      return
    }
    if (!parseDate(draft) || (min && draft < min) || (max && draft > max)) {
      setError(
        `Enter a valid date${min ? ` from ${min}` : ""}${max ? ` through ${max}` : ""}.`
      )
      onInvalid?.(draft)
      return
    }
    setError("")
    setSelected(draft)
  }
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: theme.foreground }}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, YYYY-MM-DD`}
        value={draft}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        editable={!disabled}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.muted}
        maxLength={10}
        keyboardType="numbers-and-punctuation"
        style={{
          borderWidth: 1,
          borderColor: error ? theme.danger : theme.border,
          borderRadius: theme.radius,
          color: theme.foreground,
          minHeight: 44,
          padding: 12,
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={{ color: theme.danger, fontSize: 12 }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}
