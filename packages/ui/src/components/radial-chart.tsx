"use client"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import { RadialBarChart, RadialBar, PolarAngleAxis, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@ankvale/ui/components/chart"
import { chartColors } from "@ankvale/ui/lib/chart-series"
import type { PieChartDatum } from "@ankvale/ui/components/pie-chart"
export function RadialChart({
  data,
  label,
  max = 100,
  height = 260,
  animate = true,
  className,
}: {
  data: PieChartDatum[]
  label: string
  max?: number
  height?: number
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
      data-slot="radial-chart"
      role="img"
      aria-label={label}
      config={config}
      className={className}
      style={{ height, width: "100%" }}
    >
      <RadialBarChart
        accessibilityLayer
        data={data}
        innerRadius="30%"
        outerRadius="95%"
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
        <RadialBar
          dataKey="value"
          background
          cornerRadius={4}
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
        </RadialBar>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
      </RadialBarChart>
    </ChartContainer>
  )
}
