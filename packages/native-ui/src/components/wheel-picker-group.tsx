import { View, Text } from "react-native"
import { WheelPicker } from "./wheel-picker"
import type { NativeOption } from "./toggle-button-group"
import { useAnkvaleTheme } from "../theme"
export type WheelColumn = { id: string; label: string; options: NativeOption[] }
export function WheelPickerGroup({
  columns,
  value,
  onValueChange,
  disabled,
}: {
  columns: WheelColumn[]
  value: Record<string, string>
  onValueChange: (value: Record<string, string>) => void
  disabled?: boolean
}) {
  const theme = useAnkvaleTheme()
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {columns.map((column) => (
        <View key={column.id} style={{ flex: 1, gap: 8 }}>
          <Text
            style={{ fontSize: 12, color: theme.muted, textAlign: "center" }}
          >
            {column.label}
          </Text>
          <WheelPicker
            label={column.label}
            options={column.options}
            value={value[column.id]}
            disabled={disabled}
            onValueChange={(selected) =>
              onValueChange({ ...value, [column.id]: selected })
            }
          />
        </View>
      ))}
    </View>
  )
}
