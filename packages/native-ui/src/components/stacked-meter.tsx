import { View, Text } from "react-native"
import { useAnkvaleTheme } from "../theme"
import type { NativePieDatum } from "./pie-chart"
export function StackedMeter({
  data,
  label = "Allocation",
}: {
  data: NativePieDatum[]
  label?: string
}) {
  const theme = useAnkvaleTheme(),
    total = data.reduce((s, d) => s + Math.max(0, d.value), 0)
  return (
    <View accessibilityLabel={label} style={{ gap: 12 }}>
      <View
        accessibilityElementsHidden
        style={{
          flexDirection: "row",
          height: 12,
          borderRadius: 6,
          overflow: "hidden",
          backgroundColor: theme.secondary,
        }}
      >
        {data.map((item, i) => (
          <View
            key={i}
            style={{
              flex: Math.max(0, item.value),
              backgroundColor:
                item.color ??
                [theme.primary, theme.foreground, theme.muted, theme.success][
                  i % 4
                ],
            }}
          />
        ))}
      </View>
      {data.map((item, i) => (
        <Text key={i} style={{ color: theme.foreground, fontSize: 12 }}>
          {item.label}: {item.value} (
          {total ? Math.round((Math.max(0, item.value) / total) * 100) : 0}%)
        </Text>
      ))}
    </View>
  )
}
