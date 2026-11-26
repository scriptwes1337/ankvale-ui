"use client"
import { useId, useState, type ComponentProps } from "react"
import {
  EyeIcon,
  EyeSlashIcon,
  XIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type TextFieldProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size"
> & {
  label: string
  description?: string
  error?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  clearable?: boolean
  counter?: boolean
}
export function TextField({
  label,
  description,
  error,
  value,
  defaultValue = "",
  onValueChange,
  clearable = false,
  counter = false,
  className,
  id,
  type = "text",
  disabled,
  readOnly,
  ...props
}: TextFieldProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const [current, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [revealed, setRevealed] = useState(false)
  return (
    <div data-slot="text-field" className={cn("space-y-2", className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative flex items-center gap-1 rounded-md border bg-card focus-within:ring-2 focus-within:ring-ring">
        {type === "search" && (
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="ms-3 size-4 shrink-0 text-muted-foreground"
          />
        )}
        <Input
          {...props}
          id={fieldId}
          type={type === "password" && revealed ? "text" : type}
          value={current}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => set(e.target.value)}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={
            [
              description ? `${fieldId}-help` : null,
              error ? `${fieldId}-error` : null,
              counter ? `${fieldId}-count` : null,
              props["aria-describedby"],
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        {type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`${revealed ? "Hide" : "Show"} ${label}`}
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? (
              <EyeSlashIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )}
          </Button>
        )}
        {clearable && current && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={`Clear ${label}`}
            onClick={() => {
              set("")
              document.getElementById(fieldId)?.focus()
            }}
          >
            <XIcon aria-hidden="true" />
          </Button>
        )}
      </div>
      {description && (
        <p id={`${fieldId}-help`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {counter && (
        <p
          id={`${fieldId}-count`}
          className="text-end text-xs text-muted-foreground tabular-nums"
        >
          {current.length}
          {props.maxLength ? ` / ${props.maxLength}` : ""}
        </p>
      )}
      {error && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}
export function PasswordField(props: Omit<TextFieldProps, "type">) {
  return <TextField {...props} type="password" />
}
export function SearchField(props: Omit<TextFieldProps, "type">) {
  return <TextField clearable {...props} type="search" />
}
