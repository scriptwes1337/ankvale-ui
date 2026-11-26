"use client"
import { useEffect, useRef, useState, type ComponentProps } from "react"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import { cn } from "@ankvale/ui/lib/utils"
export function NumberValue({
  value,
  format,
  locale = "en-US",
  duration = 350,
  className,
  ...props
}: Omit<ComponentProps<"span">, "children"> & {
  value: number
  format?: Intl.NumberFormatOptions
  locale?: string
  duration?: number
}) {
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const previous = useRef(value)
  useEffect(() => {
    const from = previous.current
    previous.current = value
    if (duration <= 0 || reducedMotion) {
      setDisplay(value)
      return
    }
    let frame: number
    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      setDisplay(from + (value - from) * (1 - (1 - progress) ** 3))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reducedMotion])
  const formatter = new Intl.NumberFormat(locale, format)
  return (
    <span
      data-slot="number-value"
      className={cn("tabular-nums", className)}
      {...props}
    >
      <span aria-hidden="true">{formatter.format(display)}</span>
      <span className="sr-only">{formatter.format(value)}</span>
    </span>
  )
}
