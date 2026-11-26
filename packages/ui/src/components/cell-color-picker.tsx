"use client"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export function CellColorPicker({
  value,
  defaultValue = "#0d6efd",
  onValueChange,
  label = "Color",
  disabled,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (color: string) => void
  label?: string
  disabled?: boolean
}) {
  const [color, setColor] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <label
      data-slot="cell-color-picker"
      className="inline-flex items-center gap-2 rounded-md border px-2 py-1"
    >
      <input
        type="color"
        aria-label={label}
        value={color}
        disabled={disabled}
        onChange={(e) => setColor(e.target.value)}
        className="size-6 cursor-pointer border-0 bg-transparent p-0 disabled:opacity-50"
      />
      <span className="font-mono text-xs">{color.toUpperCase()}</span>
    </label>
  )
}
