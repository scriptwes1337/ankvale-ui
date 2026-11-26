import { View } from "react-native"
import { ToggleButton } from "./toggle-button"
import { useControllableState } from "../use-controllable-state"
export type NativeOption = { value: string; label: string; disabled?: boolean }
export function ToggleButtonGroup({
  options,
  value,
  defaultValue = [],
  onValueChange,
  multiple = true,
  label = "Options",
  disabled,
}: {
  options: NativeOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  label?: string
  disabled?: boolean
}) {
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  return (
    <View
      accessibilityLabel={label}
      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          selected={selected.includes(option.value)}
          onSelectedChange={(active) =>
            setSelected(
              multiple
                ? active
                  ? [...selected, option.value]
                  : selected.filter((item) => item !== option.value)
                : [option.value]
            )
          }
          disabled={disabled || option.disabled}
        >
          {option.label}
        </ToggleButton>
      ))}
    </View>
  )
}
