import { CartesianChart, type NativeChartProps } from "../lib/cartesian-chart"
export function BarChart(props: NativeChartProps) {
  return <CartesianChart {...props} kind="bar" />
}
export type {
  NativeChartProps,
  NativeChartSeries,
} from "../lib/cartesian-chart"
