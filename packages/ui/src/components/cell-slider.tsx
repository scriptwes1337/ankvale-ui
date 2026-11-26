"use client"
import { useId } from "react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export function CellSlider({
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label = "Value",
  disabled,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
}) {
  const [number, setNumber] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const id = useId()
  return (
    <div data-slot="cell-slider" className="flex min-w-28 items-center gap-3">
      <input
        id={id}
        aria-label={label}
        type="range"
        value={number}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => setNumber(Number(e.target.value))}
        className="min-w-0 flex-1 accent-primary"
      />
      <output htmlFor={id} className="w-8 text-end text-xs tabular-nums">
        {number}
      </output>
    </div>
  )
}
