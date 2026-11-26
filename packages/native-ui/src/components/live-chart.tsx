import { useEffect, useState } from "react"
import { LineChart } from "./line-chart"
import type { NativeChartProps } from "../lib/cartesian-chart"
export function LiveChart({
  subscribe,
  maxPoints = 60,
  ...props
}: NativeChartProps & {
  subscribe?: (
    push: (row: Record<string, string | number>) => void
  ) => () => void
  maxPoints?: number
}) {
  const limit = Math.max(1, Math.min(10000, Math.floor(maxPoints) || 60))
  const [rows, setRows] = useState(() => props.data.slice(-limit))
  useEffect(() => setRows(props.data.slice(-limit)), [props.data, limit])
  useEffect(() => {
    let active = true
    const unsubscribe = subscribe?.((row) => {
      if (active) setRows((previous) => [...previous, row].slice(-limit))
    })
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [subscribe, limit])
  return <LineChart {...props} data={rows} />
}
