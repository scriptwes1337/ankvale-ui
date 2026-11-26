import { CartesianChart, type NativeChartProps } from "../lib/cartesian-chart"
export function ComposedChart(props: NativeChartProps) {
  return <CartesianChart {...props} kind="composed" />
}
export type {
  NativeChartProps,
  NativeChartSeries,
} from "../lib/cartesian-chart"
