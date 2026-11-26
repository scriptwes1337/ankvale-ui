"use client"
import { useContext, useSyncExternalStore } from "react"
import { AnkvaleMotionContext } from "@ankvale/ui/lib/ankvale-config"
const query = "(prefers-reduced-motion: reduce)"
function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {}
  const media = window.matchMedia(query)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
function snapshot() {
  return (
    typeof window.matchMedia !== "function" || window.matchMedia(query).matches
  )
}
function serverSnapshot() {
  return true
}
/** OS and nested provider opt-outs; safe SSR defaults and live preference changes. */
export function useReducedMotion() {
  const preference = useContext(AnkvaleMotionContext)
  const reduced = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  return preference === "none" || reduced
}
