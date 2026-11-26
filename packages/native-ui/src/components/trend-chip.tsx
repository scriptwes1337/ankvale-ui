import { View, Text } from "react-native"
import { useAnkvaleTheme } from "../theme"
export function TrendChip({
  value,
  inverse = false,
  suffix = "%",
}: {
  value: number
  inverse?: boolean
  suffix?: string
}) {
  const theme = useAnkvaleTheme()
  const positive = inverse ? value < 0 : value > 0
  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 5,
        paddingHorizontal: 6,
        paddingVertical: 3,
        backgroundColor: theme.secondary,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color:
            value === 0 ? theme.muted : positive ? theme.success : theme.danger,
        }}
      >
        {value > 0 ? "↑ +" : value < 0 ? "↓ " : "− "}
        {value}
        {suffix}
      </Text>
    </View>
  )
}
