"use client"
import { useEffect, useRef, type ComponentProps } from "react"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import { cn } from "@ankvale/ui/lib/utils"
export type MotionProps = ComponentProps<"div"> & {
  preset?: "reveal" | "fade" | "scale"
  /** Milliseconds. Keep entrances short; this is clamped to 0–600ms. */
  duration?: number
  delay?: number
  disabled?: boolean
}
/** A one-time viewport entrance. Content remains visible without JavaScript. */
export function Motion({
  preset = "reveal",
  duration,
  delay = 0,
  disabled = false,
  className,
  children,
  ...props
}: MotionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const played = useRef(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    const element = ref.current
    if (
      !element ||
      reduced ||
      disabled ||
      played.current ||
      typeof element.animate !== "function"
    )
      return
    let animation: Animation | undefined
    let observer: IntersectionObserver | undefined
    const play = () => {
      if (
        played.current ||
        element.closest('[data-motion="none"]') ||
        element.contains(document.activeElement)
      )
        return
      const styles = getComputedStyle(element)
      const timing =
        duration ??
        (parseFloat(styles.getPropertyValue("--motion-enter")) || 280)
      const easing =
        styles.getPropertyValue("--motion-ease-enter").trim() ||
        "cubic-bezier(0.16, 1, 0.3, 1)"
      played.current = true
      animation = element.animate(
        [
          {
            opacity: 0,
            transform:
              preset === "reveal"
                ? "translateY(8px)"
                : preset === "scale"
                  ? "scale(0.98)"
                  : "none",
          },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: Math.max(0, Math.min(600, timing)),
          delay: Math.max(0, Math.min(200, delay)),
          easing,
          fill: "backwards",
        }
      )
    }
    const cancel = () => {
      played.current = true
      animation?.cancel()
      observer?.disconnect()
    }
    element.addEventListener("focusin", cancel)
    if (typeof IntersectionObserver === "undefined") play()
    else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            play()
            observer?.disconnect()
          }
        },
        { threshold: 0.08 }
      )
      observer.observe(element)
    }
    return () => {
      observer?.disconnect()
      animation?.cancel()
      element.removeEventListener("focusin", cancel)
    }
  }, [preset, duration, delay, disabled, reduced])
  return (
    <div
      ref={ref}
      data-slot="motion"
      data-motion={disabled ? "none" : preset}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  )
}
