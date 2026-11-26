import { useState, useEffect } from "react"
import { TextInput, Text, View, type TextInputProps } from "react-native"
import { useControllableState } from "../use-controllable-state"
import { useAnkvaleTheme } from "../theme"
export type NumberFieldProps = Omit<
  TextInputProps,
  "value" | "defaultValue" | "onChangeText"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  label: string
}
export function NumberField({
  value,
  defaultValue = 0,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  label,
  style,
  onBlur,
  ...props
}: NumberFieldProps) {
  const theme = useAnkvaleTheme()
  const [number, setNumber] = useControllableState(
    value,
    Math.min(max, Math.max(min, defaultValue)),
    onValueChange
  )
  const [draft, setDraft] = useState(String(number))
  useEffect(() => setDraft(String(number)), [number])
  function commit() {
    const parsed = Number(draft)
    if (draft.trim() !== "" && Number.isFinite(parsed)) {
      const next = Math.min(max, Math.max(min, parsed))
      setNumber(next)
      setDraft(String(next))
    } else setDraft(String(number))
  }
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, color: theme.foreground }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        inputMode="decimal"
        value={draft}
        onChangeText={setDraft}
        onBlur={(event) => {
          commit()
          onBlur?.(event)
        }}
        onSubmitEditing={commit}
        style={[
          {
            minHeight: 44,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: theme.radius,
            paddingHorizontal: 12,
            color: theme.foreground,
            backgroundColor: theme.surface,
            fontSize: 14,
          },
          style,
        ]}
        {...props}
      />
    </View>
  )
}
