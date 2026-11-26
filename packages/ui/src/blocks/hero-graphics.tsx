"use client"

import { useEffect, useId, useRef, useState, type PointerEvent } from "react"
import { cn } from "@ankvale/ui/lib/utils"

const focus =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
const ease =
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"

/** Original vector artwork. Rotate the construction without an idle animation loop. */
export function HeroSculpture({
  className,
  form = "fold",
}: {
  className?: string
  form?: "fold" | "orbit"
}) {
  const [rotation, setRotation] = useState(0)
  return (
    <div data-slot="hero-sculpture" className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Rotate the blue sculpture"
        onClick={() => setRotation((value) => value + 37)}
        className={cn("group block w-full rounded-sm", focus)}
      >
        <svg
          viewBox="0 0 600 550"
          fill="none"
          aria-hidden="true"
          className="h-auto w-full overflow-visible"
        >
          <ellipse
            cx="300"
            cy="492"
            rx="164"
            ry="10"
            fill="currentColor"
            opacity=".035"
          />
          <path
            d="M65 442H535M300 44v420"
            stroke="currentColor"
            strokeOpacity=".12"
            strokeDasharray="3 7"
          />
          <circle
            cx="300"
            cy="264"
            r="207"
            stroke="currentColor"
            strokeOpacity=".1"
          />
          <g
            className={ease}
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "300px 264px",
            }}
          >
            {form === "fold" ? (
              Array.from({ length: 12 }, (_, i) => (
                <g key={i} transform={`rotate(${i * 30} 300 264)`}>
                  <path
                    d="M300 264C212 218 169 133 224 77C281 97 312 174 300 264Z"
                    fill={i % 3 === 0 ? "#191919" : "#0d6efd"}
                    stroke="var(--background)"
                    strokeWidth="1.5"
                  />
                  <path d="M300 264 224 77" stroke="white" strokeOpacity=".3" />
                </g>
              ))
            ) : (
              <>
                {Array.from({ length: 9 }, (_, i) => (
                  <ellipse
                    key={i}
                    cx="300"
                    cy="264"
                    rx={198 - i * 12}
                    ry={68 + i * 12}
                    transform={`rotate(${i * 20} 300 264)`}
                    stroke={i % 3 === 0 ? "currentColor" : "#0d6efd"}
                    strokeWidth="2"
                  />
                ))}
                <circle cx="300" cy="264" r="39" fill="#0d6efd" />
                <circle cx="300" cy="264" r="10" fill="white" />
              </>
            )}
          </g>
          <path
            d="M75 62h16m-8-8v16M515 465h16m-8-8v16"
            stroke="currentColor"
            strokeOpacity=".4"
          />
        </svg>
      </button>
      <div className="mt-1 flex items-center justify-between border-t border-current/15 pt-4 font-mono text-[10px] text-muted-foreground">
        <span>FORM / {form === "fold" ? "01" : "02"}</span>
        <span className="flex items-center gap-2">
          Click to rotate <span aria-hidden="true">↗</span>
        </span>
      </div>
    </div>
  )
}

