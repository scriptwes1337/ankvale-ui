"use client"
import { useEffect, useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import { Button } from "@ankvale/ui/components/button"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type TourStep = {
  id: string
  title: string
  description: ReactNode
  target?: () => HTMLElement | null
}
export type TourProps = {
  steps: TourStep[]
  open: boolean
  onOpenChange: (open: boolean) => void
  step?: number
  defaultStep?: number
  onStepChange?: (index: number) => void
  onComplete?: () => void
}
/** Controlled step supports saving/resuming progress. Missing targets fall back to a centered dialog. */
export function Tour({
  steps,
  open,
  onOpenChange,
  step,
  defaultStep = 0,
  onStepChange,
  onComplete,
}: TourProps) {
  const [index, setIndex] = useControllableState({
    value: step,
    defaultValue: defaultStep,
    onChange: onStepChange,
  })
  const activeIndex = Math.max(0, Math.min(index, steps.length - 1))
  const current = steps[activeIndex]
  const [position, setPosition] = useState<{
    left: number
    top: number
    width: number
  } | null>(null)
  useEffect(() => {
    if (!open || !current) return
    const target = current.target?.()
    function measure() {
      if (!target) {
        setPosition(null)
        return
      }
      const rect = target.getBoundingClientRect()
      const width = Math.min(340, window.innerWidth - 32)
      setPosition({
        width,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)),
        top: Math.max(16, Math.min(rect.bottom + 12, window.innerHeight - 300)),
      })
    }
    target?.scrollIntoView({ block: "center", behavior: "instant" })
    const oldOutline = target?.style.outline
    const oldOffset = target?.style.outlineOffset
    if (target) {
      target.style.outline = "2px solid var(--primary)"
      target.style.outlineOffset = "4px"
    }
    measure()
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
      if (target) {
        target.style.outline = oldOutline ?? ""
        target.style.outlineOffset = oldOffset ?? ""
      }
    }
  }, [current, open])
  if (!current) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-auto"
        style={
          position
            ? {
                width: position.width,
                top: position.top,
                insetInlineStart: position.left,
                translate: "none",
              }
            : undefined
        }
      >
        <p className="text-xs text-muted-foreground">
          {activeIndex + 1} of {steps.length}
        </p>
        <DialogTitle>{current.title}</DialogTitle>
        <DialogDescription>{current.description}</DialogDescription>
        <div className="flex flex-wrap justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Skip tour
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={activeIndex === 0}
              onClick={() => setIndex(activeIndex - 1)}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (activeIndex === steps.length - 1) {
                  onOpenChange(false)
                  onComplete?.()
                } else setIndex(activeIndex + 1)
              }}
            >
              {activeIndex === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
