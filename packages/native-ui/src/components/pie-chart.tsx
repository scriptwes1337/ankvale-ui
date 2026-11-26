import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import Svg, { Path, Circle } from "react-native-svg"
import { useAnkvaleTheme } from "../theme"
export type NativePieDatum = { label: string; value: number; color?: string }
export function PieChart({
  data,
  size = 200,
  donut = false,
  label = "Distribution",
  onSelect,
}: {
  data: NativePieDatum[]
  size?: number
  donut?: boolean
  label?: string
  onSelect?: (item: NativePieDatum) => void
}) {
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useState<string>()
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0)
  let angle = -Math.PI / 2
  const colors = [
    theme.primary,
    theme.foreground,
    theme.muted,
    theme.success,
    theme.border,
  ]
  return (
    <View accessibilityLabel={label} style={{ alignItems: "center", gap: 12 }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
        {data.map((item, i) => {
          const start = angle,
            portion = Math.max(0, item.value) / Math.max(1, total),
            end = angle + portion * Math.PI * 2
          angle = end
          const color = item.color ?? colors[i % colors.length]
          if (portion >= 1)
            return <Circle key={i} cx={100} cy={100} r={90} fill={color} />
          if (!portion) return null
          return (
            <Path
              key={i}
              d={`M100,100 L${100 + 90 * Math.cos(start)},${100 + 90 * Math.sin(start)} A90,90 0 ${portion > 0.5 ? 1 : 0},1 ${100 + 90 * Math.cos(end)},${100 + 90 * Math.sin(end)} Z`}
              fill={color}
              stroke={theme.background}
              strokeWidth={2}
            />
          )
        })}
        {donut && <Circle cx={100} cy={100} r={58} fill={theme.background} />}
      </Svg>
      {data.map((item, i) => (
        <Pressable
          key={i}
          accessibilityRole="button"
          aria-selected={selected === item.label}
          accessibilityState={{ selected: selected === item.label }}
          accessibilityLabel={`${item.label}: ${item.value}, ${total ? Math.round((Math.max(0, item.value) / total) * 100) : 0}%`}
          onPress={() => {
            setSelected(item.label)
            onSelect?.(item)
          }}
          style={{
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: item.color ?? colors[i % colors.length],
              borderRadius: 2,
            }}
          />
          <Text style={{ color: theme.foreground }}>
            {item.label} · {item.value}
          </Text>
        </Pressable>
      ))}
      {!total && <Text style={{ color: theme.muted }}>No data</Text>}
    </View>
  )
}
