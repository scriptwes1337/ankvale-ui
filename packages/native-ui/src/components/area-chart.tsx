import { CartesianChart, type NativeChartProps } from "../lib/cartesian-chart"
export function AreaChart(props: NativeChartProps) {
  return <CartesianChart {...props} kind="area" />
}
export type {
  NativeChartProps,
  NativeChartSeries,
} from "../lib/cartesian-chart"
