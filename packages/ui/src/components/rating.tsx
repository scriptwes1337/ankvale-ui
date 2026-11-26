"use client"
import { useId, useState, type ReactNode } from "react"
import { StarIcon } from "@phosphor-icons/react"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type RatingProps = {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  label?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
  name?: string
  precision?: 1 | 0.5 | 0.25
  clearable?: boolean
  renderIcon?: (filled: boolean, fraction: number) => ReactNode
}
export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  label = "Rating",
  disabled,
  readOnly,
  className,
  name,
  precision = 1,
  clearable = false,
  renderIcon,
}: RatingProps) {
  const id = useId()
  const count = Math.max(1, Math.min(10, Math.floor(max)))
  const [rating, setRating] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [hover, setHover] = useState<number | null>(null)
  if (precision !== 1 || clearable || renderIcon) {
    const parts = Math.round(1 / precision)
    const display = hover ?? rating
    return (
      <fieldset
        data-slot="rating"
        disabled={disabled}
        className={cn("flex items-center gap-2", className)}
      >
        <legend className="sr-only">{label}</legend>
        <div className="flex" onPointerLeave={() => setHover(null)}>
          {Array.from({ length: count * parts }, (_, i) => {
            const candidate = (i + 1) * precision
            const filled = display >= candidate
            return (
              <label
                key={i}
                className={cn(
                  "relative cursor-pointer overflow-hidden has-focus-visible:ring-2 has-focus-visible:ring-ring",
                  filled ? "text-primary" : "text-muted-foreground"
                )}
                style={{
                  width: 20 * precision,
                  height: 24,
                  marginInlineEnd: (i + 1) % parts === 0 ? 4 : 0,
                }}
                onPointerEnter={() => {
                  if (!disabled && !readOnly) setHover(candidate)
                }}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name={name ?? id}
                  value={candidate}
                  checked={rating === candidate}
                  disabled={disabled || readOnly}
                  onChange={() => setRating(candidate)}
                  aria-label={`${candidate} stars`}
                />
                <span
                  aria-hidden="true"
                  className="absolute top-0.5"
                  style={{
                    insetInlineStart: -(i % parts) * 20 * precision,
                    width: 20,
                    height: 20,
                  }}
                >
                  {renderIcon ? (
                    renderIcon(filled, precision)
                  ) : (
                    <StarIcon
                      weight={filled ? "fill" : "regular"}
                      className="size-5"
                    />
                  )}
                </span>
              </label>
            )
          })}
        </div>
        {readOnly && (
          <span className="sr-only">
            {rating} out of {count}
          </span>
        )}
        {clearable && !readOnly && (
          <button
            type="button"
            disabled={disabled || rating === 0}
            className="rounded px-2 py-1 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setRating(0)}
          >
            Clear {label}
          </button>
        )}
      </fieldset>
    )
  }
  if (readOnly)
    return (
      <span
        data-slot="rating"
        role="img"
        aria-label={`${label}: ${rating} out of ${count}`}
        className={cn("inline-flex gap-1", className)}
      >
        {Array.from({ length: count }, (_, i) => (
          <StarIcon
            key={i}
            aria-hidden="true"
            weight={i < rating ? "fill" : "regular"}
            className={cn(
              "size-5",
              i < rating ? "text-primary" : "text-muted-foreground"
            )}
          />
        ))}
      </span>
    )
  return (
    <fieldset
      data-slot="rating"
      disabled={disabled}
      className={cn("inline-flex gap-1", className)}
    >
      <legend className="sr-only">{label}</legend>
      {Array.from({ length: count }, (_, i) => (
        <label
          key={i}
          className="cursor-pointer rounded p-1 has-focus-visible:ring-2 has-focus-visible:ring-ring has-disabled:opacity-50"
        >
          <input
            className="sr-only"
            type="radio"
            name={name ?? id}
            value={i + 1}
            checked={rating === i + 1}
            onChange={() => setRating(i + 1)}
            aria-label={`${i + 1} ${i === 0 ? "star" : "stars"}`}
          />
          <StarIcon
            aria-hidden="true"
            weight={i < rating ? "fill" : "regular"}
            className={cn(
              "size-5",
              i < rating ? "text-primary" : "text-muted-foreground"
            )}
          />
        </label>
      ))}
    </fieldset>
  )
}
