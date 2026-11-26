"use client"
import { useEffect, useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Result } from "@ankvale/ui/components/result"
import {
  AppSection,
  AsyncAction,
  type AppAction,
} from "@ankvale/ui/blocks/app-shared"
export function AppStatePage({
  kind,
  title,
  description,
  actions,
}: {
  kind:
    | "unauthorized"
    | "forbidden"
    | "error"
    | "offline"
    | "maintenance"
    | "unavailable"
    | "expired"
  title?: string
  description?: string
  actions?: ReactNode
}) {
  const copy = {
    unauthorized: [
      "Sign in to continue",
      "Your account is needed to access this page.",
    ],
    forbidden: [
      "Access restricted",
      "You do not have permission to view this page.",
    ],
    error: [
      "Something went wrong",
      "Try again, or contact support if the problem continues.",
    ],
    offline: ["You’re offline", "Check your connection and try again."],
    maintenance: [
      "We’ll be back soon",
      "This service is temporarily undergoing maintenance.",
    ],
    unavailable: ["Service unavailable", "Try again in a few minutes."],
    expired: [
      "Your session has expired",
      "Sign in again to continue your work.",
    ],
  }[kind]
  return (
    <section
      data-slot="app-state-page"
      className="grid min-h-[50vh] place-items-center"
    >
      <Result
        status={
          kind === "forbidden" || kind === "unauthorized"
            ? "permission"
            : kind === "error"
              ? "error"
              : "info"
        }
        title={title ?? copy[0]}
        description={description ?? copy[1]}
        actions={actions}
      />
    </section>
  )
}
export function DangerZone({
  name,
  onDelete,
  reauthentication,
}: {
  name: string
  onDelete: AppAction
  reauthentication?: ReactNode
}) {
  const [confirm, setConfirm] = useState("")
  return (
    <AppSection
      title="Delete workspace"
      description="This action permanently deletes the workspace and its contents."
      className="border-destructive/40"
    >
      {reauthentication}
      <label className="grid max-w-sm gap-2 text-sm">
        Type {name} to confirm
        <Input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
        />
      </label>
      <AsyncAction
        variant="destructive"
        disabled={confirm !== name}
        onAction={onDelete}
      >
        Delete workspace
      </AsyncAction>
    </AppSection>
  )
}
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: AppAction
  onSave?: AppAction
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Save your changes?</DialogTitle>
        <DialogDescription>
          You have unsaved changes. Choose what to keep before leaving.
        </DialogDescription>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <AsyncAction
            variant="outline"
            onAction={async () => {
              await onDiscard()
              onOpenChange(false)
            }}
          >
            Discard changes
          </AsyncAction>
          {onSave && (
            <AsyncAction
              onAction={async () => {
                await onSave()
                onOpenChange(false)
              }}
            >
              Save and leave
            </AsyncAction>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const listener = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", listener)
    return () => window.removeEventListener("beforeunload", listener)
  }, [dirty])
}
