"use client"
import { createContext, useContext, type RefObject } from "react"
export type AnkvaleMotionPreference = "system" | "none"
export type AnkvaleConfig = {
  locale: string
  timeZone: string
  direction: "ltr" | "rtl"
  density: "compact" | "comfortable" | "spacious"
  motion: AnkvaleMotionPreference
  appearance: "inherit" | "light" | "dark" | "system"
  portalContainer?:
    HTMLElement | ShadowRoot | RefObject<HTMLElement | null> | null
  tooltipDelay: number
}
export const defaultAnkvaleConfig: AnkvaleConfig = {
  locale: "en-US",
  timeZone: "UTC",
  direction: "ltr",
  density: "comfortable",
  motion: "system",
  appearance: "inherit",
  tooltipDelay: 200,
}
export const AnkvaleConfigContext =
  createContext<AnkvaleConfig>(defaultAnkvaleConfig)
export const AnkvaleMotionContext =
  createContext<AnkvaleMotionPreference>("system")

export function useAnkvaleDefaults() {
  return useContext(AnkvaleConfigContext)
}
