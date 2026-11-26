import { View, Pressable, Text } from "react-native"
import type { NativeOption } from "./toggle-button-group"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export function RadioButtonGroup({
  options,
  value,
  defaultValue = "",
  onValueChange,
  label = "Options",
  disabled,
}: {
  options: (NativeOption & { description?: string })[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  disabled?: boolean
}) {
  const theme = useAnkvaleTheme()
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ gap: 8 }}
    >
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          aria-checked={selected === option.value}
          accessibilityState={{
            checked: selected === option.value,
            disabled: disabled || option.disabled,
          }}
          disabled={disabled || option.disabled}
          onPress={() => setSelected(option.value)}
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            minHeight: 48,
            borderRadius: theme.radius,
            borderWidth: 1,
            borderColor:
              selected === option.value ? theme.primary : theme.border,
            padding: 12,
            backgroundColor:
              selected === option.value ? theme.accent : theme.surface,
            opacity: disabled || option.disabled ? 0.5 : 1,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              borderWidth: 1,
              borderColor:
                selected === option.value ? theme.primary : theme.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected === option.value && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: theme.primary,
                }}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: theme.foreground }}>
              {option.label}
            </Text>
            {option.description && (
              <Text style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
                {option.description}
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  )
}
