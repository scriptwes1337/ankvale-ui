"use client"
import { useId } from "react"
import { Image } from "@ankvale/ui/components/image"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export function ImageCompare({
  before,
  after,
  label,
  value,
  defaultValue = 50,
  onValueChange,
  disabled = false,
}: {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  disabled?: boolean
}) {
  const id = useId()
  const [position, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const percent = Math.min(100, Math.max(0, position))
  return (
    <figure data-slot="image-compare" className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border">
        <Image {...after} className="absolute inset-0 size-full" />
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          <Image {...before} className="size-full" />
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-background ring-1 ring-foreground/30"
          style={{ left: `${percent}%` }}
        />
        <span className="absolute start-3 top-3 rounded bg-background px-2 py-1 text-xs">
          Before
        </span>
        <span className="absolute end-3 top-3 rounded bg-background px-2 py-1 text-xs">
          After
        </span>
      </div>
      <figcaption>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={percent}
          disabled={disabled}
          aria-valuetext={`${percent}% before image`}
          onChange={(e) => set(Number(e.target.value))}
          className="mt-2 block w-full accent-primary"
        />
      </figcaption>
    </figure>
  )
}
