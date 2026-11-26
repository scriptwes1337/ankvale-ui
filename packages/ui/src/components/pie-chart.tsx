"use client"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import { PieChart as RechartsChart, Pie, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@ankvale/ui/components/chart"
import { chartColors } from "@ankvale/ui/lib/chart-series"
export type PieChartDatum = { name: string; value: number; color?: string }
export function PieChart({
  data,
  label,
  height = 260,
  donut = false,
  legend = true,
  animate = true,
  className,
}: {
  data: PieChartDatum[]
  label: string
  height?: number
  donut?: boolean
  legend?: boolean
  animate?: boolean
  className?: string
}) {
  const reducedMotion = useReducedMotion()
  const config = Object.fromEntries(
    data.map((item, i) => [
      item.name,
      {
        label: item.name,
        color: item.color ?? chartColors[i % chartColors.length],
      },
    ])
  )
  if (!data.length) return <p role="status">No chart data.</p>
  return (
    <ChartContainer
      data-slot="pie-chart"
      role="img"
      aria-label={label}
      config={config}
      className={className}
      style={{ height, width: "100%" }}
    >
      <RechartsChart accessibilityLayer>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={donut ? 55 : 0}
          outerRadius={90}
          paddingAngle={2}
          isAnimationActive={animate && !reducedMotion}
          animationDuration={320}
          animationEasing="ease-out"
        >
          {data.map((item, i) => (
            <Cell
              key={`${item.name}-${i}`}
              fill={item.color ?? chartColors[i % chartColors.length]}
            />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        {legend && (
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        )}
      </RechartsChart>
    </ChartContainer>
  )
}
