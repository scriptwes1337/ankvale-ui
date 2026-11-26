"use client"
import { type ReactNode } from "react"
import { CheckIcon } from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export type StepperStep = {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
  error?: boolean
}
export type StepperProps = {
  steps: StepperStep[]
  value: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  label?: string
  className?: string
}
export function Stepper({
  steps,
  value,
  onValueChange,
  orientation = "horizontal",
  label = "Progress",
  className,
}: StepperProps) {
  const current = steps.findIndex((step) => step.id === value)
  return (
    <ol
      data-slot="stepper"
      aria-label={label}
      className={cn(
        "flex gap-4",
        orientation === "vertical" ? "flex-col" : "flex-wrap",
        className
      )}
    >
      {steps.map((step, i) => (
        <li
          key={step.id}
          className={cn(
            "flex min-w-0 gap-3",
            orientation === "horizontal" && "flex-1"
          )}
          aria-current={step.id === value ? "step" : undefined}
        >
          <button
            type="button"
            disabled={!onValueChange || step.disabled}
            onClick={() => onValueChange?.(step.id)}
            className="flex min-w-0 items-start gap-3 rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
            aria-label={`${step.title}${step.error ? ", error" : ""}`}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                i <= current &&
                  "border-primary bg-primary text-primary-foreground",
                step.error && "border-destructive bg-destructive text-white"
              )}
              aria-hidden="true"
            >
              {i < current ? (
                <CheckIcon className="size-4" />
              ) : (
                (step.icon ?? i + 1)
              )}
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-sm font-medium">{step.title}</span>
              {step.description && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {step.description}
                </span>
              )}
            </span>
          </button>
          {i < steps.length - 1 && orientation === "horizontal" && (
            <span
              className="mt-3.5 h-px min-w-3 flex-1 bg-border"
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  )
}
