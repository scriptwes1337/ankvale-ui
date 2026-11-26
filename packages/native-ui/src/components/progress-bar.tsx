import { View, Text } from "react-native"
import { useAnkvaleTheme } from "../theme"
export function ProgressBar({
  value,
  label = "Progress",
  showValue = false,
}: {
  value: number
  label?: string
  showValue?: boolean
}) {
  const theme = useAnkvaleTheme()
  const progress = Math.max(0, Math.min(100, value))
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: progress }}
      style={{ gap: 6 }}
    >
      {showValue && (
        <Text style={{ fontSize: 12, color: theme.muted }}>
          {Math.round(progress)}%
        </Text>
      )}
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.secondary,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.primary,
          }}
        />
      </View>
    </View>
  )
}
