import { View, Text } from "react-native"
import Svg, { Circle } from "react-native-svg"
import { useAnkvaleTheme } from "../theme"
import type { NativePieDatum } from "./pie-chart"
export function RadialChart({
  data,
  max = 100,
  size = 200,
  label = "Progress by category",
}: {
  data: NativePieDatum[]
  max?: number
  size?: number
  label?: string
}) {
  const theme = useAnkvaleTheme()
  return (
    <View accessibilityLabel={label} style={{ alignItems: "center", gap: 8 }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
        {data.map((item, i) => {
          const radius = 90 - i * (80 / Math.max(1, data.length)),
            c = 2 * Math.PI * radius
          return (
            <Circle
              key={i}
              cx={100}
              cy={100}
              r={radius}
              fill="none"
              stroke={item.color ?? theme.primary}
              opacity={Math.max(0.4, 1 - i * 0.04)}
              strokeWidth={Math.min(10, 56 / Math.max(1, data.length))}
              strokeDasharray={`${c * Math.max(0, Math.min(1, item.value / Math.max(1, max)))} ${c}`}
              transform="rotate(-90 100 100)"
            />
          )
        })}
      </Svg>
      {data.map((item, i) => (
        <Text key={i} style={{ color: theme.foreground }}>
          {item.label}: {item.value} / {max}
        </Text>
      ))}
    </View>
  )
}
