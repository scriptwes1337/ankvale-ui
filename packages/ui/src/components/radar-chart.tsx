"use client"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import {
  RadarChart as RechartsChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@ankvale/ui/components/chart"
import {
  chartColors,
  type CartesianChartProps,
} from "@ankvale/ui/lib/chart-series"
export function RadarChart({
  data,
  series,
  xKey,
  label,
  height = 280,
  legend = true,
  animate = true,
  className,
}: CartesianChartProps) {
  const reducedMotion = useReducedMotion()
  const config = Object.fromEntries(
    series.map((item, i) => [
      item.key,
      {
        label: item.label,
        color: item.color ?? chartColors[i % chartColors.length],
      },
    ])
  )
  if (!data.length) return <p role="status">No chart data.</p>
  return (
    <ChartContainer
      data-slot="radar-chart"
      role="img"
      aria-label={label}
      config={config}
      className={className}
      style={{ height, width: "100%" }}
    >
      <RechartsChart accessibilityLayer data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey={xKey} />
        {series.map((item, i) => (
          <Radar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            stroke={item.color ?? chartColors[i % chartColors.length]}
            fill={item.color ?? chartColors[i % chartColors.length]}
            fillOpacity={0.1}
            isAnimationActive={animate && !reducedMotion}
            animationDuration={320}
            animationEasing="ease-out"
          />
        ))}
        <ChartTooltip content={<ChartTooltipContent />} />
        {legend && <ChartLegend content={<ChartLegendContent />} />}
      </RechartsChart>
    </ChartContainer>
  )
}
