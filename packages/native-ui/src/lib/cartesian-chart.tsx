import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import Svg, {
  Path,
  Line,
  Circle,
  Rect,
  Text as SvgText,
} from "react-native-svg"
import { useAnkvaleTheme } from "../theme"
export type NativeChartSeries = {
  key: string
  label?: string
  color?: string
  type?: "line" | "bar" | "area"
}
export type NativeChartProps = {
  data: Record<string, string | number>[]
  xKey: string
  series: NativeChartSeries[]
  height?: number
  label?: string
  sparkline?: boolean
  onSelect?: (index: number) => void
}
export function CartesianChart({
  data,
  xKey,
  series,
  height = 220,
  label = "Chart",
  sparkline = false,
  onSelect,
  kind = "line",
}: NativeChartProps & { kind?: "line" | "bar" | "area" | "composed" }) {
  const theme = useAnkvaleTheme(),
    [width, setWidth] = useState(320),
    [selected, setSelected] = useState<number | null>(null)
  const pad = sparkline ? 8 : 36,
    plotW = Math.max(1, width - pad * 2),
    plotH = height - pad * 2
  const values = data.flatMap((row) =>
    series.map((s) => Number(row[s.key])).filter(Number.isFinite)
  )
  const low = Math.min(0, ...values),
    high = Math.max(1, ...values),
    span = high - low
  const x = (i: number) => pad + ((i + 0.5) * plotW) / Math.max(1, data.length),
    y = (v: number) => height - pad - ((v - low) / span) * plotH
  const colors = [theme.primary, theme.foreground, theme.muted, theme.success]
  function select(i: number) {
    setSelected(i)
    onSelect?.(i)
  }
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={label}
      style={{ gap: 8 }}
    >
      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) =>
          select(
            Math.max(
              0,
              Math.min(
                data.length - 1,
                Math.floor(
                  ((e.nativeEvent.locationX - pad) / plotW) * data.length
                )
              )
            )
          )
        }
        onResponderMove={(e) =>
          select(
            Math.max(
              0,
              Math.min(
                data.length - 1,
                Math.floor(
                  ((e.nativeEvent.locationX - pad) / plotW) * data.length
                )
              )
            )
          )
        }
      >
        <Svg width="100%" height={height} aria-hidden>
          {!sparkline &&
            Array.from({ length: 5 }, (_, i) => (
              <Line
                key={i}
                x1={pad}
                x2={width - pad}
                y1={y(low + (span * i) / 4)}
                y2={y(low + (span * i) / 4)}
                stroke={theme.border}
              />
            ))}
          {series.map((s, j) => {
            const color = s.color ?? colors[j % colors.length],
              type = kind === "composed" ? (s.type ?? "line") : kind
            const points = data.map((row, i) => ({
              x: x(i),
              y: y(Number(row[s.key]) || 0),
            }))
            const path = points
              .map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`)
              .join(" ")
            if (type === "bar")
              return data.map((row, i) => (
                <Rect
                  key={`${j}-${i}`}
                  x={
                    x(i) -
                    (plotW / data.length) * 0.4 +
                    (((j * plotW) / data.length) * 0.8) / series.length
                  }
                  y={Math.min(y(0), y(Number(row[s.key]) || 0))}
                  width={Math.max(
                    1,
                    ((plotW / data.length) * 0.8) / series.length - 2
                  )}
                  height={Math.abs(y(0) - y(Number(row[s.key]) || 0))}
                  fill={color}
                  rx={2}
                />
              ))
            return (
              <Path
                key={s.key}
                d={
                  type === "area" && points.length
                    ? `${path} L${points.at(-1)!.x},${y(0)} L${points[0]!.x},${y(0)} Z`
                    : path
                }
                fill={type === "area" ? color : "none"}
                fillOpacity={type === "area" ? 0.15 : 1}
                stroke={color}
                strokeWidth={2}
              />
            )
          })}
          {selected !== null && data[selected] && (
            <>
              <Line
                x1={x(selected)}
                x2={x(selected)}
                y1={pad}
                y2={height - pad}
                stroke={theme.muted}
                strokeDasharray="3 3"
              />
              {series.map((s, j) => (
                <Circle
                  key={s.key}
                  cx={x(selected)}
                  cy={y(Number(data[selected]![s.key]) || 0)}
                  r={4}
                  fill={s.color ?? colors[j % colors.length]}
                />
              ))}
            </>
          )}
          {!sparkline &&
            data.map((row, i) =>
              i % Math.max(1, Math.ceil(data.length / 5)) === 0 ? (
                <SvgText
                  key={i}
                  x={x(i)}
                  y={height - 8}
                  fill={theme.muted}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {String(row[xKey])}
                </SvgText>
              ) : null
            )}
        </Svg>
      </View>
      {selected !== null && data[selected] && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: theme.foreground }}
        >
          {String(data[selected]![xKey])}:{" "}
          {series
            .map((s) => `${s.label ?? s.key} ${data[selected]![s.key]}`)
            .join(", ")}
        </Text>
      )}
      {!sparkline && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {data.map((row, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`${row[xKey]}: ${series.map((s) => `${s.label ?? s.key} ${row[s.key]}`).join(", ")}`}
              onPress={() => select(i)}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text
                style={{
                  color: selected === i ? theme.primary : theme.muted,
                  fontSize: 12,
                }}
              >
                {String(row[xKey])}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {!data.length && <Text style={{ color: theme.muted }}>No data</Text>}
    </View>
  )
}
