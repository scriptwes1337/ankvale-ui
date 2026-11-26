import { View, Text } from "react-native"
import Svg, { Circle } from "react-native-svg"
import { useAnkvaleTheme } from "../theme"
export function ProgressCircle({
  value,
  size = 64,
  label = "Progress",
  showValue = true,
}: {
  value: number
  size?: number
  label?: string
  showValue?: boolean
}) {
  const theme = useAnkvaleTheme()
  const progress = Math.max(0, Math.min(100, value)),
    circumference = 2 * Math.PI * 42
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: progress }}
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ position: "absolute" }}
      >
        <Circle
          cx={50}
          cy={50}
          r={42}
          stroke={theme.secondary}
          strokeWidth={8}
          fill="none"
        />
        <Circle
          cx={50}
          cy={50}
          r={42}
          stroke={theme.primary}
          strokeWidth={8}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - progress / 100)}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </Svg>
      {showValue && (
        <Text style={{ fontSize: 12, color: theme.foreground }}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  )
}
