"use client"
import { useId } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Textarea } from "@ankvale/ui/components/textarea"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import {
  useSiteSubmission,
  SubmissionFeedback,
} from "@ankvale/ui/blocks/site-shared"
export type ContactMessage = {
  name: string
  email: string
  department: string
  message: string
}
export type ContactSectionProps = SectionProps & {
  departments: { id: string; label: string }[]
  details?: { label: string; value: string; href?: string }[]
  onSend: (message: ContactMessage) => void | Promise<void>
  successMessage?: string
}
export function ContactSection({
  departments,
  details = [],
  onSend,
  successMessage = "Your message has been sent.",
  ...props
}: ContactSectionProps) {
  const id = useId()
  const submission = useSiteSubmission()
  return (
    <BlockSection {...props} data-slot="contact-section">
      <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <SectionHeading {...props} />
          <dl className="space-y-6">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt className="text-xs text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="mt-1 text-sm">
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <form
          className="space-y-5"
          onChange={() => {
            if (submission.status !== "idle" && submission.status !== "pending")
              submission.reset()
          }}
          onSubmit={async (event) => {
            event.preventDefault()
            const form = event.currentTarget
            if (!form.reportValidity()) return
            const data = new FormData(form)
            await submission.run(() =>
              onSend({
                name: String(data.get("name") ?? ""),
                email: String(data.get("email") ?? ""),
                department: String(data.get("department") ?? ""),
                message: String(data.get("message") ?? ""),
              })
            )
          }}
        >
          <fieldset
            disabled={submission.status === "pending"}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label
                htmlFor={`${id}-name`}
                className="block space-y-2 text-sm font-medium"
              >
                <span>Name</span>
                <Input
                  id={`${id}-name`}
                  name="name"
                  autoComplete="name"
                  required
                />
              </label>
              <label
                htmlFor={`${id}-email`}
                className="block space-y-2 text-sm font-medium"
              >
                <span>Email</span>
                <Input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <label
              htmlFor={`${id}-department`}
              className="block space-y-2 text-sm font-medium"
            >
              <span>Department</span>
              <select
                id={`${id}-department`}
                name="department"
                required
                className="h-10 w-full rounded-md border bg-card px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Choose a department</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label
              htmlFor={`${id}-message`}
              className="block space-y-2 text-sm font-medium"
            >
              <span>Message</span>
              <Textarea id={`${id}-message`} name="message" required rows={5} />
            </label>
            <Button type="submit" disabled={submission.status === "pending"}>
              {submission.status === "pending" ? "Sending…" : "Send message"}
            </Button>
          </fieldset>
          <SubmissionFeedback
            status={submission.status}
            success={successMessage}
            error="Your message could not be sent. Your details are still here; try again."
          />
        </form>
      </div>
    </BlockSection>
  )
}
