"use client"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type ModelOption = {
  id: string
  name: string
  provider?: string
  disabled?: boolean
}
export function ModelSelector({
  models,
  value,
  defaultValue,
  onValueChange,
  disabled,
  label = "Model",
}: {
  models: ModelOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  disabled?: boolean
  label?: string
}) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue:
      defaultValue ?? models.find((model) => !model.disabled)?.id ?? "",
    onChange: onValueChange,
  })
  const providers = [
    ...new Set(models.map((model) => model.provider ?? "Models")),
  ]
  return (
    <select
      data-slot="model-selector"
      aria-label={label}
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      disabled={disabled}
      className="h-8 max-w-full rounded-md border bg-card px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      {providers.map((provider) => (
        <optgroup key={provider} label={provider}>
          {models
            .filter((model) => (model.provider ?? "Models") === provider)
            .map((model) => (
              <option key={model.id} value={model.id} disabled={model.disabled}>
                {model.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}
