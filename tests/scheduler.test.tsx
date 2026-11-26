import assert from "node:assert/strict"
import { useState } from "react"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react"
import {
  Scheduler,
  ResourceDay,
  expandRecurringEvents,
  findEventConflicts,
  updateOccurrence,
  resolveZonedWallTime,
  zonedWallTime,
  type ScheduledEvent,
} from "../packages/ui/src/components/scheduler"
const zone = "America/New_York"
const series: ScheduledEvent = {
  id: "team:review",
  title: "Review",
  resourceId: "room",
  timeZone: zone,
  start: new Date("2026-03-01T14:00:00Z"),
  end: new Date("2026-03-01T15:00:00Z"),
  recurrence: { frequency: "weekly", count: 3 },
}
export async function run() {
  assert.equal(
    resolveZonedWallTime("2026-06-01T09:00", "Asia/Kathmandu").toISOString(),
    "2026-06-01T03:15:00.000Z"
  )
  assert.throws(() => resolveZonedWallTime("2026-02-30T09:00", zone), /valid/)
  assert.throws(
    () => resolveZonedWallTime("2026-03-08T02:30", zone),
    /does not exist/
  )
  assert.throws(
    () => resolveZonedWallTime("2026-11-01T01:30", zone),
    /occurs twice/
  )
  const early = resolveZonedWallTime("2026-11-01T01:30", zone, "earlier"),
    late = resolveZonedWallTime("2026-11-01T01:30", zone, "later")
  assert.equal(late.getTime() - early.getTime(), 3600000)
  assert.equal(
    resolveZonedWallTime(
      "2026-04-05T01:45",
      "Australia/Lord_Howe",
      "later"
    ).getTime() -
      resolveZonedWallTime(
        "2026-04-05T01:45",
        "Australia/Lord_Howe",
        "earlier"
      ).getTime(),
    1800000
  )
  assert.equal(zonedWallTime(early, zone), "2026-11-01T01:30:00")
  const instances = expandRecurringEvents([series])
  assert.equal(instances.length, 3)
  assert.equal(instances[1]!.start.toISOString(), "2026-03-08T13:00:00.000Z")
  assert.equal(instances[1]!.seriesId, "team:review")
  assert.equal(instances[1]!.occurrenceKey, "2026-03-08")
  const moved = updateOccurrence(series, "2026-03-08", {
    start: new Date("2026-03-08T15:00Z"),
    end: new Date("2026-03-08T16:00Z"),
    title: "Moved",
  })
  assert.equal(expandRecurringEvents([moved])[1]!.title, "Moved")
  assert.equal(expandRecurringEvents([series])[1]!.title, "Review")
  assert.equal(
    expandRecurringEvents([updateOccurrence(moved, "2026-03-08", null)]).length,
    2
  )
  const gapSeries: ScheduledEvent = {
    ...series,
    start: new Date("2026-03-01T07:30Z"),
    end: new Date("2026-03-01T08:30Z"),
  }
  assert.throws(() => expandRecurringEvents([gapSeries]), /does not exist/)
  assert.equal(
    expandRecurringEvents([
      {
        ...gapSeries,
        recurrence: { ...gapSeries.recurrence!, gapPolicy: "skip" },
      },
    ]).length,
    2
  )
  const conflict: ScheduledEvent = {
    id: "conflict",
    title: "Taken",
    resourceId: "room",
    start: new Date("2026-03-08T13:30Z"),
    end: new Date("2026-03-08T14:30Z"),
  }
  assert.equal(
    findEventConflicts(series, [conflict]).length,
    1,
    "conflicts include future occurrences"
  )
  assert.equal(
    findEventConflicts(series, [series]).length,
    0,
    "series excludes its stored self"
  )
  assert(
    findEventConflicts({ ...series, end: new Date("2026-03-10T15:00Z") }, [])
      .length > 0,
    "series checks self overlap"
  )
  const html = renderToString(
    <ResourceDay
      events={instances}
      resources={[
        { id: "room", name: "Room A" },
        { id: "remote", name: "Remote" },
      ]}
      date="2026-03-08"
      timeZone={zone}
      onSelect={() => {}}
    />
  )
  assert(html.includes("Room A"))
  assert(html.includes("Remote"))
  assert(html.replace(/<!--.*?-->/g, "").includes("09:00–10:00"))
  console.log(
    "✓ IANA offsets, DST gap/overlap policies, recurrence keys/overrides/exceptions and future conflicts"
  )
  let saved: ScheduledEvent | undefined,
    attempts = 0
  function Example() {
    const [events, setEvents] = useState([series])
    return (
      <Scheduler
        events={events}
        onEventsChange={setEvents}
        resources={[{ id: "room", name: "Room A" }]}
        timeZone={zone}
        onSave={async (next) => {
          attempts++
          if (attempts === 1) throw Error("offline")
          saved = next
        }}
      />
    )
  }
  render(<Example />)
  fireEvent.change(screen.getByLabelText("Day"), {
    target: { value: "2026-03-08" },
  })
  fireEvent.click(
    screen.getByRole("button", { name: "Review, 09:00 to 10:00, Room A" })
  )
  assert(screen.getByLabelText("Edit scope"))
  fireEvent.change(screen.getByLabelText("Event title"), {
    target: { value: "Customer review" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Save event" }))
  await screen.findByRole("alert")
  assert.equal(
    (screen.getByLabelText("Event title") as HTMLInputElement).value,
    "Customer review"
  )
  fireEvent.click(screen.getByRole("button", { name: "Save event" }))
  await waitFor(() =>
    assert(
      !screen.queryByRole("dialog"),
      "Dialog should close after successful save"
    )
  )
  assert.equal(saved?.id, series.id)
  assert.equal(
    saved?.recurrence?.overrides?.["2026-03-08"]?.title,
    "Customer review"
  )
  fireEvent.click(
    screen.getByRole("button", {
      name: "Customer review, 09:00 to 10:00, Room A",
    })
  )
  fireEvent.click(screen.getByRole("button", { name: "Skip occurrence" }))
  await waitFor(() =>
    assert(
      !screen.queryByRole("dialog"),
      "Dialog should close after successful save"
    )
  )
  assert(saved?.recurrence?.exceptions?.includes("2026-03-08"))
  cleanup()
  const fallback: ScheduledEvent = {
    id: "fallback",
    title: "Clock overlap",
    start: early,
    end: late,
  }
  const fallbackHtml = renderToString(
    <ResourceDay
      events={[fallback]}
      resources={[]}
      date="2026-11-01"
      timeZone={zone}
      onSelect={() => {}}
    />
  )
  assert(
    fallbackHtml.includes('aria-label="Clock overlap,'),
    "a positive-duration fallback booking remains visible"
  )
  const policySeries: ScheduledEvent = {
    ...series,
    resourceId: undefined,
    start: new Date("2026-10-25T05:30Z"),
    end: new Date("2026-10-25T06:30Z"),
    recurrence: { frequency: "weekly", count: 3, disambiguation: "earlier" },
  }
  render(
    <Scheduler
      events={[policySeries]}
      onEventsChange={() => {}}
      timeZone="UTC"
      resources={[{ id: "room", name: "Room A" }]}
      onSave={async (next) => {
        saved = next
      }}
    />
  )
  fireEvent.click(
    screen.getByRole("button", { name: "Review, 05:30 to 06:30, Unassigned" })
  )
  fireEvent.change(screen.getByLabelText("Edit scope"), {
    target: { value: "series" },
  })
  assert.equal(
    (
      screen.getAllByLabelText("Resource", {
        selector: "select",
      })[1]! as HTMLSelectElement
    ).value,
    ""
  )
  assert.equal(
    (screen.getByLabelText("Clock overlap policy") as HTMLSelectElement).value,
    "earlier"
  )
  fireEvent.change(screen.getByLabelText("Event title"), {
    target: { value: "Renamed" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Save event" }))
  await waitFor(() =>
    assert(!screen.queryByRole("dialog"), "series save closes")
  )
  assert.equal(
    saved?.timeZone,
    zone,
    "editing in a different display zone preserves recurrence zone"
  )
  assert.equal(saved?.recurrence?.disambiguation, "earlier")
  assert.equal(
    zonedWallTime(expandRecurringEvents([saved!])[2]!.start, zone).slice(
      11,
      16
    ),
    "01:30"
  )
  cleanup()
  console.log(
    "✓ simultaneous resource lanes, per-occurrence edit/skip, failed save retains draft, successful callback persists series"
  )
}
