"use client"
import {
  useId,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Textarea } from "@ankvale/ui/components/textarea"
import { cn } from "@ankvale/ui/lib/utils"
export type AppAction = () => void | Promise<void>
export function AsyncFileInput({
  label,
  accept,
  multiple = false,
  onFiles,
}: {
  label: string
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void | Promise<void>
}) {
  const id = useId()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={pending}
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? [])
          if (!files.length) return
          setPending(true)
          setError(false)
          try {
            await onFiles(files)
          } catch {
            setError(true)
          } finally {
            setPending(false)
          }
        }}
      />
      {pending && (
        <p role="status" className="text-xs text-muted-foreground">
          Uploading…
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          Could not upload. Select the files to try again.
        </p>
      )}
    </div>
  )
}
export function AppSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "w-full min-w-0 space-y-6 rounded-lg border bg-card p-5 text-card-foreground sm:p-7",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <div className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
export function AsyncAction({
  onAction,
  children,
  pendingLabel = "Working…",
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  onAction: AppAction
  pendingLabel?: string
}) {
  const [state, setState] = useState<"idle" | "pending" | "error">("idle")
  const busy = useRef(false)
  return (
    <span className="inline-flex flex-col items-start gap-2">
      <Button
        type="button"
        {...props}
        disabled={props.disabled || state === "pending"}
        onClick={async () => {
          if (busy.current) return
          busy.current = true
          setState("pending")
          try {
            await onAction()
            setState("idle")
          } catch {
            setState("error")
          } finally {
            busy.current = false
          }
        }}
      >
        {state === "pending" ? pendingLabel : children}
      </Button>
      {state === "error" && (
        <span role="alert" className="text-xs text-destructive">
          Could not complete the action. Try again.
        </span>
      )}
    </span>
  )
}
export type AppFormField = {
  name: string
  label: string
  type?:
    | "text"
    | "email"
    | "password"
    | "url"
    | "tel"
    | "number"
    | "textarea"
    | "select"
  required?: boolean
  minLength?: number
  options?: { value: string; label: string }[]
  autoComplete?: string
  description?: string
}
export type AppFormValues = Record<string, string>
export function AppForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Save changes",
  successMessage = "Changes saved.",
  children,
  onValuesChange,
}: {
  fields: AppFormField[]
  initialValues?: AppFormValues
  onSubmit: (values: AppFormValues) => void | Promise<void>
  submitLabel?: string
  successMessage?: string
  children?: ReactNode
  onValuesChange?: (values: AppFormValues) => void
}) {
  const id = useId()
  const [values, setValues] = useState(initialValues)
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">(
    "idle"
  )
  const busy = useRef(false)
  function change(name: string, value: string) {
    const next = { ...values, [name]: value }
    setValues(next)
    setState("idle")
    onValuesChange?.(next)
  }
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (busy.current || !e.currentTarget.reportValidity()) return
        busy.current = true
        setState("pending")
        try {
          await onSubmit(values)
          setState("success")
        } catch {
          setState("error")
        } finally {
          busy.current = false
        }
      }}
    >
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label
            htmlFor={`${id}-${field.name}`}
            className="block text-sm font-medium"
          >
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <Textarea
              id={`${id}-${field.name}`}
              aria-describedby={
                field.description
                  ? `${id}-${field.name}-description`
                  : undefined
              }
              name={field.name}
              required={field.required}
              disabled={state === "pending"}
              minLength={field.minLength}
              value={values[field.name] ?? ""}
              onChange={(e) => change(field.name, e.target.value)}
            />
          ) : field.type === "select" ? (
            <select
              id={`${id}-${field.name}`}
              aria-describedby={
                field.description
                  ? `${id}-${field.name}-description`
                  : undefined
              }
              name={field.name}
              required={field.required}
              disabled={state === "pending"}
              value={values[field.name] ?? ""}
              onChange={(e) => change(field.name, e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Choose…</option>
              {field.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={`${id}-${field.name}`}
              aria-describedby={
                field.description
                  ? `${id}-${field.name}-description`
                  : undefined
              }
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              minLength={field.minLength}
              autoComplete={field.autoComplete}
              disabled={state === "pending"}
              value={values[field.name] ?? ""}
              onChange={(e) => change(field.name, e.target.value)}
            />
          )}
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      ))}
      {children}
      <Button type="submit" disabled={state === "pending"}>
        {state === "pending" ? "Saving…" : submitLabel}
      </Button>
      {state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Could not save. Your entries have been kept. Try again.
        </p>
      )}
      {state === "success" && successMessage && (
        <p role="status" className="text-sm text-muted-foreground">
          {successMessage}
        </p>
      )}
    </form>
  )
}
export function AppCollectionState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean
  error?: string
  empty?: boolean
  onRetry?: AppAction
}) {
  if (loading)
    return (
      <p role="status" className="py-8 text-sm text-muted-foreground">
        Loading…
      </p>
    )
  if (error)
    return (
      <div role="alert" className="space-y-3 py-6 text-sm text-destructive">
        <p>{error}</p>
        {onRetry && (
          <AsyncAction variant="outline" onAction={onRetry}>
            Retry
          </AsyncAction>
        )}
      </div>
    )
  if (empty)
    return (
      <p className="py-8 text-sm text-muted-foreground">No items to show.</p>
    )
  return null
}
