"use client"

import { useState } from "react"

/** Keeps controlled props authoritative; emits changes only for new values. */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}): [T, (value: T) => void] {
  const [internal, setInternal] = useState(defaultValue)
  const current = value === undefined ? internal : value
  return [
    current,
    (next) => {
      if (Object.is(current, next)) return
      if (value === undefined) setInternal(next)
      onChange?.(next)
    },
  ]
}
