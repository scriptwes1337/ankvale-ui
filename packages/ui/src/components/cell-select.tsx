"use client"
import {
  InlineSelect,
  type InlineSelectOption,
} from "@ankvale/ui/components/inline-select"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export function CellSelect({
  value,
  defaultValue = "",
  onValueChange,
  options,
  label = "Cell value",
  disabled,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options: InlineSelectOption[]
  label?: string
  disabled?: boolean
}) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <InlineSelect
      data-slot="cell-select"
      label={label}
      value={selected}
      options={options}
      disabled={disabled}
      onChange={(e) => setSelected(e.target.value)}
    />
  )
}
