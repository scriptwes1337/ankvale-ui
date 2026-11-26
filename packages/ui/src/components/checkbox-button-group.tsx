"use client"
import type { ReactNode } from "react"
import { CheckIcon } from "@phosphor-icons/react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type CheckboxButtonOption = {
  value: string
  label: ReactNode
  description?: string
  disabled?: boolean
}
export function CheckboxButtonGroup({
  options,
  value,
  defaultValue = [],
  onValueChange,
  label,
  disabled,
  className,
  name,
}: {
  options: CheckboxButtonOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (values: string[]) => void
  label: string
  disabled?: boolean
  className?: string
  name?: string
}) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <fieldset
      data-slot="checkbox-button-group"
      disabled={disabled}
      className={cn("grid gap-2 sm:grid-cols-2", className)}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-focus-visible:ring-2 has-focus-visible:ring-ring has-disabled:cursor-default has-disabled:opacity-50",
            selected.includes(option.value) && "border-primary bg-accent"
          )}
        >
          <input
            className="sr-only"
            type="checkbox"
            name={name}
            value={option.value}
            checked={selected.includes(option.value)}
            disabled={option.disabled}
            onChange={(e) =>
              setSelected(
                e.target.checked
                  ? [...selected, option.value]
                  : selected.filter((v) => v !== option.value)
              )
            }
          />
          <span
            className={cn(
              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
              selected.includes(option.value) &&
                "border-primary bg-primary text-primary-foreground"
            )}
            aria-hidden="true"
          >
            {selected.includes(option.value) && (
              <CheckIcon className="size-3" />
            )}
          </span>
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
