"use client"
import { useRef, useState } from "react"
import { Agenda, type AgendaEvent } from "@ankvale/ui/components/agenda"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import {
  zonedWallTime,
  resolveZonedWallTime,
  shiftWallDate,
  type TimeDisambiguation,
} from "@ankvale/ui/lib/schedule-time"
export {
  zonedWallTime,
  resolveZonedWallTime,
} from "@ankvale/ui/lib/schedule-time"
export type OccurrenceOverride = {
  start: Date
  end: Date
  title?: string
  resourceId?: string
}
export type ScheduledEvent = AgendaEvent & {
  resourceId?: string
  timeZone?: string
  seriesId?: string
  occurrenceKey?: string
  recurrence?: {
    frequency: "daily" | "weekly"
    count: number
    exceptions?: string[]
    overrides?: Record<string, OccurrenceOverride>
    disambiguation?: TimeDisambiguation
    gapPolicy?: "skip" | "reject"
  }
}
export function expandRecurringEvents(events: ScheduledEvent[], limit = 366) {
  return events.flatMap((event) => {
    const recurrence = event.recurrence
    if (!recurrence) return [event]
    const count = Math.max(1, Math.min(limit, Math.floor(recurrence.count)))
    if (!Number.isFinite(count))
      throw new Error("Enter a finite recurrence count.")
    const zone =
      event.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
    const startWall = zonedWallTime(event.start, zone),
      endWall = zonedWallTime(event.end, zone)
    const instances: ScheduledEvent[] = []
    for (let i = 0; i < count; i++) {
      const days = i * (recurrence.frequency === "weekly" ? 7 : 1)
      const wall = shiftWallDate(startWall, days),
        occurrenceKey = wall.slice(0, 10)
      if (recurrence.exceptions?.includes(occurrenceKey)) continue
      const override = recurrence.overrides?.[occurrenceKey]
      try {
        const start =
          override?.start ??
          (i === 0
            ? event.start
            : resolveZonedWallTime(wall, zone, recurrence.disambiguation))
        const end =
          override?.end ??
          (i === 0
            ? event.end
            : resolveZonedWallTime(
                shiftWallDate(endWall, days),
                zone,
                recurrence.disambiguation
              ))
        instances.push({
          ...event,
          ...override,
          id: `${event.id}:${i}`,
          seriesId: event.id,
          occurrenceKey,
          start,
          end,
        })
      } catch (error) {
        if (
          recurrence.gapPolicy === "skip" &&
          error instanceof Error &&
          error.message.includes("does not exist")
        )
          continue
        throw error
      }
    }
    return instances
  })
}
export function findEventConflicts(
  event: ScheduledEvent,
  events: ScheduledEvent[]
) {
  const candidates = expandRecurringEvents([event])
  const others = expandRecurringEvents(
    events.filter((other) => other.id !== event.id)
  )
  const internal = candidates.filter((candidate, index) =>
    candidates.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        other.resourceId === candidate.resourceId &&
        candidate.start < other.end &&
        candidate.end > other.start
    )
  )
  return [
    ...new Map(
      [
        ...internal,
        ...candidates.flatMap((candidate) =>
          others.filter(
            (other) =>
              other.resourceId === candidate.resourceId &&
              candidate.start < other.end &&
              candidate.end > other.start
          )
        ),
      ].map((other) => [other.id, other])
    ).values(),
  ]
}
/** Changes one instance while retaining its stable original date key. */
export function updateOccurrence(
  series: ScheduledEvent,
  key: string,
  override: OccurrenceOverride | null
): ScheduledEvent {
  if (!series.recurrence) throw new Error("This event does not repeat.")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key))
    throw new Error("Invalid occurrence date.")
  const exceptions = new Set(series.recurrence.exceptions ?? [])
  const overrides = { ...series.recurrence.overrides }
  if (override) {
    if (
      !Number.isFinite(override.start.getTime()) ||
      !Number.isFinite(override.end.getTime()) ||
      override.end <= override.start
    )
      throw new Error("End must follow start.")
    exceptions.delete(key)
    overrides[key] = override
  } else {
    exceptions.add(key)
    delete overrides[key]
  }
  return {
    ...series,
    recurrence: {
      ...series.recurrence,
      exceptions: [...exceptions],
      overrides,
    },
  }
}
/** Simultaneous day lanes use the specified zone; the legacy month/week view uses the browser zone. */
export function ResourceDay({
  events,
  resources,
  date,
  timeZone,
  onSelect,
}: {
  events: ScheduledEvent[]
  resources: { id: string; name: string }[]
  date: string
  timeZone: string
  onSelect: (event: ScheduledEvent) => void
}) {
  const lanes = [...resources]
  for (const event of events) {
    const id = event.resourceId ?? ""
    if (!lanes.some((lane) => lane.id === id))
      lanes.push({ id, name: id || "Unassigned" })
  }
  if (!lanes.length) lanes.push({ id: "", name: "Schedule" })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return <p role="status">Choose a day.</p>
  const minute = (wall: string) =>
    Number(wall.slice(11, 13)) * 60 + Number(wall.slice(14, 16))
  return (
    <div
      data-slot="resource-day"
      className="max-h-[36rem] overflow-auto rounded-lg border"
    >
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `3.5rem repeat(${lanes.length}, minmax(12rem, 1fr))`,
        }}
      >
        <div className="sticky top-0 z-20 border-b bg-card p-2 text-xs">
          Time
        </div>
        {lanes.map((lane) => (
          <h3
            key={lane.id}
            className="sticky top-0 z-20 border-s border-b bg-card p-3 text-sm font-medium"
          >
            {lane.name}
          </h3>
        ))}
        <div
          aria-hidden="true"
          className="relative h-[48rem] text-xs text-muted-foreground"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="absolute inset-x-0 text-center"
              style={{ top: `${(i / 12) * 100}%` }}
            >
              {String(i * 2).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {lanes.map((lane) => {
          const items = events
            .filter((event) => (event.resourceId ?? "") === lane.id)
            .map((event) => {
              const start = zonedWallTime(event.start, timeZone),
                end = zonedWallTime(event.end, timeZone)
              return {
                event,
                start: start.slice(0, 10) < date ? 0 : minute(start),
                end: end.slice(0, 10) > date ? 1440 : minute(end),
                visible:
                  start.slice(0, 10) <= date &&
                  end.slice(0, 10) >= date &&
                  event.end > event.start &&
                  (end.slice(0, 10) > date || minute(end) > 0),
              }
            })
            .filter((item) => item.visible)
            .sort((a, b) => a.start - b.start)
          const columns: number[] = []
          const arranged = items.map((item) => {
            let column = columns.findIndex((end) => end <= item.start)
            if (column < 0) column = columns.length
            columns[column] = Math.max(item.end, item.start + 20)
            return { ...item, column }
          })
          return (
            <div
              key={lane.id}
              role="region"
              aria-label={`${lane.name} on ${date}`}
              className="relative h-[48rem] border-s"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 border-t border-border/50"
                  style={{ top: `${(i / 24) * 100}%` }}
                />
              ))}
              {arranged.map(({ event, start, end, column }) => (
                <button
                  key={event.id}
                  type="button"
                  disabled={event.readOnly}
                  onClick={() => onSelect(event)}
                  className="absolute overflow-hidden rounded border border-primary/30 bg-accent px-2 py-1 text-start text-xs text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    top: `${(start / 1440) * 100}%`,
                    height: `${(Math.max(end - start, end <= start ? Math.min((event.end.getTime() - event.start.getTime()) / 60000, 1440 - start) : 0, 20) / 1440) * 100}%`,
                    left: `${(column / Math.max(columns.length, 1)) * 100}%`,
                    width: `${100 / Math.max(columns.length, 1)}%`,
                  }}
                  aria-label={`${event.title}, ${zonedWallTime(event.start, timeZone).slice(11, 16)} to ${zonedWallTime(event.end, timeZone).slice(11, 16)}, ${lane.name}`}
                >
                  <span className="block truncate font-medium">
                    {event.title}
                  </span>
                  <span>
                    {zonedWallTime(event.start, timeZone).slice(11, 16)}–
                    {zonedWallTime(event.end, timeZone).slice(11, 16)}
                  </span>
                </button>
              ))}
            </div>
          )
        })}
      </div>
      {!events.some(
        (event) =>
          zonedWallTime(event.start, timeZone).slice(0, 10) <= date &&
          zonedWallTime(event.end, timeZone).slice(0, 10) >= date
      ) && (
        <p role="status" className="p-3 text-sm text-muted-foreground">
          No events on this day.
        </p>
      )}
    </div>
  )
}
/** Controlled event editor with explicit recurrence scope and IANA wall-time resolution. */
export function Scheduler({
  events,
  onEventsChange,
  onSave,
  resources = [],
  timeZone,
  resolveWallTime,
  label = "Schedule",
  initialDate,
}: {
  events: ScheduledEvent[]
  onEventsChange: (events: ScheduledEvent[]) => void
  onSave?: (event: ScheduledEvent) => void | Promise<void>
  resources?: { id: string; name: string }[]
  timeZone: string
  resolveWallTime?: (wallTime: string, timeZone: string) => Date
  label?: string
  initialDate?: Date
}) {
  const [resource, setResource] = useState("")
  const [view, setView] = useState<"calendar" | "resources">("resources")
  const [date, setDate] = useState(() =>
    zonedWallTime(
      initialDate ?? events[0]?.start ?? new Date(),
      timeZone
    ).slice(0, 10)
  )
  const [series, setSeries] = useState<ScheduledEvent | null>(null)
  const [occurrence, setOccurrence] = useState<ScheduledEvent | null>(null)
  const [editScope, setEditScope] = useState<"occurrence" | "series">(
    "occurrence"
  )
  const [disambiguation, setDisambiguation] =
    useState<TimeDisambiguation>("reject")
  const [editing, setEditing] = useState<ScheduledEvent | null>(null)
  const [title, setTitle] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [frequency, setFrequency] = useState("none")
  const [count, setCount] = useState(4)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  async function commit(next: ScheduledEvent) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    try {
      await onSave?.(next)
      onEventsChange(
        events.some((item) => item.id === next.id)
          ? events.map((item) => (item.id === next.id ? next : item))
          : [...events, next]
      )
      setEditing(null)
    } catch {
      setError("Event could not be saved. Try again.")
    } finally {
      busy.current = false
      setPending(false)
    }
  }
  function edit(event: ScheduledEvent) {
    setEditing(event)
    setDisambiguation(event.recurrence?.disambiguation ?? "reject")
    setTitle(event.title)
    setStart(zonedWallTime(event.start, timeZone).slice(0, 16))
    setEnd(zonedWallTime(event.end, timeZone).slice(0, 16))
    setFrequency(event.recurrence?.frequency ?? "none")
    setCount(event.recurrence?.count ?? 4)
    setError("")
  }
  let displayed: ScheduledEvent[] = [],
    expansionError = ""
  try {
    displayed = expandRecurringEvents(events).filter(
      (event) => !resource || event.resourceId === resource
    )
  } catch (cause) {
    expansionError =
      cause instanceof Error
        ? cause.message
        : "Recurrence could not be expanded."
  }
  function select(event: ScheduledEvent) {
    if (event.readOnly) return
    const original = events.find((item) => item.id === event.seriesId)
    setSeries(original ?? null)
    setOccurrence(original ? event : null)
    setEditScope("occurrence")
    setDisambiguation("reject")
    edit(event)
  }
  return (
    <section data-slot="scheduler" aria-label={label} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Time zone: {timeZone}</p>
        {resources.length > 0 && (
          <select
            aria-label="Resource"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="rounded border bg-card px-3 py-2 text-sm"
          >
            <option value="">All resources</option>
            {resources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
        <Button
          type="button"
          onClick={() => {
            const start = new Date()
            const end = new Date(start.getTime() + 3600000)
            setSeries(null)
            setOccurrence(null)
            setDisambiguation("reject")
            edit({
              id: crypto.randomUUID(),
              title: "",
              start,
              end,
              timeZone,
              resourceId: resource || resources[0]?.id,
            })
          }}
        >
          New event
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={view === "resources" ? "secondary" : "ghost"}
          aria-pressed={view === "resources"}
          onClick={() => setView("resources")}
        >
          Resource day
        </Button>
        <Button
          type="button"
          variant={view === "calendar" ? "secondary" : "ghost"}
          aria-pressed={view === "calendar"}
          onClick={() => setView("calendar")}
        >
          Calendar (browser timezone)
        </Button>
        {view === "resources" && (
          <label className="ms-auto text-sm">
            Day{" "}
            <Input
              type="date"
              className="inline-flex w-auto"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        )}
      </div>
      {expansionError && (
        <div>
          <p role="alert" className="text-sm text-destructive">
            {expansionError}
          </p>
          {events
            .filter((event) => event.recurrence && !event.readOnly)
            .map((event) => (
              <Button
                key={event.id}
                variant="outline"
                onClick={() => {
                  setSeries(null)
                  setOccurrence(null)
                  edit(event)
                }}
              >
                Edit recurrence: {event.title}
              </Button>
            ))}
        </div>
      )}
      {view === "resources" ? (
        <ResourceDay
          events={displayed}
          resources={resources.filter(
            (item) => !resource || item.id === resource
          )}
          date={date}
          timeZone={timeZone}
          onSelect={select}
        />
      ) : (
        <Agenda
          events={displayed}
          onEventSelect={(event) => select(event as ScheduledEvent)}
          readOnly
        />
      )}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !pending) setEditing(null)
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogTitle>
            {editing &&
            (series || events.some((item) => item.id === editing.id))
              ? "Edit event"
              : "New event"}
          </DialogTitle>
          <DialogDescription>
            Enter times in {timeZone}. Nonexistent times are rejected; for an
            overlap choose the earlier or later instant.
          </DialogDescription>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              if (!editing || busy.current) return
              setError("")
              let next: ScheduledEvent
              try {
                const parse = (wall: string) =>
                  resolveWallTime
                    ? resolveWallTime(wall, timeZone)
                    : resolveZonedWallTime(wall, timeZone, disambiguation)
                const begins = parse(start),
                  ends = parse(end)
                if (
                  !Number.isFinite(begins.getTime()) ||
                  !Number.isFinite(ends.getTime()) ||
                  ends <= begins
                )
                  throw new Error("End must follow start.")
                next = {
                  ...editing,
                  title: title.trim(),
                  timeZone:
                    editing.timeZone ??
                    Intl.DateTimeFormat().resolvedOptions().timeZone,
                  start: begins,
                  end: ends,
                  recurrence:
                    frequency === "none"
                      ? undefined
                      : {
                          ...editing.recurrence,
                          frequency: frequency as "daily" | "weekly",
                          count,
                          disambiguation,
                        },
                }
                if (
                  series &&
                  occurrence?.occurrenceKey &&
                  editScope === "occurrence"
                ) {
                  next = updateOccurrence(series, occurrence.occurrenceKey, {
                    title: next.title,
                    start: next.start,
                    end: next.end,
                    resourceId: next.resourceId,
                  })
                }
                if (!title.trim()) throw new Error("Enter an event title.")
                if (findEventConflicts(next, events).length)
                  throw new Error(
                    "This time overlaps an event for this resource."
                  )
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Check the event times."
                )
                return
              }
              await commit(next)
            }}
          >
            {series && occurrence && (
              <label className="grid gap-1 text-sm">
                Edit scope
                <select
                  aria-label="Edit scope"
                  value={editScope}
                  disabled={pending}
                  className="rounded border bg-card p-2"
                  onChange={(e) => {
                    const scope = e.target.value as "series" | "occurrence"
                    setEditScope(scope)
                    edit(scope === "series" ? series : occurrence)
                  }}
                >
                  <option value="occurrence">This occurrence</option>
                  <option value="series">Entire series</option>
                </select>
              </label>
            )}
            <fieldset disabled={pending} className="space-y-4">
              <label className="grid gap-1 text-sm">
                Event title
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                Start
                <Input
                  type="datetime-local"
                  required
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                End
                <Input
                  type="datetime-local"
                  required
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
              {resources.length > 0 && (
                <label className="grid gap-1 text-sm">
                  Resource
                  <select
                    value={editing?.resourceId ?? ""}
                    onChange={(e) =>
                      setEditing(
                        editing
                          ? { ...editing, resourceId: e.target.value }
                          : null
                      )
                    }
                    className="rounded border bg-card p-2"
                  >
                    <option value="">Unassigned</option>
                    {editing?.resourceId &&
                      !resources.some(
                        (item) => item.id === editing.resourceId
                      ) && (
                        <option value={editing.resourceId}>
                          {editing.resourceId}
                        </option>
                      )}
                    {resources.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="grid gap-1 text-sm">
                Clock overlap policy
                <select
                  aria-label="Clock overlap policy"
                  className="rounded border bg-card p-2"
                  value={disambiguation}
                  onChange={(e) =>
                    setDisambiguation(e.target.value as TimeDisambiguation)
                  }
                >
                  <option value="reject">Ask if ambiguous</option>
                  <option value="earlier">Earlier instant</option>
                  <option value="later">Later instant</option>
                </select>
              </label>
              {(!series || editScope === "series") && (
                <div className="flex gap-2">
                  <label className="grid flex-1 gap-1 text-sm">
                    Repeat
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="rounded border bg-card p-2"
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </label>
                  {frequency !== "none" && (
                    <label className="grid gap-1 text-sm">
                      Occurrences
                      <Input
                        type="number"
                        min="1"
                        max="366"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-24"
                      />
                    </label>
                  )}
                </div>
              )}
              {frequency !== "none" && (!series || editScope === "series") && (
                <label className="grid gap-1 text-sm">
                  Nonexistent recurring times
                  <select
                    aria-label="Nonexistent recurring times"
                    className="rounded border bg-card p-2"
                    value={editing?.recurrence?.gapPolicy ?? "reject"}
                    onChange={(e) =>
                      setEditing((current) =>
                        current
                          ? {
                              ...current,
                              recurrence: {
                                frequency: frequency as "daily" | "weekly",
                                count,
                                ...current.recurrence,
                                gapPolicy: e.target.value as "reject" | "skip",
                              },
                            }
                          : null
                      )
                    }
                  >
                    <option value="reject">Report an error</option>
                    <option value="skip">Skip that occurrence</option>
                  </select>
                </label>
              )}
            </fieldset>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              {series &&
                occurrence?.occurrenceKey &&
                editScope === "occurrence" && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      commit(
                        updateOccurrence(
                          series,
                          occurrence.occurrenceKey!,
                          null
                        )
                      )
                    }
                  >
                    Skip occurrence
                  </Button>
                )}
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
