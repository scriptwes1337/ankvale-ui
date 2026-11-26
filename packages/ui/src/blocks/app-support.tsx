"use client"
import { useState, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { DropZone } from "@ankvale/ui/components/drop-zone"
import { Progress } from "@ankvale/ui/components/progress"
import {
  AppSection,
  AppForm,
  AsyncAction,
} from "@ankvale/ui/blocks/app-shared"
export type BookingSlot = {
  id: string
  date: string
  label: string
  available: boolean
}
export type BookingReceipt = { id: string; timeLabel: string; message?: string }
export function BookingFlow({
  slots,
  timeZone,
  onBook,
  onCancel,
  onReschedule,
  existingBooking,
}: {
  slots: BookingSlot[]
  timeZone: string
  onBook: (details: {
    slotId: string
    name: string
    email: string
    notes: string
  }) => Promise<BookingReceipt>
  onCancel?: (id: string) => void | Promise<void>
  onReschedule?: (id: string, slotId: string) => Promise<BookingReceipt>
  existingBooking?: BookingReceipt
}) {
  const [date, setDate] = useState("")
  const [selected, setSelected] = useState("")
  const [receipt, setReceipt] = useState<BookingReceipt | undefined>(
    existingBooking
  )
  const [rescheduling, setRescheduling] = useState(false)
  const dates = [...new Set(slots.map((s) => s.date))].sort()
  return (
    <AppSection
      title={
        receipt && !rescheduling
          ? "Your booking"
          : rescheduling
            ? "Reschedule booking"
            : "Book a time"
      }
      description={`Time zone: ${timeZone}`}
    >
      {receipt && !rescheduling ? (
        <div className="space-y-4">
          <p className="text-lg font-medium">{receipt.timeLabel}</p>
          <p className="text-sm text-muted-foreground">
            {receipt.message ?? `Booking reference: ${receipt.id}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {onReschedule && (
              <Button variant="outline" onClick={() => setRescheduling(true)}>
                Reschedule
              </Button>
            )}
            {onCancel && (
              <AsyncAction
                variant="outline"
                onAction={async () => {
                  await onCancel(receipt.id)
                  setReceipt(undefined)
                  setSelected("")
                }}
              >
                Cancel booking
              </AsyncAction>
            )}
          </div>
        </div>
      ) : (
        <>
          <label className="grid max-w-xs gap-2 text-sm">
            Date
            <select
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                setSelected("")
              }}
              className="h-9 rounded border bg-background px-3"
            >
              <option value="">Choose a date</option>
              {dates.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          {date && (
            <fieldset>
              <legend className="mb-3 text-sm font-medium">
                Available times
              </legend>
              <div className="flex flex-wrap gap-2">
                {slots
                  .filter((s) => s.date === date)
                  .map((s) => (
                    <label
                      key={s.id}
                      className="cursor-pointer rounded-md border px-3 py-2 text-sm has-checked:border-primary has-checked:text-primary has-disabled:opacity-50"
                    >
                      <input
                        type="radio"
                        name="booking-slot"
                        className="sr-only"
                        value={s.id}
                        disabled={!s.available}
                        checked={selected === s.id}
                        onChange={() => setSelected(s.id)}
                      />
                      {s.label}
                    </label>
                  ))}
              </div>
            </fieldset>
          )}
          {selected &&
            (rescheduling && receipt && onReschedule ? (
              <AsyncAction
                onAction={async () => {
                  setReceipt(await onReschedule(receipt.id, selected))
                  setRescheduling(false)
                }}
              >
                Confirm new time
              </AsyncAction>
            ) : (
              <AppForm
                fields={[
                  { name: "name", label: "Full name", required: true },
                  {
                    name: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                  },
                  { name: "notes", label: "Notes", type: "textarea" },
                ]}
                submitLabel="Confirm booking"
                onSubmit={async (v) =>
                  setReceipt(
                    await onBook({
                      slotId: selected,
                      name: v.name ?? "",
                      email: v.email ?? "",
                      notes: v.notes ?? "",
                    })
                  )
                }
                successMessage=""
              />
            ))}
          {rescheduling && (
            <Button variant="ghost" onClick={() => setRescheduling(false)}>
              Keep current time
            </Button>
          )}
        </>
      )}
    </AppSection>
  )
}
export type SetupTask = {
  id: string
  title: string
  description?: string
  completed: boolean
  skipped?: boolean
  actionLabel: string
}
export function SetupChecklist({
  items,
  onAction,
  onSkip,
}: {
  items: SetupTask[]
  onAction: (id: string) => void | Promise<void>
  onSkip?: (id: string) => void | Promise<void>
}) {
  const done = items.filter((i) => i.completed || i.skipped).length
  return (
    <AppSection
      title="Get started"
      description={`${done} of ${items.length} tasks complete`}
    >
      <Progress
        aria-label="Setup progress"
        value={items.length ? (done / items.length) * 100 : 100}
      />
      <ol className="divide-y">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {item.completed ? "✓ " : ""}
                {item.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.skipped ? "Skipped" : item.description}
              </p>
            </div>
            {!item.completed && !item.skipped && (
              <div className="flex gap-2">
                <AsyncAction
                  variant="outline"
                  size="sm"
                  onAction={() => onAction(item.id)}
                >
                  {item.actionLabel}
                </AsyncAction>
                {onSkip && (
                  <AsyncAction
                    variant="ghost"
                    size="sm"
                    onAction={() => onSkip(item.id)}
                  >
                    Skip
                  </AsyncAction>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </AppSection>
  )
}
export type HelpArticle = {
  id: string
  title: string
  category: string
  excerpt: string
  content: ReactNode
}
export function HelpCenter({
  articles,
  onContact,
}: {
  articles: HelpArticle[]
  onContact: (values: {
    email: string
    message: string
  }) => void | Promise<void>
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const article = articles.find((a) => a.id === selected)
  const visible = articles.filter((a) =>
    `${a.title} ${a.excerpt} ${a.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )
  return (
    <AppSection title={article?.title ?? "Help center"}>
      {article ? (
        <>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            ← All topics
          </Button>
          <article className="max-w-[70ch] text-sm leading-7">
            {article.content}
          </article>
        </>
      ) : (
        <>
          <Input
            aria-label="Search help"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {!visible.length && (
            <p className="text-sm text-muted-foreground">
              No matching articles.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((a) => (
              <button
                key={a.id}
                className="space-y-2 rounded-lg border p-4 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setSelected(a.id)}
              >
                <p className="text-xs text-muted-foreground">{a.category}</p>
                <h3 className="text-sm font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.excerpt}</p>
              </button>
            ))}
          </div>
        </>
      )}
      <details className="border-t pt-5">
        <summary className="cursor-pointer text-sm font-medium">
          Contact support
        </summary>
        <div className="mt-4">
          <AppForm
            fields={[
              {
                name: "email",
                label: "Your email",
                type: "email",
                required: true,
              },
              {
                name: "message",
                label: "How can we help?",
                type: "textarea",
                required: true,
              },
            ]}
            onSubmit={(v) =>
              onContact({ email: v.email ?? "", message: v.message ?? "" })
            }
            submitLabel="Send request"
            successMessage="Support request sent."
          />
        </div>
      </details>
    </AppSection>
  )
}
export function FeedbackForm({
  categories,
  onSubmit,
}: {
  categories: { id: string; label: string }[]
  onSubmit: (values: {
    category: string
    description: string
    email: string
    files: File[]
  }) => void | Promise<void>
}) {
  const [files, setFiles] = useState<File[]>([])
  return (
    <AppSection
      title="Send feedback"
      description="Tell us what happened or what could be better."
    >
      <AppForm
        fields={[
          {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: categories.map((c) => ({ value: c.id, label: c.label })),
          },
          {
            name: "description",
            label: "Details",
            type: "textarea",
            required: true,
          },
          { name: "email", label: "Reply email", type: "email" },
        ]}
        onSubmit={(v) =>
          onSubmit({
            category: v.category ?? "",
            description: v.description ?? "",
            email: v.email ?? "",
            files,
          })
        }
        submitLabel="Send feedback"
        successMessage="Feedback sent."
      >
        <DropZone
          label="Attachments"
          value={files}
          onValueChange={setFiles}
          maxFiles={5}
        />
      </AppForm>
    </AppSection>
  )
}
