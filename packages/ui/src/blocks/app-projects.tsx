"use client"
import { useState } from "react"
import { Mentions, type MentionOption } from "@ankvale/ui/components/mentions"
import { Button } from "@ankvale/ui/components/button"
import { Calendar } from "@ankvale/ui/components/calendar"
import { Kanban, type KanbanColumn } from "@ankvale/ui/components/kanban"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import {
  AppSection,
  AppForm,
  AsyncAction,
  AsyncFileInput,
} from "@ankvale/ui/blocks/app-shared"
export type ProjectTask = {
  id: string
  title: string
  status: string
  assignee: string
  due: string
  description?: string
}
export function ProjectDetail({
  name,
  tasks,
  statuses,
  people,
  onSaveTask,
  onCreateTask,
  onTasksChange,
}: {
  name: string
  tasks: ProjectTask[]
  statuses: { id: string; label: string }[]
  people: { id: string; name: string }[]
  onSaveTask: (task: ProjectTask) => void | Promise<void>
  onCreateTask: (task: Omit<ProjectTask, "id">) => void | Promise<void>
  onTasksChange: (tasks: ProjectTask[]) => void | Promise<void>
}) {
  const [view, setView] = useState("board")
  const [date, setDate] = useState<Date | undefined>()
  const [editing, setEditing] = useState<ProjectTask | "new" | null>(null)
  const [error, setError] = useState(false)
  const columns: KanbanColumn[] = statuses.map((s) => ({
    id: s.id,
    title: s.label,
    cards: tasks
      .filter((t) => t.status === s.id)
      .map((t) => ({
        id: t.id,
        title: t.title,
        description: t.due,
        content: (
          <Button variant="ghost" size="sm" onClick={() => setEditing(t)}>
            Edit task
          </Button>
        ),
      })),
  }))
  const dateKey = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : ""
  return (
    <AppSection
      title={name}
      actions={<Button onClick={() => setEditing("new")}>Add task</Button>}
    >
      <label className="inline-grid gap-2 text-sm">
        Project view
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="h-9 rounded border bg-background px-3"
        >
          <option value="board">Board</option>
          <option value="list">List</option>
          <option value="calendar">Calendar</option>
        </select>
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Could not move the task. Try again.
        </p>
      )}
      {view === "board" ? (
        <Kanban
          columns={columns}
          onColumnsChange={async (next) => {
            setError(false)
            try {
              const byId = new Map(
                next.flatMap((c) =>
                  c.cards.map((card) => [card.id, c.id] as const)
                )
              )
              await onTasksChange(
                tasks.map((t) => ({ ...t, status: byId.get(t.id) ?? t.status }))
              )
            } catch {
              setError(true)
            }
          }}
        />
      ) : (
        <>
          {view === "calendar" && (
            <Calendar mode="single" selected={date} onSelect={setDate} />
          )}
          <ul className="divide-y">
            {tasks
              .filter(
                (t) => view !== "calendar" || !dateKey || t.due === dateKey
              )
              .map((task) => (
                <li
                  key={task.id}
                  className="flex flex-wrap justify-between gap-3 py-4"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {statuses.find((s) => s.id === task.status)?.label} ·{" "}
                      {people.find((p) => p.id === task.assignee)?.name ??
                        "Unassigned"}{" "}
                      · {task.due || "No due date"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(task)}
                  >
                    Edit task
                  </Button>
                </li>
              ))}
          </ul>
        </>
      )}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogTitle>
            {editing === "new" ? "Create task" : "Edit task"}
          </DialogTitle>
          <DialogDescription>
            Assign the work and set a due date.
          </DialogDescription>
          {editing && (
            <AppForm
              key={editing === "new" ? "new" : editing.id}
              fields={[
                { name: "title", label: "Task title", required: true },
                {
                  name: "status",
                  label: "Status",
                  type: "select",
                  required: true,
                  options: statuses.map((s) => ({
                    value: s.id,
                    label: s.label,
                  })),
                },
                {
                  name: "assignee",
                  label: "Assignee",
                  type: "select",
                  options: people.map((p) => ({ value: p.id, label: p.name })),
                },
                { name: "due", label: "Due date", description: "YYYY-MM-DD" },
                { name: "description", label: "Description", type: "textarea" },
              ]}
              initialValues={
                editing === "new"
                  ? { status: statuses[0]?.id ?? "" }
                  : {
                      title: editing.title,
                      status: editing.status,
                      assignee: editing.assignee,
                      due: editing.due,
                      description: editing.description ?? "",
                    }
              }
              onSubmit={async (values) => {
                const task = {
                  title: values.title ?? "",
                  status: values.status ?? "",
                  assignee: values.assignee ?? "",
                  due: values.due ?? "",
                  description: values.description ?? "",
                }
                if (editing === "new") await onCreateTask(task)
                else await onSaveTask({ id: editing.id, ...task })
                setEditing(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppSection>
  )
}
export type ThreadComment = {
  id: string
  author: string
  body: string
  time: string
  parentId?: string
  resolved?: boolean
  attachments?: { name: string; href: string }[]
  editable?: boolean
}
export function CommentThread({
  comments,
  onCreate,
  onEdit,
  onResolve,
  onAttach,
  mentionOptions = [],
}: {
  comments: ThreadComment[]
  onCreate: (body: string, parentId?: string) => void | Promise<void>
  onEdit: (id: string, body: string) => void | Promise<void>
  onResolve: (id: string, resolved: boolean) => void | Promise<void>
  onAttach?: (files: File[]) => void | Promise<void>
  mentionOptions?: MentionOption[]
}) {
  const [body, setBody] = useState("")
  const [reply, setReply] = useState<string | undefined>()
  const [editing, setEditing] = useState<string | null>(null)
  return (
    <AppSection title="Discussion">
      <ul className="space-y-5">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className={
              comment.parentId ? "ms-6 space-y-3 border-s ps-4" : "space-y-3"
            }
          >
            <div className="flex flex-wrap justify-between gap-3">
              <p className="text-sm font-medium">
                {comment.author}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {comment.time}
                  {comment.resolved ? " · Resolved" : ""}
                </span>
              </p>
              <AsyncAction
                variant="ghost"
                size="sm"
                onAction={() => onResolve(comment.id, !comment.resolved)}
              >
                {comment.resolved ? "Reopen" : "Resolve"}
              </AsyncAction>
            </div>
            {editing === comment.id ? (
              <AppForm
                fields={[
                  {
                    name: "body",
                    label: "Edit comment",
                    type: "textarea",
                    required: true,
                  },
                ]}
                initialValues={{ body: comment.body }}
                onSubmit={async (v) => {
                  await onEdit(comment.id, v.body ?? "")
                  setEditing(null)
                }}
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.body}
              </p>
            )}
            {comment.attachments?.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="block text-xs text-primary underline"
              >
                {a.name}
              </a>
            ))}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReply(comment.id)}
              >
                Reply
              </Button>
              {comment.editable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditing(editing === comment.id ? null : comment.id)
                  }
                >
                  {editing === comment.id ? "Cancel edit" : "Edit"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {reply && (
        <div className="flex items-center gap-2 text-sm">
          Replying to {comments.find((c) => c.id === reply)?.author}
          <Button variant="ghost" size="sm" onClick={() => setReply(undefined)}>
            Cancel reply
          </Button>
        </div>
      )}
      <Mentions
        label={reply ? "Reply" : "Add a comment"}
        options={mentionOptions}
        value={body}
        onValueChange={setBody}
      />
      <AsyncAction
        disabled={!body.trim()}
        onAction={async () => {
          await onCreate(body, reply)
          setBody("")
          setReply(undefined)
        }}
      >
        Post comment
      </AsyncAction>
      {onAttach && (
        <AsyncFileInput label="Attach files" multiple onFiles={onAttach} />
      )}
    </AppSection>
  )
}
