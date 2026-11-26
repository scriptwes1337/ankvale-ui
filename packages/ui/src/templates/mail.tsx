"use client"
import type { TemplateConfiguration } from "@ankvale/ui/templates/shared"
import { useState, useRef } from "react"
import { TemplateShell } from "@ankvale/ui/templates/shared"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ankvale/ui/components/dialog"
import {
  StarIcon,
  ArchiveIcon,
  TrashIcon,
  ArrowBendUpLeftIcon,
} from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export type MailMessage = {
  id: string
  from: string
  to: string
  subject: string
  body: string
  date: string
  folder: "inbox" | "sent" | "drafts" | "archive" | "trash"
  starred?: boolean
  read?: boolean
}
export type MailDraft = { to: string; subject: string; body: string }
const sampleMessages: MailMessage[] = [
  {
    id: "1",
    from: "Jamie Chen",
    to: "alex@example.com",
    subject: "Design review",
    body: "Hi Alex,\n\nThe updated screens are ready. Please review the navigation before our meeting tomorrow.\n\nThanks,\nJamie",
    date: "Today",
    folder: "inbox",
  },
  {
    id: "2",
    from: "Sam Rivera",
    to: "alex@example.com",
    subject: "Project brief",
    body: "The brief is attached to the project. Let me know if the milestones need updating.",
    date: "Yesterday",
    folder: "inbox",
    starred: true,
  },
  {
    id: "3",
    from: "Taylor Brooks",
    to: "alex@example.com",
    subject: "Team meeting",
    body: "Our next team meeting is on Thursday at 10:00. Please add your updates to the agenda.",
    date: "Nov 24",
    folder: "inbox",
    read: true,
  },
  {
    id: "4",
    from: "Alex Lee",
    to: "team@example.com",
    subject: "Weekly update",
    body: "The first round of research is complete. Design starts next week.",
    date: "Nov 23",
    folder: "sent",
    read: true,
  },
]
export function MailTemplate({
  initialMessages = sampleMessages,
  onSend,
  className,
  configuration,
}: {
  initialMessages?: MailMessage[]
  onSend?: (draft: MailDraft) => void | Promise<void>
  configuration?: TemplateConfiguration
  className?: string
}) {
  const [messages, setMessages] = useState(initialMessages),
    [folder, setFolder] = useState("inbox"),
    [selected, setSelected] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [compose, setCompose] = useState(false),
    [draft, setDraft] = useState<MailDraft>({ to: "", subject: "", body: "" }),
    [pending, setPending] = useState(false),
    [error, setError] = useState("")
  const sending = useRef(false)
  const current = messages.find((message) => message.id === selected)
  const filtered = messages.filter(
    (message) =>
      (folder === "starred" ? message.starred : message.folder === folder) &&
      `${message.from} ${message.subject} ${message.body}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  function patch(id: string, patch: Partial<MailMessage>) {
    setMessages((items) =>
      items.map((message) =>
        message.id === id ? { ...message, ...patch } : message
      )
    )
  }
  async function send() {
    if (sending.current) return
    sending.current = true
    setPending(true)
    setError("")
    try {
      await onSend?.(draft)
      setMessages((items) => [
        {
          ...draft,
          id: `sent-${Date.now()}`,
          from: "Alex Lee",
          date: "Now",
          folder: "sent",
          read: true,
        },
        ...items,
      ])
      setCompose(false)
      setDraft({ to: "", subject: "", body: "" })
      setFolder("sent")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send.")
    } finally {
      sending.current = false
      setPending(false)
    }
  }
  return (
    <TemplateShell
      configuration={configuration}
      brand="Ankvale mail"
      pages={[
        {
          id: "inbox",
          label: "Inbox",
          count: messages.filter(
            (message) => message.folder === "inbox" && !message.read
          ).length,
        },
        { id: "starred", label: "Starred" },
        { id: "sent", label: "Sent" },
        { id: "drafts", label: "Drafts" },
        { id: "archive", label: "Archive" },
        { id: "trash", label: "Trash" },
      ]}
      active={folder}
      onNavigate={(id) => {
        setFolder(id)
        setSelected(null)
      }}
      title={folder.charAt(0).toUpperCase() + folder.slice(1)}
      className={className}
      actions={
        <Button
          size="sm"
          onClick={() => {
            setDraft({ to: "", subject: "", body: "" })
            setCompose(true)
          }}
        >
          Compose
        </Button>
      }
    >
      <div className="grid min-h-full md:grid-cols-[minmax(220px,340px)_1fr]">
        <section
          aria-label="Messages"
          className={cn("border-e", current && "hidden md:block")}
        >
          <div className="border-b p-3">
            <Input
              aria-label="Search mail"
              placeholder="Search mail…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="divide-y">
            {filtered.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  aria-current={selected === message.id ? "true" : undefined}
                  onClick={() => {
                    setSelected(message.id)
                    patch(message.id, { read: true })
                  }}
                  className={cn(
                    "block w-full p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    selected === message.id && "bg-accent"
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-xs">
                    <span className={cn(!message.read && "font-semibold")}>
                      {message.from}
                    </span>
                    <span className="text-muted-foreground">
                      {message.date}
                    </span>
                  </span>
                  <span className="mt-2 block truncate text-sm font-medium">
                    {message.subject}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                    {message.body}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!filtered.length && (
            <p role="status" className="p-6 text-sm text-muted-foreground">
              No messages.
            </p>
          )}
        </section>
        <section
          aria-label="Message reader"
          className={cn("min-w-0", !current && "hidden md:block")}
        >
          {current ? (
            <>
              <div className="flex items-center gap-2 border-b p-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="md:hidden"
                  onClick={() => setSelected(null)}
                >
                  Back
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Star message"
                  aria-pressed={!!current.starred}
                  onClick={() =>
                    patch(current.id, { starred: !current.starred })
                  }
                >
                  <StarIcon weight={current.starred ? "fill" : "regular"} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Archive message"
                  onClick={() => {
                    patch(current.id, { folder: "archive" })
                    setSelected(null)
                  }}
                >
                  <ArchiveIcon />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Move message to trash"
                  onClick={() => {
                    patch(current.id, { folder: "trash" })
                    setSelected(null)
                  }}
                >
                  <TrashIcon />
                </Button>
                <Button
                  className="ms-auto"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraft({
                      to:
                        current.from.match(/<([^<>\s]+@[^<>\s]+)>/)?.[1] ??
                        (/^[^\s<>]+@[^\s<>]+$/.test(current.from)
                          ? current.from
                          : ""),
                      subject: `Re: ${current.subject}`,
                      body: "",
                    })
                    setCompose(true)
                  }}
                >
                  <ArrowBendUpLeftIcon />
                  Reply
                </Button>
              </div>
              <article className="p-6">
                <h1 className="text-xl font-semibold">{current.subject}</h1>
                <p className="mt-3 text-xs text-muted-foreground">
                  {current.from} · {current.date}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  To: {current.to}
                </p>
                <div className="mt-8 text-sm leading-7 whitespace-pre-wrap">
                  {current.body}
                </div>
              </article>
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center p-6 text-sm text-muted-foreground">
              Select a message.
            </div>
          )}
        </section>
      </div>
      <Dialog
        open={compose}
        onOpenChange={(open) => {
          if (!pending) setCompose(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
          >
            <label className="grid gap-2 text-sm">
              To
              <Input
                type="email"
                required
                value={draft.to}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Subject
              <Input
                required
                value={draft.subject}
                disabled={pending}
                onChange={(e) =>
                  setDraft({ ...draft, subject: e.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              Message
              <textarea
                required
                value={draft.body}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="min-h-40 rounded-md border bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : onSend ? "Send" : "Send in preview"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setMessages((items) => [
                    {
                      ...draft,
                      id: `draft-${Date.now()}`,
                      from: "Alex Lee",
                      folder: "drafts",
                      date: "Now",
                    },
                    ...items,
                  ])
                  setCompose(false)
                  setFolder("drafts")
                }}
              >
                Save draft
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TemplateShell>
  )
}
