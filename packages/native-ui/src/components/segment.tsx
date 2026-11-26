import { View, Text, Pressable } from "react-native"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
import type { NativeOption } from "./toggle-button-group"
export type NativeSegmentProps = {
  options: NativeOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  disabled?: boolean
}
export function Segment({
  options,
  value,
  defaultValue = options.find((o) => !o.disabled)?.value ?? "",
  onValueChange,
  label = "View",
  disabled,
}: NativeSegmentProps) {
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    )
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        padding: 4,
        gap: 4,
        backgroundColor: theme.secondary,
        borderRadius: theme.radius,
      }}
    >
      {options.map((option) => (
        <Pressable
          key={option.value}
          disabled={disabled || option.disabled}
          accessibilityRole="tab"
          aria-selected={selected === option.value}
          accessibilityState={{
            selected: selected === option.value,
            disabled: disabled || option.disabled,
          }}
          onPress={() => setSelected(option.value)}
          style={{
            flex: 1,
            minHeight: 44,
            paddingHorizontal: 12,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius - 2,
            backgroundColor:
              selected === option.value ? theme.surface : "transparent",
            opacity: disabled || option.disabled ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: selected === option.value ? theme.primary : theme.muted,
              fontWeight: selected === option.value ? "600" : "400",
            }}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
