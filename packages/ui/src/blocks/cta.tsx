"use client"

import { useState, useId, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Label } from "@ankvale/ui/components/label"
import { cn } from "@ankvale/ui/lib/utils"
import {
  BlockSection,
  SectionHeading,
  surface,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"

export function CtaBanner(props: SectionProps) {
  return (
    <BlockSection {...props} data-slot="cta-banner">
      <div
        className={cn(
          "rounded-3xl border px-7 py-12 text-center sm:px-12",
          surface()
        )}
      >
        <SectionHeading
          {...props}
          className="mx-auto mb-0 [&_[data-slot=section-actions]]:justify-center"
        />
      </div>
    </BlockSection>
  )
}
export function CtaSplit({
  visual,
  ...props
}: SectionProps & { visual: ReactNode }) {
  return (
    <BlockSection {...props} data-slot="cta-split">
      <div
        className={cn(
          "grid overflow-hidden rounded-3xl border md:grid-cols-2",
          surface()
        )}
      >
        <div className="flex items-center p-7 sm:p-10">
          <SectionHeading {...props} className="mb-0" />
        </div>
        <div className="flex min-h-72 items-center justify-center overflow-hidden bg-muted/50 p-8">
          {visual}
        </div>
      </div>
    </BlockSection>
  )
}
export function CtaNewsletter({
  onSubscribe,
  buttonLabel = "Subscribe",
  privacyNote = "Only the occasional good thing. Unsubscribe whenever you like.",
  ...props
}: SectionProps & {
  onSubscribe?: (email: string) => Promise<void> | void
  buttonLabel?: string
  privacyNote?: string
}) {
  const id = useId()
  const [email, setEmail] = useState("")
  const [state, setState] = useState<
    "idle" | "pending" | "success" | "preview" | "error"
  >("idle")
  return (
    <BlockSection {...props} data-slot="cta-newsletter">
      <div
        className={cn(
          "grid items-center gap-8 rounded-3xl border p-7 sm:p-10 md:grid-cols-2",
          surface()
        )}
      >
        <SectionHeading {...props} className="mb-0" />
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            if (!onSubscribe) {
              setState("preview")
              return
            }
            setState("pending")
            try {
              await onSubscribe(email)
              setState("success")
              setEmail("")
            } catch {
              setState("error")
            }
          }}
        >
          <Label htmlFor={id}>Email address</Label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              id={id}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              disabled={state === "pending"}
              onChange={(event) => {
                setEmail(event.target.value)
                setState("idle")
              }}
            />
            <Button type="submit" disabled={state === "pending"}>
              {state === "pending" ? "Subscribing…" : buttonLabel}
            </Button>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            {privacyNote}
          </p>
          <p role="status" className="mt-2 text-sm">
            {state === "success"
              ? "You're on the list."
              : state === "preview"
                ? "Preview only. No email was submitted."
                : state === "error"
                  ? "Could not subscribe. Please try again."
                  : ""}
          </p>
        </form>
      </div>
    </BlockSection>
  )
}
