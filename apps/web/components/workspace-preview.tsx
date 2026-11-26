"use client"

import { useState } from "react"
import { BrandMark } from "@/components/brand-mark"
import {
  SquaresFourIcon,
  FileTextIcon,
  StarIcon,
  PlusIcon,
  CheckIcon,
  SlidersHorizontalIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Checkbox } from "@ankvale/ui/components/checkbox"
import { Switch } from "@ankvale/ui/components/switch"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@ankvale/ui/components/popover"
import { Input } from "@ankvale/ui/components/input"
import { cn } from "@ankvale/ui/lib/utils"

export function WorkspacePreview({ compact = false }: { compact?: boolean }) {
  const [completed, setCompleted] = useState<string[]>(["Review the brief"])
  const [project, setProject] = useState("Overview")
  const [notes, setNotes] = useState(false)
  const [tasks, setTasks] = useState([
    "Review the brief",
    "Update the designs",
    "Share with the team",
  ])
  const [newTask, setNewTask] = useState("")
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-xl border p-3 sm:p-5",
        "border-border bg-muted"
      )}
    >
      <div
        className={cn(
          "relative flex min-h-[380px] overflow-hidden rounded-lg border shadow-xs sm:min-h-[420px]",
          "border-border bg-card"
        )}
      >
        <aside
          className={cn(
            "hidden w-44 shrink-0 flex-col border-e p-4 md:flex",
            "bg-sidebar",
            compact && "md:hidden"
          )}
          aria-label="Demo workspace navigation"
        >
          <div className="mb-8 flex items-center gap-2 text-sm font-semibold">
            <BrandMark className="w-6" />
            Studio workspace
          </div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <MagnifyingGlassIcon />
            WORKSPACE
          </div>
          {[
            ["Overview", SquaresFourIcon],
            ["Documents", FileTextIcon],
            ["Favorites", StarIcon],
          ].map(([name, Icon]) => {
            const ItemIcon = Icon as typeof SquaresFourIcon
            return (
              <button
                key={name as string}
                onClick={() => setProject(name as string)}
                aria-pressed={project === name}
                className={cn(
                  "mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm",
                  project === name
                    ? "bg-sidebar-accent"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ItemIcon size={16} />
                {name as string}
              </button>
            )
          })}
          <div className="mt-auto flex items-center gap-2 border-t border-foreground/10 pt-4 text-xs">
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-foreground">
              AL
            </span>
            Alex&apos;s workspace
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "flex h-12 items-center justify-between border-b px-5 text-xs",
              "border-border"
            )}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              Workspace
              <CaretRightIcon size={10} />
              <span className="text-foreground">{project}</span>
            </div>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Demo workspace preferences"
                  />
                }
              >
                <SlidersHorizontalIcon />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <PopoverTitle>Workspace preferences</PopoverTitle>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="workspace-notes" className="text-sm">
                    Show a welcome note
                  </label>
                  <Switch
                    id="workspace-notes"
                    checked={notes}
                    onCheckedChange={setNotes}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {project}
                </h3>
              </div>
              <span className="hidden rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-muted-foreground sm:block">
                Personal space
              </span>
            </div>
            {notes && (
              <p
                role="status"
                className="mt-4 rounded-lg bg-accent p-3 text-sm text-accent-foreground"
              >
                Welcome to the demo workspace.
              </p>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-[1.25fr_1fr]">
              <section
                className={cn(
                  "rounded-xl border p-4",
                  "border-border bg-background shadow-xs"
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Tasks</h4>
                  <span className="font-mono text-xs text-muted-foreground">
                    {completed.length}/{tasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <label
                      key={task}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Checkbox
                        aria-label={task}
                        checked={completed.includes(task)}
                        onCheckedChange={(checked) =>
                          setCompleted(
                            checked
                              ? [...completed, task]
                              : completed.filter((item) => item !== task)
                          )
                        }
                      />
                      <span
                        className={cn(
                          "min-w-0",
                          completed.includes(task) &&
                            "text-muted-foreground line-through"
                        )}
                      >
                        {task}
                      </span>
                    </label>
                  ))}
                </div>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (newTask.trim() && !tasks.includes(newTask.trim())) {
                      setTasks([...tasks, newTask.trim()])
                      setNewTask("")
                    }
                  }}
                >
                  <Input
                    aria-label="New demo task"
                    placeholder="Something to work on…"
                    className="h-7 border-0 bg-transparent px-0 text-xs shadow-none md:text-xs"
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    maxLength={60}
                  />
                  <Button
                    type="submit"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Add task"
                    disabled={!newTask.trim()}
                  >
                    <PlusIcon />
                  </Button>
                </form>
              </section>
              <section
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-4",
                  "border-border bg-background shadow-xs"
                )}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <FileTextIcon size={18} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Team note
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold">Website redesign</h4>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Review the updated homepage before the next team meeting.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckIcon size={13} />
                  All changes stay in this demo
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
