"use client"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import {
  AreaChart as RechartsChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
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
import { cn } from "@ankvale/ui/lib/utils"
export function AreaChart({
  data,
  series,
  xKey,
  label,
  height = 260,
  stacked = false,
  horizontal = false,
  sparkline = false,
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
  if (!data.length)
    return (
      <div
        role="status"
        className="p-6 text-center text-sm text-muted-foreground"
      >
        No chart data.
      </div>
    )
  return (
    <ChartContainer
      data-slot="area-chart"
      role="img"
      aria-label={label}
      config={config}
      className={cn("w-full", className)}
      style={{ height }}
    >
      <RechartsChart
        accessibilityLayer
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
      >
        {!sparkline && (
          <>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              type={horizontal ? "number" : "category"}
              dataKey={horizontal ? undefined : xKey}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type={horizontal ? "category" : "number"}
              dataKey={horizontal ? xKey : undefined}
              tickLine={false}
              axisLine={false}
              width={horizontal ? 85 : 45}
            />
          </>
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        {!sparkline && legend && series.length > 1 && (
          <ChartLegend content={<ChartLegendContent />} />
        )}
        {series.map((item, i) => (
          <Area
            key={item.key}
            dataKey={item.key}
            name={item.label}
            stroke={item.color ?? chartColors[i % chartColors.length]}
            fill={item.color ?? chartColors[i % chartColors.length]}
            {...(stacked ? { stackId: "stack" } : {})}
            fillOpacity={0.12}
            type="monotone"
            strokeWidth={2}
            isAnimationActive={animate && !reducedMotion}
            animationDuration={320}
            animationEasing="ease-out"
          />
        ))}
      </RechartsChart>
    </ChartContainer>
  )
}
