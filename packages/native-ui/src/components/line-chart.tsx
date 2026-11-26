import { CartesianChart, type NativeChartProps } from "../lib/cartesian-chart"
export function LineChart(props: NativeChartProps) {
  return <CartesianChart {...props} kind="line" />
}
export type {
  NativeChartProps,
  NativeChartSeries,
} from "../lib/cartesian-chart"
