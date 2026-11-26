"use client"
import { useState, type ReactNode } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@ankvale/ui/components/popover"
import { Button } from "@ankvale/ui/components/button"
export function Popconfirm({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  disabled = false,
}: {
  trigger: ReactNode
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next)
          setError(false)
        }
      }}
    >
      <PopoverTrigger disabled={disabled}>{trigger}</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>{title}</PopoverTitle>
        {description && <PopoverDescription>{description}</PopoverDescription>}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            Could not complete the action. Try again.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={async () => {
              if (pending) return
              setPending(true)
              setError(false)
              try {
                await onConfirm()
                setOpen(false)
              } catch {
                setError(true)
              } finally {
                setPending(false)
              }
            }}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
