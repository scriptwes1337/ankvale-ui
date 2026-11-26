"use client"
import { useRef, useState, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"
export type SiteRecord = {
  id: string
  title: string
  description?: string
  href?: string
  category?: string
}
export function useSiteSubmission() {
  const busy = useRef(false)
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle")
  return {
    status,
    reset: () => setStatus("idle"),
    run: async (action: () => void | Promise<void>) => {
      if (busy.current) return false
      busy.current = true
      setStatus("pending")
      try {
        await action()
        setStatus("success")
        return true
      } catch {
        setStatus("error")
        return false
      } finally {
        busy.current = false
      }
    },
  }
}
export function SubmissionFeedback({
  status,
  success = "Saved.",
  error = "Could not save. Try again.",
}: {
  status: "idle" | "pending" | "success" | "error"
  success?: string
  error?: string
}) {
  return status === "error" ? (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  ) : status === "success" ? (
    <p role="status" className="text-sm text-muted-foreground">
      {success}
    </p>
  ) : status === "pending" ? (
    <p role="status" className="text-sm text-muted-foreground">
      Saving…
    </p>
  ) : null
}
export function SiteEmpty({
  children = "No results.",
}: {
  children?: ReactNode
}) {
  return (
    <p
      role="status"
      className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground"
    >
      {children}
    </p>
  )
}
export function SiteFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border bg-card px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}
export function SiteBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

export type SiteCollectionStatus = {
  loading?: boolean
  error?: string
  onRetry?: () => void
}
export function SiteCollectionState({
  loading,
  error,
  onRetry,
}: SiteCollectionStatus) {
  return error ? (
    <div
      role="alert"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
    >
      <p>{error}</p>
      {onRetry && (
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  ) : loading ? (
    <p role="status" className="mb-6 text-sm text-muted-foreground">
      Loading…
    </p>
  ) : null
}
