import { View, Text } from "react-native"
import Svg, { Polygon, Line, Text as SvgText } from "react-native-svg"
import { useAnkvaleTheme } from "../theme"
import type { NativeChartProps } from "../lib/cartesian-chart"
export function RadarChart({
  data,
  xKey,
  series,
  height = 260,
  label = "Radar chart",
}: NativeChartProps) {
  const theme = useAnkvaleTheme()
  const max = Math.max(
    1,
    ...data.flatMap((row) => series.map((s) => Number(row[s.key]) || 0))
  )
  const point = (i: number, f: number) => {
    const angle = (i / Math.max(1, data.length)) * Math.PI * 2 - Math.PI / 2
    return [150 + 100 * f * Math.cos(angle), 150 + 100 * f * Math.sin(angle)]
  }
  return (
    <View accessibilityLabel={label}>
      <Svg width="100%" height={height} viewBox="0 0 300 300" aria-hidden>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <Polygon
            key={f}
            points={data.map((_, i) => point(i, f).join(",")).join(" ")}
            stroke={theme.border}
            fill="none"
          />
        ))}
        {data.map((row, i) => {
          const p = point(i, 1),
            t = point(i, 1.2)
          return (
            <Svg key={i}>
              <Line
                x1={150}
                y1={150}
                x2={p[0]}
                y2={p[1]}
                stroke={theme.border}
              />
              <SvgText
                x={t[0]}
                y={t[1]}
                textAnchor="middle"
                fontSize={10}
                fill={theme.muted}
              >
                {String(row[xKey])}
              </SvgText>
            </Svg>
          )
        })}
        {series.map((s, j) => (
          <Polygon
            key={s.key}
            points={data
              .map((row, i) =>
                point(i, Math.max(0, Number(row[s.key]) || 0) / max).join(",")
              )
              .join(" ")}
            stroke={s.color ?? (j ? theme.foreground : theme.primary)}
            fill={s.color ?? theme.primary}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
      </Svg>
      {data.map((row, i) => (
        <Text key={i} style={{ color: theme.muted, fontSize: 12 }}>
          {String(row[xKey])}:{" "}
          {series.map((s) => `${s.label ?? s.key} ${row[s.key]}`).join(", ")}
        </Text>
      ))}
    </View>
  )
}
