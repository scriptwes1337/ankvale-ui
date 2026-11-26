"use client"

import Link from "next/link"
import { useId, useState } from "react"
import {
  ArrowUpRightIcon,
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  CopyIcon,
  CalendarBlankIcon,
  CodeIcon,
  SparkleIcon,
  CircleIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react"
import { Calendar } from "@ankvale/ui/components/calendar"
import { Button } from "@ankvale/ui/components/button"
import { Switch } from "@ankvale/ui/components/switch"
import { Checkbox } from "@ankvale/ui/components/checkbox"
import { AdvancedChart } from "@ankvale/ui/components/advanced-chart"
import { Progress } from "@ankvale/ui/components/progress"
import { Motion } from "@ankvale/ui/components/motion"
import { cn } from "@ankvale/ui/lib/utils"
import { ShowcaseInspector } from "./showcase-inspector"

const activity = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 21 },
  { name: "Wed", value: 18 },
  { name: "Thu", value: 34 },
  { name: "Fri", value: 28 },
  { name: "Sat", value: 43 },
  { name: "Sun", value: 52 },
]
export function ComponentShowcases() {
  const id = useId(),
    [date, setDate] = useState<Date | undefined>(() => new Date(2026, 11, 4)),
    [notifications, setNotifications] = useState(true),
    [digest, setDigest] = useState(false),
    [done, setDone] = useState([true, true, false]),
    [range, setRange] = useState("week")
  return (
    <section
      className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-10"
      aria-labelledby="details-heading"
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Components, in context.
          </p>
          <h2
            id="details-heading"
            className="max-w-lg text-3xl leading-[1.1] font-semibold tracking-[-.045em] sm:text-5xl"
          >
            Made to work
            <br />
            together.
          </h2>
        </div>
        <Link
          href="/playground"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
        >
          Explore components <ArrowUpRightIcon />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.08fr_1fr]">
        <div className="flex min-w-0 flex-col rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4 text-xs">
            <span className="flex items-center gap-2 font-medium">
              <CalendarBlankIcon />A date worth saving
            </span>
            <span className="text-muted-foreground">Calendar</span>
          </div>
          <div className="flex flex-1 flex-col justify-center p-3">
            <Calendar
              aria-label="Preview calendar"
              mode="single"
              selected={date}
              onSelect={setDate}
              defaultMonth={new Date(2026, 11, 1)}
              className="mx-auto w-fit [--cell-size:--spacing(9)]"
            />
            <p
              role="status"
              className="px-3 pb-2 text-center text-xs text-muted-foreground"
            >
              {date
                ? new Intl.DateTimeFormat("en", {
                    month: "long",
                    day: "numeric",
                  }).format(date)
                : "Choose a day"}{" "}
              · Your next milestone
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-medium">A productive {range}</span>
              <div
                role="group"
                aria-label="Activity period"
                className="flex rounded-md bg-secondary p-0.5"
              >
                {["week", "month"].map((value) => (
                  <button
                    key={value}
                    aria-pressed={range === value}
                    onClick={() => setRange(value)}
                    className={cn(
                      "min-h-8 rounded px-2 text-[11px] capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      range === value
                        ? "bg-background shadow-xs"
                        : "text-muted-foreground"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <p className="mb-4 text-4xl font-semibold tracking-[-.05em]">
              {range === "week" ? "52" : "186"}
              <span className="ms-3 text-xs font-normal tracking-normal text-muted-foreground">
                tasks completed
              </span>
            </p>
            <AdvancedChart
              key={range}
              kind="sparkline"
              label="Team activity"
              data={
                range === "week"
                  ? activity
                  : activity.map((item) => ({
                      ...item,
                      value: item.value * 3 + 30,
                    }))
              }
              height={110}
              interactive={false}
            />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Illustrative project data
            </p>
          </div>
          <div className="flex-1 rounded-xl border bg-card p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-medium">
              <BellIcon className="text-primary" />
              Keep the right things close.
            </p>
            <div className="flex items-center justify-between gap-3 py-2">
              <label htmlFor={`${id}-notifications`} className="text-xs">
                Project updates
              </label>
              <Switch
                id={`${id}-notifications`}
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between gap-3 py-2">
              <label htmlFor={`${id}-digest`} className="text-xs">
                Weekly round-up
              </label>
              <Switch
                id={`${id}-digest`}
                checked={digest}
                onCheckedChange={setDigest}
              />
            </div>
            <p role="status" className="mt-3 text-[11px] text-muted-foreground">
              {notifications
                ? "Project updates are on."
                : "Project updates are paused."}{" "}
              {digest ? "Weekly round-up enabled." : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden rounded-xl border bg-card md:col-span-2 xl:col-span-1">
          <div className="flex h-44 items-center justify-center bg-accent text-primary">
            <svg
              aria-hidden="true"
              viewBox="0 0 220 160"
              className="h-36 w-48"
              fill="none"
            >
              <path
                d="m110 12 85 48-85 48-85-48 85-48Z"
                fill="currentColor"
                fillOpacity=".1"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="m25 60 85 48v40L25 100V60Zm170 0-85 48v40l85-48V60Z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="m25 80 85 48 85-48M67 36l85 48v40M152 36 67 84v40M110 12v42"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle
                cx="110"
                cy="60"
                r="16"
                fill="var(--background)"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="m103 60 5 5 9-10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="text-[11px] text-muted-foreground">Getting started</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              Your workspace checklist.
            </h3>
            <ul className="mt-5 space-y-4">
              {[
                "Create a workspace",
                "Bring your team",
                "Make something together",
              ].map((label, index) => (
                <li key={label}>
                  <label className="flex min-h-6 items-center gap-3 text-xs">
                    <Checkbox
                      checked={done[index]}
                      onCheckedChange={(checked) =>
                        setDone((current) =>
                          current.map((value, i) =>
                            i === index ? checked : value
                          )
                        )
                      }
                    />
                    <span
                      className={
                        done[index] ? "text-muted-foreground line-through" : ""
                      }
                    >
                      {label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <Progress
                value={(done.filter(Boolean).length / 3) * 100}
                aria-label="Setup completion"
                className="[&_[data-slot=progress-track]]:bg-secondary"
              />
              <p
                role="status"
                className="mt-3 text-[11px] text-muted-foreground"
              >
                {done.filter(Boolean).length} of 3 steps complete
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <ShowcaseInspector
          title="The smaller building blocks"
          parts={[
            {
              name: "Calendar",
              href: "/docs/calendar",
              description: "Date selection and keyboard navigation.",
            },
            {
              name: "AdvancedChart",
              href: "/docs/advanced-chart",
              description:
                "A real SVG sparkline with an exact-value data view.",
            },
            {
              name: "Switch & checkbox",
              href: "/playground#switch",
              description: "Controlled preferences and setup states.",
            },
            {
              name: "Progress",
              href: "/docs/progress",
              description: "Completion derived from the selected steps.",
            },
          ]}
        />
      </div>
    </section>
  )
}

function ProductArtwork({ kind }: { kind: "product" | "journal" | "store" }) {
  if (kind === "product")
    return (
      <div className="flex h-full flex-col bg-background px-5 pt-5 text-foreground">
        <div className="flex items-center justify-between text-[9px]">
          <span className="flex items-center gap-1 font-semibold">
            <CircleIcon weight="fill" />
            orbit
          </span>
          <span className="text-muted-foreground">Product · Company · ↗</span>
        </div>
        <div className="my-auto py-8">
          <div className="mb-3 inline-flex rounded border px-1.5 py-0.5 text-[8px] text-muted-foreground">
            A little more headspace.
          </div>
          <p className="text-[32px] leading-[1.02] font-semibold tracking-[-.06em]">
            Room for
            <br />
            your next idea.
          </p>
          <div className="mt-4 h-5 w-20 rounded bg-primary" />
          <div className="relative mt-7 h-24 overflow-hidden rounded-md border bg-secondary/30">
            <div className="absolute top-3 right-3 bottom-0 left-3 flex overflow-hidden rounded-t border bg-background">
              <div className="w-12 border-e bg-secondary/40 p-2">
                <div className="size-3 rounded bg-primary" />
                <div className="mt-3 h-1 rounded bg-border" />
                <div className="mt-2 h-1 rounded bg-border" />
              </div>
              <div className="flex-1 p-3">
                <div className="h-2 w-2/3 rounded bg-foreground/15" />
                <div className="mt-3 flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 flex-1 rounded border bg-secondary/30 p-1.5"
                    >
                      <div className="h-5 rounded border bg-card" />
                      <div className="mt-1 h-5 rounded border bg-card" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  if (kind === "journal")
    return (
      <div className="flex h-full flex-col bg-[#f0f1ed] p-5 text-[#222923]">
        <div className="flex justify-between border-b border-current/25 pb-2 text-[8px]">
          <span>FIELDNOTES</span>
          <span>An independent journal · ↗</span>
        </div>
        <p className="mt-5 font-serif text-[45px] leading-none tracking-[-.05em]">
          A slower
          <br />
          kind of living.
        </p>
        <div className="relative mt-5 min-h-28 flex-1 overflow-hidden bg-[#c7d5c5]">
          <svg
            aria-hidden="true"
            viewBox="0 0 320 180"
            className="absolute inset-0 size-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M-30 200 110 15l120 185" fill="#eef0e4" />
            <path d="m90 200 125-155 135 155" fill="#8aa18a" />
            <circle cx="245" cy="32" r="15" fill="#f0f1ed" />
            <path
              d="M113 180V91m-14 34 14-21 14 21m-18 13 18-22 17 22"
              stroke="#384f40"
              strokeWidth="4"
            />
          </svg>
        </div>
        <div className="flex justify-between pt-3 text-[8px]">
          <span>Places, people & perspectives.</span>
          <span>Issue 04</span>
        </div>
      </div>
    )
  return (
    <div className="flex h-full flex-col bg-background p-5 text-foreground">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-xs font-semibold tracking-[.12em]">FORME</span>
        <span className="text-[8px]">Objects · About · Bag (0)</span>
      </div>
      <p className="mt-6 text-[30px] leading-none font-medium tracking-[-.05em]">
        Everyday,
        <br />a little better.
      </p>
      <div className="mt-5 min-h-0 flex-1 bg-[#e8ddd1] p-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 220 150"
          className="h-full w-full"
          fill="none"
        >
          <path
            d="m53 44 115 5 13 90-140-5L53 44Z"
            fill="#faf8f4"
            stroke="#373330"
            strokeWidth="1.1"
          />
          <path
            d="m80 48 2-22c1-23 55-21 55 4v19"
            stroke="#373330"
            strokeWidth="5"
          />
          <path d="m53 44 10 91M168 49l-12 89" stroke="#b6ada3" />
          <text x="84" y="101" fontSize="13" letterSpacing="3" fill="#373330">
            FORME
          </text>
        </svg>
      </div>
      <div className="mt-3 flex justify-between text-[8px]">
        <span>The everyday tote</span>
        <span>Explore the collection ↗</span>
      </div>
    </div>
  )
}
export function WebsiteShowcases() {
  const sites = [
    {
      id: "product-site",
      name: "The next product launch",
      type: "Product site",
      kind: "product" as const,
    },
    {
      id: "publication-site",
      name: "A different point of view",
      type: "Publication",
      kind: "journal" as const,
    },
    {
      id: "commerce-site",
      name: "Something worth discovering",
      type: "Storefront",
      kind: "store" as const,
    },
  ]
  return (
    <section
      className="border-y bg-secondary/30 py-20 sm:py-28"
      aria-labelledby="sites-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              And beyond the workspace.
            </p>
            <h2
              id="sites-heading"
              className="text-3xl leading-[1.1] font-semibold tracking-[-.045em] sm:text-5xl"
            >
              Websites, too.
            </h2>
          </div>
          <Link
            href="/blocks"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
          >
            Browse the blocks <ArrowUpRightIcon />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/blocks#${site.id}`}
              className="group block min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="overflow-hidden rounded-xl border bg-card p-1.5 transition-colors group-hover:border-primary">
                <div
                  role="img"
                  aria-label={`${site.type} layout concept`}
                  className="h-[340px] overflow-hidden rounded-lg border"
                >
                  <ProductArtwork kind={site.kind} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    {site.type}
                  </p>
                  <h3 className="text-sm font-medium">{site.name}</h3>
                </div>
                <ArrowUpRightIcon className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" />
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          Illustrative art direction. Explore the reusable site compositions and
          bring your own content.
        </p>
      </div>
    </section>
  )
}
const briefs = [
  {
    id: "workspace",
    label: "Project workspace",
    block: "app-project-detail",
    prompt:
      "Build a project workspace with Ankvale UI. Start with app-project-detail. Include a Kanban board, a list view, task editing, team avatars and progress. Use the shared white, ink and blue tokens. Keep keyboard movement and mobile scrolling intact.",
  },
  {
    id: "portal",
    label: "Customer portal",
    block: "app-billing",
    prompt:
      "Build a customer portal with Ankvale UI. Use app-layout, app-billing, app-invoice and app-profile-settings. Include navigation, invoice history, billing actions and account settings. Provide loading, empty and error states. Keep all service callbacks explicit.",
  },
  {
    id: "store",
    label: "Online store",
    block: "commerce-site",
    prompt:
      "Build an online store with Ankvale UI. Start with commerce-site, then use app-catalog and app-checkout for the shopping flow. Use actual product content and real service callbacks for prices, stock and payments. Preserve keyboard controls and responsive layouts.",
  },
]
export function AgentShowcase() {
  const [selected, setSelected] = useState(briefs[0]!),
    [feedback, setFeedback] = useState("")
  async function copy() {
    try {
      await navigator.clipboard.writeText(selected.prompt)
      setFeedback("Brief copied.")
    } catch {
      setFeedback("Copy unavailable. Select the brief to copy it.")
    }
  }
  return (
    <section
      className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[.85fr_1fr] lg:gap-24 lg:px-10"
      aria-labelledby="agent-heading"
    >
      <div>
        <span className="mb-6 inline-flex size-10 items-center justify-center rounded-lg border">
          <CodeIcon className="size-5 text-primary" />
        </span>
        <h2
          id="agent-heading"
          className="text-3xl leading-[1.1] font-semibold tracking-[-.045em] sm:text-5xl"
        >
          Give your agent
          <br />a good starting point.
        </h2>
        <p className="mt-5 max-w-sm text-base leading-7 text-muted-foreground">
          The components, the patterns, and the design decisions. All in the
          same place.
        </p>
        <div className="mt-7 flex flex-wrap gap-5">
          <Link
            href="/guides"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
          >
            Read the guides <ArrowRightIcon />
          </Link>
          <Link
            href="/tools"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"
          >
            Get the skill <ArrowUpRightIcon />
          </Link>
        </div>
      </div>
      <Motion
        preset="fade"
        className="overflow-hidden rounded-xl border bg-card"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="flex items-center gap-2 font-mono text-xs">
            <SparkleIcon className="text-primary" />A brief for your coding
            agent
          </span>
          <span className="hidden text-[10px] text-muted-foreground sm:block">
            Ready to copy
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <div
            className="mb-7 flex flex-wrap gap-2"
            role="group"
            aria-label="Agent example"
          >
            {briefs.map((brief) => (
              <Button
                key={brief.id}
                size="sm"
                variant={selected.id === brief.id ? "secondary" : "ghost"}
                aria-pressed={selected.id === brief.id}
                className="text-xs"
                onClick={() => {
                  setSelected(brief)
                  setFeedback("")
                }}
              >
                {brief.label}
              </Button>
            ))}
          </div>
          <p className="min-h-36 font-mono text-sm leading-7 text-foreground/85">
            {selected.prompt}
          </p>
          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
            <Link
              href={`/blocks#${selected.block}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary"
            >
              <SquaresFourIcon />
              View the starting block <ArrowUpRightIcon />
            </Link>
            <Button size="sm" variant="outline" onClick={copy}>
              {feedback === "Brief copied." ? <CheckIcon /> : <CopyIcon />}Copy
              brief
            </Button>
          </div>
          <p
            role="status"
            className="mt-2 min-h-4 text-xs text-muted-foreground"
          >
            {feedback}
          </p>
        </div>
      </Motion>
    </section>
  )
}
