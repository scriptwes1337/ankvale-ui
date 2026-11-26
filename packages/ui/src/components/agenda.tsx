"use client"
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  type DateLocalizer,
  type SlotInfo,
} from "react-big-calendar"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
const defaultLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
})
export type AgendaEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  readOnly?: boolean
  color?: string
}
// React Big Calendar publishes this addon as a Babel CommonJS default export.
// Normalize its namespace when consumed by Node ESM or a client bundler.
const withDnd =
  typeof withDragAndDrop === "function"
    ? withDragAndDrop
    : (withDragAndDrop as unknown as { default: typeof withDragAndDrop })
        .default
const DragCalendar = withDnd<AgendaEvent>(Calendar)
export type AgendaProps = {
  events: AgendaEvent[]
  date?: Date
  defaultDate?: Date
  onDateChange?: (date: Date) => void
  view?: View
  defaultView?: View
  onViewChange?: (view: View) => void
  onEventChange?: (event: AgendaEvent) => void
  onEventCreate?: (event: Omit<AgendaEvent, "id">) => void
  onEventSelect?: (event: AgendaEvent) => void
  localizer?: DateLocalizer
  culture?: string
  step?: number
  height?: number
  className?: string
  readOnly?: boolean
}
export function Agenda({
  events,
  date,
  defaultDate,
  onDateChange,
  view,
  defaultView = "week",
  onViewChange,
  onEventChange,
  onEventCreate,
  onEventSelect,
  localizer = defaultLocalizer,
  culture = "en-US",
  step = 30,
  height = 560,
  className,
  readOnly = false,
}: AgendaProps) {
  const [currentDate, setCurrentDate] = useControllableState({
    value: date,
    defaultValue: defaultDate ?? new Date(),
    onChange: onDateChange,
  })
  const [currentView, setCurrentView] = useControllableState({
    value: view,
    defaultValue: defaultView,
    onChange: onViewChange,
  })
  function create(slot: SlotInfo) {
    if (readOnly || !onEventCreate) return
    onEventCreate({
      title: "New event",
      start: slot.start,
      end: slot.end,
      allDay: slot.action === "doubleClick" ? false : currentView === "month",
    })
  }
  return (
    <div
      data-slot="agenda"
      className={cn(
        "ankvale-agenda min-w-0 rounded-lg border bg-card p-3 text-sm",
        className
      )}
      style={{ height }}
    >
      <DragCalendar
        localizer={localizer}
        culture={culture}
        events={events}
        date={currentDate}
        onNavigate={setCurrentDate}
        view={currentView}
        onView={setCurrentView}
        views={["month", "week", "day", "agenda"]}
        step={step}
        timeslots={2}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        allDayAccessor="allDay"
        selectable={!readOnly && !!onEventCreate}
        resizable={!readOnly && !!onEventChange}
        draggableAccessor={(event) =>
          !readOnly && !event.readOnly && !!onEventChange
        }
        resizableAccessor={(event) =>
          !readOnly && !event.readOnly && !!onEventChange
        }
        onEventDrop={({ event, start, end, isAllDay }) =>
          onEventChange?.({
            ...event,
            start: new Date(start),
            end: new Date(end),
            allDay: isAllDay,
          })
        }
        onEventResize={({ event, start, end }) =>
          onEventChange?.({
            ...event,
            start: new Date(start),
            end: new Date(end),
          })
        }
        onSelectSlot={create}
        onSelectEvent={onEventSelect}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor:
              currentView === "agenda"
                ? "transparent"
                : (event.color ?? "var(--primary)"),
            borderColor:
              currentView === "agenda"
                ? "var(--border)"
                : (event.color ?? "var(--primary)"),
            color:
              currentView === "agenda"
                ? "var(--foreground)"
                : "var(--primary-foreground)",
          },
        })}
        messages={{
          today: "Today",
          previous: "Previous",
          next: "Next",
          month: "Month",
          week: "Week",
          day: "Day",
          agenda: "List",
          noEventsInRange: "No events in this period.",
        }}
      />
    </div>
  )
}
