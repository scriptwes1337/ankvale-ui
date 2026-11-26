"use client"

import { useId, useRef, useState } from "react"
import {
  SquaresFourIcon,
  ListIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CaretRightIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  CircleHalfIcon,
  FlagIcon,
  PaperclipIcon,
  ChatCircleIcon,
  ArrowCounterClockwiseIcon,
  FolderSimpleIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Kanban, type KanbanColumn } from "@ankvale/ui/components/kanban"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@ankvale/ui/components/avatar"
import { Progress } from "@ankvale/ui/components/progress"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@ankvale/ui/components/command"
import { Input } from "@ankvale/ui/components/input"
import { Checkbox } from "@ankvale/ui/components/checkbox"
import { cn } from "@ankvale/ui/lib/utils"
import type { ProjectTask } from "@ankvale/ui/blocks/app-projects"
import { ShowcaseInspector } from "./showcase-inspector"

const people = [
  { id: "maya", name: "Maya Chen", initials: "MC" },
  { id: "alex", name: "Alex Rivera", initials: "AR" },
  { id: "jules", name: "Jules Park", initials: "JP" },
]
const statuses = [
  { id: "todo", label: "To do", icon: CircleDashedIcon },
  { id: "progress", label: "In progress", icon: CircleHalfIcon },
  { id: "done", label: "Done", icon: CheckCircleIcon },
]
type Task = ProjectTask & {
  project: string
  tag: string
  art?: "poster" | "interface"
}
const initialTasks: Task[] = [
  {
    id: "site-1",
    project: "Website relaunch",
    title: "Explore the art direction",
    description: "Review three concepts for the new homepage.",
    status: "progress",
    assignee: "maya",
    due: "2026-12-04",
    tag: "Design",
    art: "poster",
  },
  {
    id: "site-2",
    project: "Website relaunch",
    title: "Map the customer journey",
    description: "Outline signup, setup and the first project.",
    status: "todo",
    assignee: "alex",
    due: "2026-12-03",
    tag: "Research",
  },
  {
    id: "site-3",
    project: "Website relaunch",
    title: "Make onboarding feel effortless",
    description: "Connect the welcome screen to project setup.",
    status: "todo",
    assignee: "jules",
    due: "2026-12-05",
    tag: "Product",
    art: "interface",
  },
  {
    id: "site-4",
    project: "Website relaunch",
    title: "Build the component kit",
    description: "Buttons, inputs, overlays and navigation.",
    status: "done",
    assignee: "jules",
    due: "2026-12-02",
    tag: "Development",
  },
  {
    id: "site-5",
    project: "Website relaunch",
    title: "Set the type & colour",
    description: "Inter, a 4px scale and the primary palette.",
    status: "done",
    assignee: "maya",
    due: "2026-12-01",
    tag: "Design",
  },
  {
    id: "site-6",
    project: "Website relaunch",
    title: "Write the launch story",
    description: "Draft the release notes and product email.",
    status: "progress",
    assignee: "alex",
    due: "2026-12-06",
    tag: "Content",
  },
  {
    id: "mobile-1",
    project: "Mobile app",
    title: "Sketch the home screen",
    description: "Start with what matters today.",
    status: "progress",
    assignee: "maya",
    due: "2026-12-08",
    tag: "Design",
    art: "interface",
  },
  {
    id: "mobile-2",
    project: "Mobile app",
    title: "Test the navigation",
    description: "Make every destination easy to find.",
    status: "todo",
    assignee: "alex",
    due: "2026-12-09",
    tag: "Research",
  },
  {
    id: "mobile-3",
    project: "Mobile app",
    title: "Define the first release",
    description: "A small, useful beginning.",
    status: "done",
    assignee: "jules",
    due: "2026-12-04",
    tag: "Product",
  },
  {
    id: "system-1",
    project: "Design system",
    title: "Give every state a name",
    description: "Loading, empty, ready. Every detail considered.",
    status: "todo",
    assignee: "maya",
    due: "2026-12-10",
    tag: "Design",
  },
  {
    id: "system-2",
    project: "Design system",
    title: "Document the foundations",
    description: "A reference the whole team can build on.",
    status: "progress",
    assignee: "alex",
    due: "2026-12-09",
    tag: "Content",
    art: "poster",
  },
  {
    id: "system-3",
    project: "Design system",
    title: "Review keyboard interactions",
    description: "A clear path through every component.",
    status: "done",
    assignee: "jules",
    due: "2026-12-07",
    tag: "Development",
  },
]
function Person({ id, size = "sm" }: { id: string; size?: "sm" | "default" }) {
  const person = people.find((person) => person.id === id)
  return (
    <Avatar
      size={size}
      title={person?.name}
      role="img"
      aria-label={person?.name ?? "Unassigned"}
    >
      <AvatarFallback
        className={cn(
          "border border-background text-[10px] font-medium",
          id === "maya"
            ? "bg-accent text-accent-foreground"
            : id === "alex"
              ? "bg-secondary text-foreground"
              : "bg-foreground text-background"
        )}
      >
        {person?.initials ?? "?"}
      </AvatarFallback>
    </Avatar>
  )
}
function TaskArt({ kind }: { kind: "poster" | "interface" }) {
  return kind === "poster" ? (
    <div
      aria-hidden="true"
      className="relative mt-3 flex h-28 overflow-hidden rounded bg-primary px-4 py-3 text-primary-foreground"
    >
      <span className="text-[30px] leading-[.95] font-semibold tracking-[-.06em]">
        Make
        <br />
        space.
      </span>
      <svg
        className="absolute -right-4 -bottom-5 size-32"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 5v90M5 50h90M18 18l64 64M18 82l64-64"
          stroke="currentColor"
          strokeWidth="12"
        />
      </svg>
      <span className="absolute bottom-2 left-4 text-[8px] tracking-widest">
        A NEW PERSPECTIVE
      </span>
    </div>
  ) : (
    <div
      aria-hidden="true"
      className="mt-3 space-y-2 rounded border bg-secondary/50 p-3"
    >
      <div className="flex items-center gap-1">
        <span className="size-1 rounded-full bg-muted-foreground/40" />
        <span className="size-1 rounded-full bg-muted-foreground/20" />
        <span className="size-1 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="flex gap-2">
        <span className="grid size-7 place-items-center rounded bg-accent text-primary">
          <SquaresFourIcon size={15} />
        </span>
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-1.5 w-3/4 rounded bg-foreground/20" />
          <div className="h-1 w-1/2 rounded bg-foreground/10" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="h-4 flex-1 rounded border bg-card" />
        <div className="h-4 w-10 rounded bg-primary" />
      </div>
    </div>
  )
}
export function ProjectWorkspace() {
  const id = useId(),
    nextId = useRef(1)
  const [tasks, setTasks] = useState(initialTasks),
    [project, setProject] = useState("Website relaunch"),
    [view, setView] = useState("board"),
    [mine, setMine] = useState(false),
    [search, setSearch] = useState(false),
    [editing, setEditing] = useState<Task | "new" | null>(null),
    [notice, setNotice] = useState("")
  const projectTasks = tasks.filter((task) => task.project === project),
    shown = projectTasks.filter((task) => !mine || task.assignee === "maya"),
    completed = projectTasks.filter((task) => task.status === "done").length,
    progress = Math.round((completed / projectTasks.length) * 100) || 0
  function save(form: HTMLFormElement) {
    const values = new FormData(form),
      title = String(values.get("title") ?? "").trim()
    if (!title) return
    const next: Task = {
      ...(editing !== "new" && editing
        ? editing
        : { id: `created-${nextId.current++}`, project, tag: "Product" }),
      title,
      status: String(values.get("status")),
      assignee: String(values.get("assignee")),
      due: String(values.get("due")),
      description: String(values.get("description")),
    }
    setTasks((current) =>
      editing === "new"
        ? [...current, next]
        : current.map((task) => (task.id === next.id ? next : task))
    )
    setNotice(`${editing === "new" ? "Added" : "Updated"} ${title}.`)
    setEditing(null)
  }
  function move(next: KanbanColumn[]) {
    setTasks((current) => {
      const byId = new Map(current.map((task) => [task.id, task]))
      const ordered = next.flatMap((column) =>
        column.cards.flatMap((card) => {
          const task = byId.get(card.id)
          return task ? [{ ...task, status: column.id }] : []
        })
      )
      const visible = new Set(ordered.map((task) => task.id))
      let index = 0
      return current.map((task) =>
        visible.has(task.id) ? ordered[index++]! : task
      )
    })
  }
  const columns: KanbanColumn[] = statuses.map((status) => ({
    id: status.id,
    title: status.label,
    cards: shown
      .filter((task) => task.status === status.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        content: (
          <>
            <TaskArtOrNone task={task} />
            <div className="mt-4 flex items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  task.tag === "Design"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {task.tag}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex items-center gap-1 text-[10px]">
                  <ChatCircleIcon size={12} />2
                </span>
                <Person id={task.assignee} />
              </div>
            </div>
            <button
              type="button"
              className="mt-3 flex min-h-11 w-full items-center justify-between rounded text-xs text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8"
              onClick={() => setEditing(task)}
            >
              Open task <ArrowUpRightIcon aria-hidden="true" />
            </button>
          </>
        ),
      })),
  }))
  return (
    <div id="workspace" className="scroll-mt-6">
      <div className="rounded-2xl border bg-secondary/50 p-1.5 shadow-[0_24px_80px_-45px_rgb(0_0_0_/_0.25)] sm:p-2">
        <div className="overflow-hidden rounded-xl border bg-background text-start">
          <div className="flex h-11 items-center justify-between border-b bg-card px-4 text-[11px] text-muted-foreground">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-foreground/20" />
              <span className="size-2 rounded-full bg-foreground/10" />
              <span className="size-2 rounded-full bg-foreground/10" />
            </div>
            <span>Studio workspace</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary" />
              Interactive preview
            </span>
          </div>
          <div className="flex min-w-0">
            <aside
              aria-label="Preview projects"
              className="hidden w-48 shrink-0 flex-col border-e bg-secondary/25 p-4 lg:flex"
            >
              <div className="mb-6 flex items-center gap-2.5 px-1 text-sm font-semibold">
                <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">
                  <SquaresFourIcon size={17} />
                </span>
                Studio
                <span className="ms-auto text-xs text-muted-foreground">⌄</span>
              </div>
              <button
                className="mb-6 flex min-h-9 items-center gap-2 rounded-md border bg-background px-2 text-xs text-muted-foreground outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setSearch(true)}
              >
                <MagnifyingGlassIcon />
                Find a task<span className="ms-auto text-[10px]">⌕</span>
              </button>
              <p className="mb-2 px-2 text-[11px] text-muted-foreground">
                Projects
              </p>
              {["Website relaunch", "Mobile app", "Design system"].map(
                (name) => (
                  <button
                    key={name}
                    aria-pressed={project === name}
                    onClick={() => {
                      setProject(name)
                      setMine(false)
                    }}
                    className={cn(
                      "mb-1 flex min-h-9 items-center gap-2 rounded-md px-2 text-start text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      project === name
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <FolderSimpleIcon size={15} />
                    {name}
                  </button>
                )
              )}
              <div className="mt-8 rounded-lg border bg-card p-3">
                <FlagIcon className="mb-2 text-primary" />
                <p className="text-xs font-medium">Launch review</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Friday, Dec 12 · 10:00
                </p>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-10">
                <Person id="maya" />
                <span className="text-[11px]">Maya&apos;s workspace</span>
              </div>
            </aside>
            <div className="min-w-0 flex-1">
              <div className="flex h-12 items-center justify-between gap-3 border-b px-4 text-xs sm:px-7">
                <span className="hidden min-w-0 items-center gap-2 text-muted-foreground lg:flex">
                  Projects <CaretRightIcon size={11} />
                  <span className="truncate text-foreground">{project}</span>
                </span>
                <select
                  aria-label="Preview project"
                  value={project}
                  onChange={(event) => {
                    setProject(event.target.value)
                    setMine(false)
                  }}
                  className="h-9 max-w-full min-w-0 rounded-md border bg-background px-2 text-xs lg:hidden"
                >
                  {["Website relaunch", "Mobile app", "Design system"].map(
                    (name) => (
                      <option key={name}>{name}</option>
                    )
                  )}
                </select>
                <div className="flex items-center gap-3">
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">
                    Private project
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Search workspace tasks"
                    onClick={() => setSearch(true)}
                  >
                    <MagnifyingGlassIcon />
                  </Button>
                </div>
              </div>
              <div className="px-4 pt-6 pb-4 sm:px-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-primary" />
                      Sprint 08 <span className="mx-1">/</span>Dec 1–12
                    </p>
                    <h2 className="text-2xl font-semibold tracking-[-.04em] sm:text-[30px]">
                      {project}
                    </h2>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Brand, product and the next release.
                    </p>
                  </div>
                  <AvatarGroup aria-label="Project team" className="mt-2">
                    {people.map((person) => (
                      <Person key={person.id} id={person.id} />
                    ))}
                  </AvatarGroup>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <div
                    className="flex items-center gap-1"
                    role="group"
                    aria-label="Workspace view"
                  >
                    {[
                      { id: "board", label: "Board", icon: SquaresFourIcon },
                      { id: "list", label: "List", icon: ListIcon },
                      { id: "overview", label: "Overview", icon: ChartBarIcon },
                    ].map((item) => (
                      <Button
                        key={item.id}
                        size="sm"
                        variant={view === item.id ? "secondary" : "ghost"}
                        aria-pressed={view === item.id}
                        onClick={() => setView(item.id)}
                        className="min-h-11 gap-1.5 text-xs sm:min-h-8"
                      >
                        <item.icon />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={mine ? "secondary" : "ghost"}
                      aria-pressed={mine}
                      onClick={() => setMine(!mine)}
                      className="text-xs"
                    >
                      My tasks
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setEditing("new")}
                      className="min-h-11 text-xs sm:min-h-8"
                    >
                      <PlusIcon />
                      New task
                    </Button>
                  </div>
                </div>
              </div>
              <div className="min-h-[380px] px-4 pb-6 sm:px-7">
                {view === "board" ? (
                  <Kanban
                    label="Launch project board"
                    columns={columns}
                    onColumnsChange={move}
                    className="[&_li]:shadow-xs [&_li>select]:min-h-8 [&_li>select]:w-full [&_li>select]:text-muted-foreground [&_section]:w-auto [&_section]:min-w-56 [&_section]:flex-1 [&_section]:border-0 [&_section]:bg-secondary/40 [&_section>header]:border-0 [&_section>header]:px-3"
                  />
                ) : view === "list" ? (
                  <ul className="divide-y">
                    {shown.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <Checkbox
                          checked={task.status === "done"}
                          onCheckedChange={(checked) =>
                            setTasks((current) =>
                              current.map((item) =>
                                item.id === task.id
                                  ? {
                                      ...item,
                                      status: checked ? "done" : "todo",
                                    }
                                  : item
                              )
                            )
                          }
                          aria-label={`Complete ${task.title}`}
                        />
                        <button
                          className="min-w-0 flex-1 rounded py-1 text-start text-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => setEditing(task)}
                        >
                          {task.title}
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {task.tag} · {task.due}
                          </span>
                        </button>
                        <Person id={task.assignee} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid gap-5 pt-2 sm:grid-cols-[1fr_1.1fr]">
                    <div className="rounded-xl border p-5">
                      <p className="text-xs text-muted-foreground">
                        Project progress
                      </p>
                      <p className="mt-3 text-5xl font-semibold tracking-[-.06em]">
                        {progress}
                        <span className="text-2xl text-muted-foreground">
                          %
                        </span>
                      </p>
                      <Progress
                        value={progress}
                        aria-label="Project completion"
                        className="mt-5 [&_[data-slot=progress-track]]:bg-secondary"
                      />
                      <p className="mt-3 text-xs text-muted-foreground">
                        {completed} of {projectTasks.length} tasks completed
                      </p>
                      <div className="mt-7 space-y-3">
                        {statuses.map((status) => (
                          <div
                            key={status.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <status.icon
                              className={
                                status.id === "done"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }
                            />
                            {status.label}
                            <span className="ms-auto font-mono">
                              {
                                projectTasks.filter(
                                  (task) => task.status === status.id
                                ).length
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border p-5">
                      <FlagIcon className="mb-4 size-6 text-primary" />
                      <h3 className="text-lg font-semibold tracking-tight">
                        Ready for the next chapter.
                      </h3>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                        Bring the new experience together, review the details,
                        and make room for what comes next.
                      </p>
                      <div className="mt-6 flex items-center gap-2 border-t pt-4 text-xs">
                        <CalendarBlankIcon className="text-muted-foreground" />
                        Launch review
                        <span className="ms-auto text-muted-foreground">
                          Dec 12
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <PaperclipIcon className="text-muted-foreground" />
                        Brand guidelines
                        <span className="ms-auto text-muted-foreground">
                          PDF
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {!shown.length && view !== "overview" && (
                  <p
                    role="status"
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No tasks here. Add one or turn off My tasks.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-[11px] sm:px-7">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="text-primary" />
                  <span>
                    {completed} of {projectTasks.length} completed
                  </span>
                  <Progress
                    aria-label="Launch progress"
                    value={progress}
                    className="w-20 [&_[data-slot=progress-track]]:bg-secondary"
                  />
                </div>
                <button
                  onClick={() => {
                    setTasks(initialTasks)
                    setProject("Website relaunch")
                    setView("board")
                    setMine(false)
                    setNotice("Preview reset.")
                  }}
                  className="flex min-h-8 items-center gap-1.5 rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowCounterClockwiseIcon />
                  Reset preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">
          Yours to explore. Changes stay in this preview.
        </p>
        <ShowcaseInspector
          title="Inside the project workspace"
          parts={[
            {
              name: "Project task model",
              href: "/blocks#app-project-detail",
              description:
                "The typed tasks shared with the ProjectDetail block.",
            },
            {
              name: "Kanban",
              href: "/docs/kanban",
              description: "Drag, move menus and keyboard reordering.",
            },
            {
              name: "Command",
              href: "/docs/command",
              description: "Searchable, keyboard-accessible task selection.",
            },
            {
              name: "Dialog, progress & avatars",
              href: "/playground#dialog",
              description: "The same shared controls, states and appearance.",
            },
          ]}
          recipe="Build a project workspace with Ankvale’s app-project-detail block. Add board and list views, task editing, team avatars and shared completion progress."
        />
      </div>
      <p role="status" className="sr-only">
        {notice}
      </p>
      <Dialog open={search} onOpenChange={setSearch}>
        <DialogContent className="p-2 sm:max-w-lg">
          <DialogTitle className="sr-only">Find a workspace task</DialogTitle>
          <DialogDescription className="sr-only">
            Search all projects and open a task to edit it.
          </DialogDescription>
          <Command label="Find a workspace task">
            <CommandInput
              placeholder="Find a task…"
              aria-label="Find a workspace task"
            />
            <CommandList>
              <CommandEmpty>No tasks found.</CommandEmpty>
              <CommandGroup heading="Project tasks">
                {tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={`${task.title} ${task.project}`}
                    onSelect={() => {
                      setSearch(false)
                      setProject(task.project)
                      setEditing(task)
                    }}
                  >
                    <CircleDashedIcon />
                    <span>
                      {task.title}
                      <span className="ms-2 text-xs text-muted-foreground">
                        {task.project}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogTitle>
            {editing === "new" ? "New task" : "Edit task"}
          </DialogTitle>
          <DialogDescription>Keep the next step clear.</DialogDescription>
          {editing && (
            <form
              key={editing === "new" ? "new" : editing.id}
              onSubmit={(event) => {
                event.preventDefault()
                save(event.currentTarget)
              }}
              className="space-y-4"
            >
              <label htmlFor={`${id}-title`} className="grid gap-2 text-sm">
                Task title
                <Input
                  autoFocus
                  id={`${id}-title`}
                  name="title"
                  required
                  maxLength={100}
                  defaultValue={editing === "new" ? "" : editing.title}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2 text-sm">
                  Status
                  <select
                    name="status"
                    defaultValue={editing === "new" ? "todo" : editing.status}
                    className="h-10 rounded-md border bg-background px-2 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Assignee
                  <select
                    name="assignee"
                    defaultValue={editing === "new" ? "maya" : editing.assignee}
                    className="h-10 rounded-md border bg-background px-2 text-sm"
                  >
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                Due date
                <Input
                  name="due"
                  type="date"
                  defaultValue={editing === "new" ? "2026-12-04" : editing.due}
                />
              </label>
              <label className="grid gap-2 text-sm">
                Description
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing === "new" ? "" : editing.description}
                  className="w-full resize-y rounded-md border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editing === "new" ? "Create task" : "Save task"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
function TaskArtOrNone({ task }: { task: Task }) {
  return task.art ? <TaskArt kind={task.art} /> : null
}
