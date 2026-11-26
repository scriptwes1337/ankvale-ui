"use client"
import { Switch } from "@ankvale/ui/components/switch"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export function CellSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label = "Enabled",
  disabled,
}: {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (value: boolean) => void
  label?: string
  disabled?: boolean
}) {
  const [active, setActive] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  return (
    <Switch
      data-slot="cell-switch"
      aria-label={label}
      checked={active}
      onCheckedChange={setActive}
      disabled={disabled}
    />
  )
}
