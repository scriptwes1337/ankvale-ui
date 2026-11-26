"use client"
import { useId, type ReactNode } from "react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type SegmentOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}
export type SegmentProps = {
  options: SegmentOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label: string
  disabled?: boolean
  className?: string
  name?: string
}
export function Segment({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  disabled,
  className,
  name,
}: SegmentProps) {
  const id = useId()
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? options.find((o) => !o.disabled)?.value ?? "",
    onChange: onValueChange,
  })
  return (
    <fieldset
      data-slot="segment"
      disabled={disabled}
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-lg border bg-secondary p-1",
        className
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
            selected === option.value && "bg-card font-medium shadow-xs",
            (disabled || option.disabled) && "pointer-events-none opacity-50"
          )}
        >
          <input
            className="sr-only"
            type="radio"
            name={name ?? id}
            value={option.value}
            checked={selected === option.value}
            disabled={option.disabled}
            onChange={() => setSelected(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
