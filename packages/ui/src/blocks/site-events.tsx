"use client"
import {
  SiteCollectionState,
  type SiteCollectionStatus,
} from "@ankvale/ui/blocks/site-shared"
import { useId, useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import {
  SiteBadge,
  SiteFilter,
  SiteEmpty,
  useSiteSubmission,
  SubmissionFeedback,
} from "@ankvale/ui/blocks/site-shared"
export type SiteEvent = {
  id: string
  title: string
  description: string
  category: string
  startsAt: string
  dateLabel: string
  location: string
  href: string
  speakers: { name: string; role: string }[]
}
export function EventIndex({
  events,
  loading,
  error,
  onRetry,
  ...props
}: SectionProps & SiteCollectionStatus & { events: SiteEvent[] }) {
  const [category, setCategory] = useState("")
  const [query, setQuery] = useState("")
  const filtered = events.filter(
    (event) =>
      (!category || event.category === category) &&
      `${event.title} ${event.location}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  return (
    <BlockSection {...props} aria-busy={loading} data-slot="event-index">
      <SectionHeading {...props} />
      <SiteCollectionState loading={loading} error={error} onRetry={onRetry} />
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_220px]">
        <label className="space-y-2 text-sm font-medium">
          <span>Search events</span>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <SiteFilter
          label="Event type"
          value={category}
          onChange={setCategory}
          options={[...new Set(events.map((event) => event.category))]}
        />
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {filtered.map((event) => (
          <li key={event.id}>
            <article className="rounded-lg border p-6">
              <SiteBadge>{event.category}</SiteBadge>
              <p className="mt-5 text-sm text-primary">
                <time dateTime={event.startsAt}>{event.dateLabel}</time>
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                <a href={event.href} className="hover:underline">
                  {event.title}
                </a>
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {event.description}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {event.location}
              </p>
            </article>
          </li>
        ))}
      </ul>
      {!loading && !error && !filtered.length && (
        <SiteEmpty>No events match your search.</SiteEmpty>
      )}
    </BlockSection>
  )
}
export function EventDetail({
  event,
  registerHref,
  children,
  ...props
}: SectionProps & {
  event: SiteEvent
  registerHref: string
  children?: ReactNode
}) {
  return (
    <BlockSection {...props} data-slot="event-detail">
      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <article>
          <SiteBadge>{event.category}</SiteBadge>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight">
            {event.title}
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {event.description}
          </p>
          <div className="mt-8 max-w-[70ch] space-y-5 leading-7">
            {children}
          </div>
          {event.speakers.length > 0 && (
            <section className="mt-10 border-t pt-6" aria-label="Speakers">
              <h3 className="text-xl font-semibold">Speakers</h3>
              <ul className="mt-5 space-y-4">
                {event.speakers.map((speaker) => (
                  <li key={`${speaker.name}-${speaker.role}`}>
                    <p className="font-medium">{speaker.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {speaker.role}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
        <aside className="h-fit rounded-lg border p-6">
          <time dateTime={event.startsAt} className="text-sm font-medium">
            {event.dateLabel}
          </time>
          <p className="mt-3 text-sm text-muted-foreground">{event.location}</p>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<a href={registerHref} />}
          >
            Register
          </Button>
        </aside>
      </div>
    </BlockSection>
  )
}
export type EventRegistrationData = {
  name: string
  email: string
  organization: string
}
export function EventRegistration({
  eventTitle,
  onRegister,
  ...props
}: SectionProps & {
  eventTitle: string
  onRegister: (data: EventRegistrationData) => void | Promise<void>
}) {
  const id = useId()
  const submission = useSiteSubmission()
  return (
    <BlockSection {...props} data-slot="event-registration">
      <SectionHeading
        {...props}
        title={props.title ?? `Register: ${eventTitle}`}
      />
      <form
        className="max-w-lg space-y-5"
        onChange={() => {
          if (submission.status !== "idle" && submission.status !== "pending")
            submission.reset()
        }}
        onSubmit={async (e) => {
          e.preventDefault()
          if (!e.currentTarget.reportValidity()) return
          const data = new FormData(e.currentTarget)
          await submission.run(() =>
            onRegister({
              name: String(data.get("name") ?? ""),
              email: String(data.get("email") ?? ""),
              organization: String(data.get("organization") ?? ""),
            })
          )
        }}
      >
        <fieldset
          disabled={submission.status === "pending"}
          className="space-y-5"
        >
          <label
            htmlFor={`${id}-name`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Name</span>
            <Input name="name" id={`${id}-name`} autoComplete="name" required />
          </label>
          <label
            htmlFor={`${id}-email`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Email</span>
            <Input
              name="email"
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label
            htmlFor={`${id}-organization`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Organization</span>
            <Input
              name="organization"
              id={`${id}-organization`}
              autoComplete="organization"
            />
          </label>
          <Button type="submit">
            {submission.status === "pending"
              ? "Registering…"
              : "Complete registration"}
          </Button>
        </fieldset>
        <SubmissionFeedback
          status={submission.status}
          success="Your registration is confirmed."
          error="Registration could not be completed. Your details are still here; try again."
        />
      </form>
    </BlockSection>
  )
}
