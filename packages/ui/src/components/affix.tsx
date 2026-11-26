"use client"
import type { ComponentProps } from "react"
import { Button } from "@ankvale/ui/components/button"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import { cn } from "@ankvale/ui/lib/utils"
/** CSS sticky is bounded by its containing block. Its ancestors must permit scrolling. */
export function Affix({
  offset = 16,
  className,
  style,
  ...props
}: ComponentProps<"div"> & { offset?: number }) {
  return (
    <div
      data-slot="affix"
      className={cn("sticky z-20", className)}
      style={{ top: offset, ...style }}
      {...props}
    />
  )
}
export function BackToTop({
  targetId,
  label = "Back to top",
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  targetId: string
  label?: string
}) {
  const reduced = useReducedMotion()
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      onClick={() => {
        const element = document.getElementById(targetId)
        if (!element) return
        element.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        })
        const original = element.getAttribute("tabindex")
        if (original === null) {
          element.setAttribute("tabindex", "-1")
          element.addEventListener(
            "blur",
            () => element.removeAttribute("tabindex"),
            { once: true }
          )
        }
        element.focus({ preventScroll: true })
      }}
    >
      {label} <span aria-hidden="true">↑</span>
    </Button>
  )
}
