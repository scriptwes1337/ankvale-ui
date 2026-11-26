"use client"
import { useSyncExternalStore, useCallback } from "react"
/** The server value is stable through hydration; choose an appropriate fallback. */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window.matchMedia !== "function") return () => {}
      const media = window.matchMedia(query)
      media.addEventListener("change", notify)
      return () => media.removeEventListener("change", notify)
    },
    [query]
  )
  const snapshot = useCallback(
    () =>
      typeof window.matchMedia === "function"
        ? window.matchMedia(query).matches
        : serverValue,
    [query, serverValue]
  )
  return useSyncExternalStore(subscribe, snapshot, () => serverValue)
}
