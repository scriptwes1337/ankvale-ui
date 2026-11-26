"use client"
import { useRef, useState, type ReactNode } from "react"
import { DotsSixVerticalIcon } from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export type KanbanCard = {
  id: string
  title: string
  description?: string
  content?: ReactNode
  disabled?: boolean
}
export type KanbanColumn = {
  id: string
  title: string
  cards: KanbanCard[]
  actions?: ReactNode
}
export type KanbanProps = {
  columns: KanbanColumn[]
  onColumnsChange: (columns: KanbanColumn[]) => void
  label?: string
  disabled?: boolean
  className?: string
}
export function moveKanbanCard(
  columns: KanbanColumn[],
  cardId: string,
  targetColumn: string,
  beforeCard?: string
) {
  const source = columns.find((column) =>
      column.cards.some((card) => card.id === cardId)
    ),
    target = columns.find((column) => column.id === targetColumn)
  const card = source?.cards.find((card) => card.id === cardId)
  if (!source || !target || !card || card.disabled || beforeCard === cardId)
    return columns
  return columns.map((column) => {
    const cards = column.cards.filter((card) => card.id !== cardId)
    if (column.id === targetColumn) {
      const index = beforeCard
        ? cards.findIndex((card) => card.id === beforeCard)
        : -1
      cards.splice(index < 0 ? cards.length : index, 0, card)
    }
    return { ...column, cards }
  })
}
export function Kanban({
  columns,
  onColumnsChange,
  label = "Board",
  disabled,
  className,
}: KanbanProps) {
  const dragged = useRef<string | null>(null)
  const [announcement, setAnnouncement] = useState("")
  function move(id: string, column: string, before?: string) {
    if (disabled) return
    const next = moveKanbanCard(columns, id, column, before)
    onColumnsChange(next)
    setAnnouncement(
      `Card moved to ${columns.find((c) => c.id === column)?.title ?? column}.`
    )
  }
  return (
    <div
      data-slot="kanban"
      role="region"
      aria-label={label}
      className={className}
    >
      <p className="sr-only">
        Drag cards to move them. Use each card’s move menu, or focus its handle
        and use arrow keys to reorder.
      </p>
      <div className="flex items-start gap-4 overflow-x-auto pb-3">
        {columns.map((column, columnIndex) => (
          <section
            key={column.id}
            aria-label={column.title}
            className="w-64 shrink-0 rounded-lg border bg-card"
            onDragOver={(e) => {
              if (!disabled) e.preventDefault()
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (dragged.current) move(dragged.current, column.id)
              dragged.current = null
            }}
          >
            <header className="flex items-center gap-2 border-b px-3 py-3">
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <span className="text-xs text-muted-foreground">
                {column.cards.length}
              </span>
              <span className="ms-auto">{column.actions}</span>
            </header>
            <ol className="min-h-20 space-y-2 p-2">
              {column.cards.map((card, index) => (
                <li
                  key={card.id}
                  className={cn(
                    "rounded-md border bg-card p-3",
                    (disabled || card.disabled) && "opacity-50"
                  )}
                  onDragOver={(e) => {
                    if (!disabled && !card.disabled) e.preventDefault()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (dragged.current)
                      move(dragged.current, column.id, card.id)
                    dragged.current = null
                  }}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      disabled={disabled || card.disabled}
                      draggable={!disabled && !card.disabled}
                      aria-label={`Move ${card.title}`}
                      onDragStart={() => {
                        dragged.current = card.id
                      }}
                      onDragEnd={() => {
                        dragged.current = null
                      }}
                      onKeyDown={(e) => {
                        if (disabled || card.disabled) return
                        if (e.key === "ArrowUp" && index > 0) {
                          e.preventDefault()
                          move(card.id, column.id, column.cards[index - 1]!.id)
                        } else if (
                          e.key === "ArrowDown" &&
                          index < column.cards.length - 1
                        ) {
                          e.preventDefault()
                          move(card.id, column.id, column.cards[index + 2]?.id)
                        } else if (
                          e.key === "ArrowLeft" ||
                          e.key === "ArrowRight"
                        ) {
                          const target =
                            columns[
                              columnIndex + (e.key === "ArrowRight" ? 1 : -1)
                            ]
                          if (target) {
                            e.preventDefault()
                            move(card.id, target.id)
                          }
                        }
                      }}
                      className="-ms-1 rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <DotsSixVerticalIcon className="size-4" />
                    </button>
                    <h4 className="min-w-0 text-sm font-medium">
                      {card.title}
                    </h4>
                  </div>
                  {card.description && (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {card.description}
                    </p>
                  )}
                  {card.content}
                  <select
                    aria-label={`Move ${card.title} to column`}
                    disabled={disabled || card.disabled}
                    value={column.id}
                    onChange={(e) => move(card.id, e.target.value)}
                    className="mt-3 max-w-full rounded border bg-card px-2 py-1 text-xs"
                  >
                    {columns.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  )
}
