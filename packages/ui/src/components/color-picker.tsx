"use client"
import { useState } from "react"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { Button } from "@ankvale/ui/components/button"
export function normalizeHex(value: string) {
  const raw = value.trim().replace(/^#/, "")
  if (/^[a-f\d]{3}$/i.test(raw))
    return (
      "#" +
      raw
        .split("")
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    )
  if (/^[a-f\d]{6}(?:[a-f\d]{2})?$/i.test(raw)) return "#" + raw.toLowerCase()
  return undefined
}
export function parseColor(value: string) {
  const hex = normalizeHex(value)
  if (hex) return hex
  const rgb = value
    .trim()
    .match(
      /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i
    )
  if (rgb) {
    const channels = rgb.slice(1, 4).map(Number),
      opacity = rgb[4] === undefined ? 1 : Number(rgb[4])
    if (
      channels.some((c) => !Number.isFinite(c) || c < 0 || c > 255) ||
      opacity < 0 ||
      opacity > 1
    )
      return undefined
    return (
      "#" +
      channels
        .map((c) => Math.round(c).toString(16).padStart(2, "0"))
        .join("") +
      (opacity < 1
        ? Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")
        : "")
    )
  }
  const hsl = value
    .trim()
    .match(
      /^hsla?\(\s*([+-]?[\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i
    )
  if (hsl) {
    const hue = ((Number(hsl[1]) % 360) + 360) % 360,
      saturation = Number(hsl[2]) / 100,
      lightness = Number(hsl[3]) / 100,
      opacity = hsl[4] === undefined ? 1 : Number(hsl[4])
    if (
      ![hue, saturation, lightness, opacity].every(Number.isFinite) ||
      saturation < 0 ||
      saturation > 1 ||
      lightness < 0 ||
      lightness > 1 ||
      opacity < 0 ||
      opacity > 1
    )
      return undefined
    const a = saturation * Math.min(lightness, 1 - lightness)
    const channel = (n: number) => {
      const k = (n + hue / 30) % 12
      return Math.round(
        255 * (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
      )
    }
    return (
      "#" +
      [channel(0), channel(8), channel(4)]
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("") +
      (opacity < 1
        ? Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")
        : "")
    )
  }
  return undefined
}
export function formatColor(hex: string, format: "hex" | "rgb" | "hsl") {
  if (format === "hex") return hex
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255
  )
  const opacity = hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1
  if (format === "rgb")
    return opacity < 1
      ? `rgba(${Math.round(r! * 255)}, ${Math.round(g! * 255)}, ${Math.round(b! * 255)}, ${Number(opacity.toFixed(3))})`
      : `rgb(${Math.round(r! * 255)}, ${Math.round(g! * 255)}, ${Math.round(b! * 255)})`
  const max = Math.max(r!, g!, b!),
    min = Math.min(r!, g!, b!),
    delta = max - min,
    l = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  let hue = 0
  if (delta)
    hue =
      max === r
        ? ((g! - b!) / delta) % 6
        : max === g
          ? (b! - r!) / delta + 2
          : (r! - g!) / delta + 4
  hue = (hue * 60 + 360) % 360
  return opacity < 1
    ? `hsla(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(l * 100)}%, ${Number(opacity.toFixed(3))})`
    : `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(l * 100)}%)`
}
export function ColorPicker({
  label,
  value,
  defaultValue = "#0d6efd",
  onValueChange,
  presets = ["#0d6efd", "#191919", "#ffffff", "#16a34a", "#dc2626"],
  alpha = true,
  disabled = false,
  name,
}: {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  presets?: string[]
  alpha?: boolean
  disabled?: boolean
  name?: string
}) {
  const [color, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex")
  const normalized = normalizeHex(color) ?? "#0d6efd"
  const opacity =
    normalized.length === 9 ? parseInt(normalized.slice(7), 16) / 255 : 1
  const rgb = [1, 3, 5].map((i) => parseInt(normalized.slice(i, i + 2), 16))
  function change(next: string) {
    set(next)
    setDraft(null)
    setError(false)
  }
  return (
    <fieldset
      data-slot="color-picker"
      disabled={disabled}
      className="space-y-3"
    >
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={`${label} color`}
          disabled={disabled}
          value={normalized.slice(0, 7)}
          onChange={(e) =>
            change(
              e.target.value + (alpha && opacity < 1 ? normalized.slice(7) : "")
            )
          }
          className="h-9 w-12 rounded border bg-card p-1"
        />
        <Input
          aria-label={`${label} ${format}`}
          value={draft ?? formatColor(normalized, format)}
          disabled={disabled}
          aria-invalid={error}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft === null) return
            const next = parseColor(draft)
            if (!next || (!alpha && next.length === 9)) {
              setError(true)
              return
            }
            change(next)
          }}
        />
      </div>
      <label className="flex items-center gap-2 text-xs">
        Format
        <select
          aria-label={`${label} format`}
          className="rounded border bg-card px-2 py-1"
          value={format}
          onChange={(e) => {
            setDraft(null)
            setFormat(e.target.value as "hex" | "rgb" | "hsl")
            setError(false)
          }}
        >
          <option value="hex">Hex</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Use ${preset}`}
            aria-pressed={normalizeHex(preset) === normalized}
            onClick={() => change(preset)}
          >
            <span
              className="size-4 rounded-sm border"
              style={{ backgroundColor: preset }}
            />
          </Button>
        ))}
      </div>
      {alpha && (
        <label className="grid gap-1 text-xs">
          Opacity {Math.round(opacity * 100)}%
          <input
            type="range"
            min="0"
            max="100"
            value={opacity * 100}
            disabled={disabled}
            onChange={(e) =>
              change(
                normalized.slice(0, 7) +
                  Math.round((Number(e.target.value) / 100) * 255)
                    .toString(16)
                    .padStart(2, "0")
              )
            }
            className="accent-primary"
          />
        </label>
      )}
      <p className="font-mono text-xs text-muted-foreground">
        rgb({rgb.join(", ")}){alpha ? ` / ${Math.round(opacity * 100)}%` : ""}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Use a valid hex, RGB or HSL color
          {alpha ? ", optionally with alpha" : ""}.
        </p>
      )}
      {name && <input type="hidden" name={name} value={normalized} />}
    </fieldset>
  )
}
