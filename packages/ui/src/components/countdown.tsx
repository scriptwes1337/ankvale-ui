"use client"
import { useEffect, useRef, useState } from "react"
/** Absolute deadline in milliseconds. Starts only after hydration; label is stable for assistive technology. */
export function Countdown({
  deadline,
  label,
  paused = false,
  onExpire,
}: {
  deadline: number
  label: string
  paused?: boolean
  onExpire?: () => void
}) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const callback = useRef(onExpire)
  callback.current = onExpire
  const expired = useRef<number | null>(null)
  useEffect(() => {
    if (paused) return
    function tick() {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(next)
      if (!next && expired.current !== deadline) {
        expired.current = deadline
        callback.current?.()
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [deadline, paused])
  const seconds = remaining ?? 0
  return (
    <span
      data-slot="countdown"
      role="timer"
      aria-label={label}
      aria-live="off"
      className="font-mono tabular-nums"
    >
      {remaining === null
        ? "--:--:--"
        : `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`}
      {paused && <span className="sr-only"> paused</span>}
    </span>
  )
}
