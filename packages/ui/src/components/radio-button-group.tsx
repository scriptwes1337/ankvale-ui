"use client"
import { useId } from "react"
import type { CheckboxButtonOption } from "@ankvale/ui/components/checkbox-button-group"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export function RadioButtonGroup({
  options,
  value,
  defaultValue = "",
  onValueChange,
  label,
  disabled,
  className,
  name,
}: {
  options: CheckboxButtonOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label: string
  disabled?: boolean
  className?: string
  name?: string
}) {
  const id = useId()
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <fieldset
      data-slot="radio-button-group"
      disabled={disabled}
      className={cn("grid gap-2", className)}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-focus-visible:ring-2 has-focus-visible:ring-ring has-disabled:opacity-50",
            selected === option.value && "border-primary bg-accent"
          )}
        >
          <input
            className="mt-0.5 accent-primary"
            type="radio"
            name={name ?? id}
            value={option.value}
            checked={selected === option.value}
            disabled={option.disabled}
            onChange={() => setSelected(option.value)}
          />
          <span>
            <span className="block text-sm font-medium">{option.label}</span>
            {option.description && (
              <span className="mt-1 block text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
