"use client"
import { useId, useMemo, useState } from "react"
import { useAnkvaleDefaults } from "@ankvale/ui/lib/ankvale-config"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export function parseLocalizedNumber(text: string, locale = "en-US") {
  const formatter = new Intl.NumberFormat(locale)
  const parts = formatter.formatToParts(12345.6)
  const group = parts.find((p) => p.type === "group")?.value ?? ","
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? "."
  let normalized = text
    .trim()
    .replaceAll(group, "")
    .replaceAll(decimal, ".")
    .replace(/\s|\u00a0/g, "")
  for (let i = 0; i < 10; i++)
    normalized = normalized.replaceAll(
      new Intl.NumberFormat(locale, { useGrouping: false }).format(i),
      String(i)
    )
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined
  const result = Number(normalized)
  return Number.isFinite(result) ? result : undefined
}
export function NumberField({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  locale: requestedLocale,
  formatOptions,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  readOnly = false,
  name,
}: {
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readOnly?: boolean
  name?: string
}) {
  const defaults = useAnkvaleDefaults()
  const locale = requestedLocale ?? defaults.locale
  const id = useId()
  const [number, set] = useControllableState({
    value,
    defaultValue: Math.min(
      max,
      Math.max(min, Number.isFinite(defaultValue) ? defaultValue : 0)
    ),
    onChange: onValueChange,
  })
  const [draft, setDraft] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)
  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, formatOptions),
    [locale, formatOptions]
  )
  function update(next: number) {
    if (!disabled && !readOnly && Number.isFinite(next)) {
      set(Math.min(max, Math.max(min, Number(next.toFixed(12)))))
      setInvalid(false)
    }
  }
  return (
    <div data-slot="number-field" className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Decrease ${label}`}
          disabled={disabled || readOnly || number <= min}
          onClick={() => update(number - step)}
        >
          −
        </Button>
        <Input
          role="spinbutton"
          aria-valuenow={number}
          aria-valuemin={Number.isFinite(min) ? min : undefined}
          aria-valuemax={Number.isFinite(max) ? max : undefined}
          id={id}
          inputMode="decimal"
          value={draft ?? formatter.format(number)}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onFocus={() =>
            setDraft(
              new Intl.NumberFormat(locale, {
                useGrouping: false,
                maximumFractionDigits: 12,
              }).format(number)
            )
          }
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft === null) return
            const parsed = parseLocalizedNumber(draft, locale)
            if (parsed === undefined) {
              setInvalid(true)
              return
            }
            update(parsed)
            setDraft(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur()
            if (e.key === "Escape") {
              setDraft(null)
              setInvalid(false)
            }
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault()
              setDraft(null)
              update(number + (e.key === "ArrowUp" ? step : -step))
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Increase ${label}`}
          disabled={disabled || readOnly || number >= max}
          onClick={() => update(number + step)}
        >
          +
        </Button>
      </div>
      {name && <input type="hidden" name={name} value={number} />}
      {invalid && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          Enter a valid number.
        </p>
      )}
    </div>
  )
}
