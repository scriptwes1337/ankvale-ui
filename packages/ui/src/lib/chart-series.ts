export type ChartDatum = Record<string, string | number | null>
export type ChartSeries = {
  key: string
  label: string
  color?: string
  type?: "line" | "bar" | "area"
  dashed?: boolean
}
export type CartesianChartProps = {
  data: ChartDatum[]
  series: ChartSeries[]
  xKey: string
  label: string
  animate?: boolean
  height?: number
  stacked?: boolean
  horizontal?: boolean
  sparkline?: boolean
  legend?: boolean
  className?: string
}
export const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]
