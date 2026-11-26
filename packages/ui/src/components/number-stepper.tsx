"use client"

import { useId, useState, type ComponentProps } from "react"
import { MinusIcon, PlusIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"

export type NumberStepperProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readOnly?: boolean
  label?: string
  name?: string
}
export function NumberStepper({
  value,
  defaultValue = 0,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled,
  readOnly,
  label = "Quantity",
  name,
  className,
  ...props
}: NumberStepperProps) {
  const id = useId()
  const [number, setNumber] = useControllableState({
    value,
    defaultValue: Math.min(
      max,
      Math.max(min, Number.isFinite(defaultValue) ? defaultValue : 0)
    ),
    onChange: onValueChange,
  })
  const [draft, setDraft] = useState<string | null>(null)
  const increment = Number.isFinite(step) && step > 0 ? step : 1
  function update(next: number) {
    if (!Number.isFinite(next) || readOnly || disabled) return
    setNumber(Math.min(max, Math.max(min, Number(next.toFixed(10)))))
  }
  return (
    <div
      data-slot="number-stepper"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border p-1",
        className
      )}
      {...props}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Decrease ${label}`}
        disabled={disabled || readOnly || number <= min}
        onClick={() => update(number - increment)}
      >
        <MinusIcon />
      </Button>
      <Input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        value={draft ?? number}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={increment}
        disabled={disabled}
        readOnly={readOnly}
        className="h-8 w-20 [appearance:textfield] border-0 text-center shadow-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        onBlur={() => setDraft(null)}
        onChange={(e) => {
          if (e.target.value === "") {
            setDraft("")
            return
          }
          setDraft(null)
          update(Number(e.target.value))
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Increase ${label}`}
        disabled={disabled || readOnly || number >= max}
        onClick={() => update(number + increment)}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
