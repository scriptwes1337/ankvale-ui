import { useState } from "react"
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [state, setState] = useState(defaultValue)
  const current = value === undefined ? state : value
  return [
    current,
    (next) => {
      if (Object.is(next, current)) return
      if (value === undefined) setState(next)
      onChange?.(next)
    },
  ]
}