/** A poster, not a remote image: all shapes remain sharp at any screen size. */
export function HeroPoster({
  className,
  initial = "blue",
}: {
  className?: string
  initial?: "paper" | "blue" | "ink"
}) {
  const [palette, setPalette] = useState(initial)
  const background =
    palette === "blue" ? "#0d6efd" : palette === "ink" ? "#191919" : "#f5f7fa"
  const ink = palette === "paper" ? "#191919" : "#ffffff"
  return (
    <div data-slot="hero-poster" className={cn("relative", className)}>
      <div
        className={cn("relative aspect-[4/5] overflow-hidden rounded-sm", ease)}
        style={{ backgroundColor: background, color: ink }}
      >
        <div className="absolute inset-x-0 top-0 z-10 flex justify-between p-[7%] font-mono text-[10px]">
          <span>FORM STUDIES</span>
          <span>VOL. 01</span>
        </div>
        <svg
          viewBox="0 0 480 600"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          fill="none"
        >
          <path d="M-60 465 190 170 540 465" stroke={ink} strokeWidth="1" />
          {Array.from({ length: 15 }, (_, i) => (
            <path
              key={i}
              d={`M${34 + i * 11} 480V${240 + i * 3}a${206 - i * 11} ${206 - i * 11} 0 0 1 ${412 - i * 22} 0V480`}
              stroke={ink}
              strokeWidth="1.3"
              opacity={i % 4 === 0 ? 1 : 0.52}
            />
          ))}
          <circle
            cx="240"
            cy="326"
            r="82"
            fill={palette === "paper" ? "#0d6efd" : ink}
          />
          <path
            d="M240 244v164M158 326h164"
            stroke={background}
            strokeWidth="1"
          />
          <path d="M33 481h414" stroke={ink} />
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${34 + i * 52} 481 240 600`}
              stroke={ink}
              strokeOpacity=".5"
            />
          ))}
        </svg>
        <span className="absolute bottom-[7%] left-[7%] text-[clamp(2rem,5cqw,4.5rem)] leading-none font-semibold tracking-[-.07em]">
          A new
          <br />
          perspective.
        </span>
      </div>
      <div
        role="group"
        aria-label="Poster palette"
        className="mt-4 flex items-center gap-2"
      >
        {(["paper", "blue", "ink"] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={palette === name}
            onClick={() => setPalette(name)}
            className={cn(
              "min-h-9 rounded px-3 text-xs capitalize",
              focus,
              palette === name
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {name}
          </button>
        ))}
        <span className="ms-auto font-mono text-[10px] text-muted-foreground">
          SELECT A PALETTE
        </span>
      </div>
    </div>
  )
}

const initialTasks = [
  { id: "brief", title: "Write the brief", tag: "Planning", done: true },
  { id: "design", title: "Design the homepage", tag: "Design", done: false },
  { id: "review", title: "Review with the team", tag: "Feedback", done: false },
  { id: "ship", title: "Publish the website", tag: "Launch", done: false },
]
export function HeroWorkspace({ className }: { className?: string }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState<"board" | "list">("board")
  const pendingFocus = useRef<string | null>(null)
  const taskButtons = useRef<Record<string, HTMLButtonElement | null>>({})
  useEffect(() => {
    const id = pendingFocus.current
    if (id) taskButtons.current[id]?.focus({ preventScroll: true })
    pendingFocus.current = null
  }, [tasks])
  function toggle(id: string, restoreFocus = false) {
    if (restoreFocus) pendingFocus.current = id
    setTasks((items) =>
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
  }
  return (
    <div
      data-slot="hero-workspace"
      className={cn(
        "@container/workspace overflow-hidden rounded-lg border bg-white text-[#191919] shadow-[0_16px_60px_-24px_rgb(0_0_0/18%)]",
        className
      )}
    >
      <div className="flex h-11 items-center gap-2 border-b border-[#e7e7e7] px-4">
        <span className="size-2 rounded-full bg-[#d6d6d6]" />
        <span className="size-2 rounded-full bg-[#d6d6d6]" />
        <span className="size-2 rounded-full bg-[#d6d6d6]" />
        <span className="ms-auto font-mono text-[9px] text-[#777]">
          workspace / launch
        </span>
      </div>
      <div className="flex min-h-[320px]">
        <div className="hidden w-40 shrink-0 border-r border-[#e7e7e7] p-4 @3xl/workspace:block">
          <p className="mb-8 text-xs font-semibold">↗ Studio workspace</p>
          {["Overview", "Projects", "Documents"].map((item) => (
            <div
              key={item}
              className={cn(
                "mb-2 rounded px-2 py-2 text-[11px]",
                item === "Projects" ? "bg-[#f0f0f0] font-medium" : "text-[#777]"
              )}
            >
              {item}
            </div>
          ))}
          <div className="mt-14 border-t border-[#e7e7e7] pt-3 text-[10px] text-[#777]">
            Alex’s workspace
          </div>
        </div>
        <div className="min-w-0 flex-1 p-5 @lg/workspace:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 text-[10px] text-[#777]">Projects / Website</p>
              <h3 className="text-xl font-semibold tracking-tight @lg/workspace:text-2xl">
                Website launch<span className="text-[#0d6efd]">.</span>
              </h3>
            </div>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e8f3ff] text-[10px] font-semibold text-[#1769aa]">
              AL
            </span>
          </div>
          <div
            className="mt-6 mb-5 flex items-center gap-5 border-b border-[#e7e7e7]"
            role="group"
            aria-label="Project view"
          >
            {(["board", "list"] as const).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={view === name}
                onClick={() => setView(name)}
                className={cn(
                  "border-b-2 pb-3 text-[11px] capitalize",
                  focus,
                  view === name
                    ? "border-[#191919] font-medium"
                    : "border-transparent text-[#777]"
                )}
              >
                {name === "board" ? "▦" : "☰"} {name}
              </button>
            ))}
            <span
              className="ms-auto pb-3 text-[10px] text-[#777]"
              aria-live="polite"
            >
              {tasks.filter((task) => task.done).length} / {tasks.length}{" "}
              complete
            </span>
          </div>
          {view === "board" ? (
            <div className="grid grid-cols-2 gap-3">
              {[false, true].map((done) => (
                <div key={String(done)}>
                  <div className="mb-3 flex items-center gap-2 text-[10px] text-[#777]">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        done ? "bg-[#287354]" : "bg-[#0d6efd]"
                      )}
                    />
                    {done ? "Done" : "In progress"}
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((task) => task.done === done)
                      .map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          aria-label={`Mark ${task.title} ${task.done ? "in progress" : "complete"}`}
                          ref={(element) => {
                            taskButtons.current[task.id] = element
                          }}
                          onClick={() => toggle(task.id, true)}
                          className={cn(
                            "group w-full rounded-md border border-[#e7e7e7] bg-white p-3 text-left transition-colors hover:border-[#0d6efd]",
                            focus
                          )}
                        >
                          <span className="mb-3 block text-[9px] text-[#777]">
                            {task.tag}
                          </span>
                          <span className="flex items-start justify-between gap-1 text-[11px] font-medium">
                            {task.title}
                            <span
                              className={cn(
                                "shrink-0",
                                done
                                  ? "text-[#287354]"
                                  : "text-[#aaa] group-hover:text-[#0d6efd]"
                              )}
                              aria-hidden="true"
                            >
                              {done ? "✓" : "↗"}
                            </span>
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[#e7e7e7]">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggle(task.id)}
                    className="accent-[#0d6efd]"
                  />
                  <span className={task.done ? "text-[#777] line-through" : ""}>
                    {task.title}
                  </span>
                  <span className="ms-auto text-[9px] text-[#777]">
                    {task.tag}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const stages = [
  {
    label: "Brief",
    title: "Set the project brief.",
    items: [
      "Define the audience",
      "Set the project scope",
      "Gather references",
    ],
  },
  {
    label: "Design",
    title: "Design the homepage.",
    items: [
      "Explore the direction",
      "Build the prototype",
      "Review the details",
    ],
  },
  {
    label: "Launch",
    title: "Prepare for launch.",
    items: [
      "Run the final checks",
      "Publish the project",
      "Share with the team",
    ],
  },
]
export function HeroWorkflow({ className }: { className?: string }) {
  const [stage, setStage] = useState(1)
  const patternId = useId().replaceAll(":", "")
  return (
    <div
      data-slot="hero-workflow"
      className={cn(
        "relative overflow-hidden rounded-lg border bg-[#f7f9fc] p-5 text-[#191919] @md:p-8",
        className
      )}
    >
      <div className="mb-7 flex items-center justify-between font-mono text-[9px] text-[#777]">
        <span>PROJECT / WEBSITE</span>
        <span>INTERACTIVE PREVIEW ↘</span>
      </div>
      <div className="relative flex aspect-[1.45] min-h-[240px] items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 500 350"
          aria-hidden="true"
          fill="none"
        >
          <defs>
            <pattern
              id={patternId}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".7" fill="#b7c4d7" />
            </pattern>
          </defs>
          <rect width="500" height="350" fill={`url(#${patternId})`} />
          <circle cx="250" cy="175" r="127" stroke="#d5dfed" />
          <path d="M85 175H415M250 48v254" stroke="#d5dfed" />
          <path
            d={
              stage === 0
                ? "M95 65Q250 65 250 175"
                : stage === 1
                  ? "M405 65Q250 65 250 175"
                  : "M405 285Q250 285 250 175"
            }
            stroke="#0d6efd"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
        </svg>
        <div
          key={stage}
          className="relative z-10 w-[75%] max-w-[280px] rounded-xl border border-[#e3e8f0] bg-white p-5 shadow-[0_8px_32px_-12px_rgb(0_0_0/12%)] @md:p-6"
          data-slot="hero-workflow-card"
        >
          <span
            className="mb-4 flex size-9 items-center justify-center rounded-lg bg-[#0d6efd] text-lg text-white"
            aria-hidden="true"
          >
            {["✳", "✎", "↗"][stage]}
          </span>
          <h3 className="max-w-[12em] text-lg leading-tight font-semibold tracking-tight">
            {stages[stage]!.title}
          </h3>
          <ul className="mt-5 space-y-2.5">
            {stages[stage]!.items.map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[10px] text-[#666]"
              >
                <span
                  className={cn(
                    "flex size-3 items-center justify-center rounded-full border text-[8px]",
                    i === 0
                      ? "border-[#0d6efd] bg-[#0d6efd] text-white"
                      : "border-[#ddd]"
                  )}
                >
                  {i === 0 ? "✓" : ""}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <span
          aria-hidden="true"
          className="absolute top-0 left-[7%] flex size-12 rotate-[-12deg] items-center justify-center rounded-xl border border-[#e3e8f0] bg-white text-2xl text-[#0d6efd]"
        >
          ✳
        </span>
        <span
          aria-hidden="true"
          className="absolute right-[2%] bottom-[4%] flex size-14 rotate-[12deg] items-center justify-center rounded-full bg-[#0d6efd] text-2xl text-white"
        >
          ↗
        </span>
      </div>
      <div
        className="relative mt-8 flex border-t border-[#dfe5ee] pt-5"
        role="group"
        aria-label="Workflow stage"
      >
        {stages.map((item, index) => (
          <button
            type="button"
            key={item.label}
            aria-pressed={stage === index}
            onClick={() => setStage(index)}
            className={cn(
              "flex min-h-10 flex-1 items-center justify-center gap-2 rounded text-xs",
              focus,
              ease,
              stage === index
                ? "bg-[#191919] text-white"
                : "text-[#777] hover:text-[#191919]"
            )}
          >
            <span className="font-mono text-[9px] opacity-60">
              0{index + 1}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

type CanvasCard = {
  id: string
  title: string
  detail: string
  x: number
  y: number
  blue?: boolean
}
const initialCards: CanvasCard[] = [
  {
    id: "idea",
    title: "The big idea",
    detail: "Website redesign.",
    x: 7,
    y: 10,
  },
  {
    id: "plan",
    title: "Make a plan",
    detail: "Audience, scope, and timeline.",
    x: 57,
    y: 30,
    blue: true,
  },
  {
    id: "next",
    title: "What comes next?",
    detail: "Prototype, review, and launch.",
    x: 22,
    y: 58,
  },
]
export function HeroCanvasVisual({ className }: { className?: string }) {
  const [cards, setCards] = useState(initialCards)
  const [selected, setSelected] = useState("plan")
  const board = useRef<HTMLDivElement>(null)
  const [halfCard, setHalfCard] = useState(17)
  useEffect(() => {
    const element = board.current
    if (!element) return
    const measure = () => {
      const width = element.getBoundingClientRect().width
      if (width) setHalfCard((Math.min(width * 0.34, 190) / width) * 50)
    }
    measure()
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure)
      return () => window.removeEventListener("resize", measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const drag = useRef<{
    id: string
    x: number
    y: number
    originalX: number
    originalY: number
  } | null>(null)
  const hint = useId(),
    pattern = useId().replaceAll(":", "")
  function move(id: string, x: number, y: number) {
    const element = board.current
    const card = element?.querySelector<HTMLElement>(`[data-card-id="${id}"]`)
    const maxY =
      element?.clientHeight && card?.offsetHeight
        ? 96 - (card.offsetHeight / element.clientHeight) * 100
        : 64
    setCards((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.max(3, Math.min(96 - halfCard * 2, x)),
              y: Math.max(4, Math.min(maxY, y)),
            }
          : item
      )
    )
  }
  function start(event: PointerEvent<HTMLButtonElement>, item: CanvasCard) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelected(item.id)
    drag.current = {
      id: item.id,
      x: event.clientX,
      y: event.clientY,
      originalX: item.x,
      originalY: item.y,
    }
  }
  return (
    <div
      data-slot="hero-canvas-visual"
      className={cn(
        "overflow-hidden rounded-lg border bg-white text-[#191919]",
        className
      )}
    >
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-[#e7e7e7] px-4 text-[11px]">
        <span className="font-medium">↗ Untitled canvas</span>
        <button
          type="button"
          onClick={() => {
            setCards(initialCards)
            setSelected("plan")
          }}
          className={cn(
            "rounded px-2 py-2 text-[#777] hover:bg-[#f5f5f5]",
            focus
          )}
        >
          Reset layout ↺
        </button>
      </div>
      <div
        ref={board}
        data-hero-canvas
        className="relative h-[clamp(360px,40cqw,520px)] min-h-[480px] overflow-hidden @2xl:min-h-[360px]"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id={pattern}
              width="3"
              height="5"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".1" fill="#bfc7d4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#${pattern})`} />
          {cards.slice(1).map((card, i) => (
            <path
              key={card.id}
              d={`M${cards[i]!.x + halfCard} ${cards[i]!.y + 12} C${cards[i]!.x + 45} ${cards[i]!.y + 12}, ${card.x - 10} ${card.y + 12}, ${card.x + halfCard} ${card.y + 12}`}
              fill="none"
              stroke="#a8bad4"
              strokeWidth=".3"
            />
          ))}
        </svg>
        {cards.map((item, index) => (
          <button
            type="button"
            key={item.id}
            data-card-id={item.id}
            aria-pressed={selected === item.id}
            aria-label={`${item.title}. Use arrow keys to move.`}
            aria-describedby={hint}
            onClick={() => setSelected(item.id)}
            onPointerDown={(event) => start(event, item)}
            onPointerMove={(event) => {
              const active = drag.current
              if (!active || active.id !== item.id) return
              const bounds =
                event.currentTarget.parentElement!.getBoundingClientRect()
              if (bounds.width && bounds.height)
                move(
                  item.id,
                  active.originalX +
                    ((event.clientX - active.x) / bounds.width) * 100,
                  active.originalY +
                    ((event.clientY - active.y) / bounds.height) * 100
                )
            }}
            onPointerUp={() => {
              drag.current = null
            }}
            onPointerCancel={() => {
              drag.current = null
            }}
            onLostPointerCapture={() => {
              drag.current = null
            }}
            onKeyDown={(event) => {
              const delta = (
                {
                  ArrowLeft: [-3, 0],
                  ArrowRight: [3, 0],
                  ArrowUp: [0, -3],
                  ArrowDown: [0, 3],
                } as Record<string, number[]>
              )[event.key]
              if (delta) {
                event.preventDefault()
                move(item.id, item.x + delta[0]!, item.y + delta[1]!)
              }
            }}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            className={cn(
              "absolute w-[34%] max-w-[190px] cursor-grab touch-none rounded-lg border p-4 text-start shadow-[0_4px_12px_rgb(0_0_0/4%)] outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd] focus-visible:ring-offset-4 active:cursor-grabbing",
              item.blue
                ? "border-[#0d6efd] bg-[#0d6efd] text-white"
                : "border-[#e3e6ec] bg-white text-[#191919]",
              selected === item.id && "z-10 ring-1 ring-[#0d6efd] ring-offset-4"
            )}
          >
            <span className="mb-4 block text-lg" aria-hidden="true">
              {["✳", "↗", "✎"][index]}
            </span>
            <span className="block text-[13px] leading-tight font-semibold">
              {item.title}
            </span>
            <span
              className={cn(
                "mt-2 block text-[10px] leading-relaxed",
                item.blue ? "text-white" : "text-[#777]"
              )}
            >
              {item.detail}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[#e7e7e7] px-4 py-3 text-[9px] text-[#777]">
        <span id={hint}>Drag cards, or use the arrow keys.</span>
        <span className="font-mono">100%</span>
      </div>
    </div>
  )
}

const people = [
  { name: "Alex Lee", role: "Design", initial: "AL", x: 18, y: 18 },
  { name: "Jamie Chen", role: "Engineering", initial: "JC", x: 72, y: 12 },
  { name: "Sam Rivera", role: "Product", initial: "SR", x: 80, y: 69 },
  { name: "Taylor Brooks", role: "Research", initial: "TB", x: 9, y: 66 },
]
export function HeroTeamVisual({ className }: { className?: string }) {
  const [active, setActive] = useState(0)
  return (
    <div
      data-slot="hero-team-visual"
      className={cn(
        "relative mx-auto aspect-[1.8] min-h-[290px] w-full max-w-3xl",
        className
      )}
    >
      <svg
        viewBox="0 0 1000 550"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <ellipse
          cx="500"
          cy="275"
          rx="370"
          ry="200"
          stroke="currentColor"
          strokeOpacity=".1"
        />
        <ellipse
          cx="500"
          cy="275"
          rx="230"
          ry="125"
          stroke="#0d6efd"
          strokeOpacity=".3"
        />
        {people.map((person, i) => (
          <path
            key={person.name}
            d={`M${person.x * 10 + 25} ${person.y * 5.5 + 25}Q500 275 500 275`}
            stroke={i === active ? "#0d6efd" : "currentColor"}
            strokeOpacity={i === active ? 1 : 0.15}
            strokeDasharray={i === active ? undefined : "3 5"}
            className={ease}
          />
        ))}
      </svg>
      <div className="absolute top-1/2 left-1/2 w-[46%] max-w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-5 text-center shadow-[0_6px_24px_rgb(0_0_0/4%)]">
        <span
          className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary text-xl text-primary-foreground"
          aria-hidden="true"
        >
          ✳
        </span>
        <p className="text-sm font-semibold">Launch plan</p>
        <div aria-live="polite" className="mt-4 border-t pt-3 text-[11px]">
          <span className="font-medium">{people[active]!.name}</span>
          <span className="mt-1 block text-muted-foreground">
            {people[active]!.role}
          </span>
        </div>
      </div>
      {people.map((person, i) => (
        <button
          key={person.name}
          type="button"
          aria-label={`View ${person.name}`}
          aria-pressed={active === i}
          onClick={() => setActive(i)}
          style={{ left: `${person.x}%`, top: `${person.y}%` }}
          className={cn(
            "absolute flex size-12 items-center justify-center rounded-full border-4 border-background text-xs font-semibold @md:size-16",
            focus,
            ease,
            active === i
              ? "scale-110 bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-accent"
          )}
        >
          <span>{person.initial}</span>
        </button>
      ))}
    </div>
  )
}

export function HeroIndexVisual({ className }: { className?: string }) {
  const [open, setOpen] = useState(1)
  const panelId = useId()
  return (
    <div
      data-slot="hero-index-visual"
      className={cn("border-t border-foreground", className)}
    >
      {[
        {
          name: "Notes",
          detail: "Meeting notes, research, and drafts.",
          mark: "✎",
        },
        {
          name: "Projects",
          detail: "Tasks, milestones, and shared plans.",
          mark: "↗",
        },
        {
          name: "People",
          detail: "Collaborators and project owners.",
          mark: "✳",
        },
      ].map((item, i) => (
        <button
          key={item.name}
          type="button"
          onClick={() => setOpen(i)}
          aria-expanded={open === i}
          aria-controls={`${panelId}-${i}`}
          className={cn(
            "group w-full border-b py-5 text-start @lg:py-7",
            focus
          )}
        >
          <span className="flex items-center gap-4">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-lg",
                ease,
                open === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              )}
            >
              {item.mark}
            </span>
            <span className="text-2xl font-medium tracking-tight">
              {item.name}
            </span>
            <span
              className={cn(
                "ms-auto text-lg",
                ease,
                open === i ? "rotate-45 text-primary" : "text-muted-foreground"
              )}
            >
              ↗
            </span>
          </span>
          <span
            id={`${panelId}-${i}`}
            aria-hidden={open !== i}
            className={cn(
              "grid",
              ease,
              open === i
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <span className="overflow-hidden">
              <span className="block ps-14 pt-4 text-sm text-muted-foreground">
                {item.detail}
              </span>
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
