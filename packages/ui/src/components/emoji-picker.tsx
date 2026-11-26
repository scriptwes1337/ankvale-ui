"use client"
import { useState, useMemo, useRef, type KeyboardEvent } from "react"
import emojiData from "emojibase-data/en/compact.json"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"
export type EmojiItem = {
  emoji: string
  name: string
  category: string
  keywords?: string
  skins?: string[]
}
const categories = [
  "Faces",
  "People",
  "Gestures",
  "Nature",
  "Food",
  "Travel",
  "Activities",
  "Objects",
  "Symbols",
  "Flags",
]
export const emojiItems: EmojiItem[] = emojiData.map((item) => ({
  emoji: item.unicode,
  name: item.label,
  keywords: (item.tags ?? []).join(" "),
  category: categories[item.group ?? 8] ?? "Symbols",
  skins: Array.from(
    { length: 5 },
    (_, tone) =>
      item.skins?.find((skin) =>
        skin.hexcode
          .split("-")
          .includes((0x1f3fb + tone).toString(16).toUpperCase())
      )?.unicode ?? item.unicode
  ),
}))
export function EmojiPicker({
  onSelect,
  items = emojiItems,
  disabled,
  className,
  pageSize = 36,
  skinTone: controlledTone,
  defaultSkinTone = 0,
  onSkinToneChange,
}: {
  onSelect: (emoji: string) => void
  items?: EmojiItem[]
  disabled?: boolean
  className?: string
  pageSize?: number
  skinTone?: number
  defaultSkinTone?: number
  onSkinToneChange?: (tone: number) => void
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [page, setPage] = useState(0),
    [tone, setTone] = useState(defaultSkinTone)
  const grid = useRef<HTMLDivElement>(null)
  const chosenTone = Math.max(0, Math.min(5, controlledTone ?? tone))
  const size = Math.max(6, Math.min(120, Math.floor(pageSize) || 36))
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          (`${item.name} ${item.keywords ?? ""}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()) ||
            item.emoji === query)
      ),
    [items, category, query]
  )
  const pages = Math.max(1, Math.ceil(filtered.length / size)),
    currentPage = Math.min(page, pages - 1),
    shown = filtered.slice(currentPage * size, (currentPage + 1) * size)
  function key(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (event.key === "ArrowRight") next++
    else if (event.key === "ArrowLeft") next--
    else if (event.key === "ArrowDown") next += 6
    else if (event.key === "ArrowUp") next -= 6
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = shown.length - 1
    else return
    event.preventDefault()
    const buttons =
      grid.current?.querySelectorAll<HTMLButtonElement>("[data-emoji]")
    buttons?.[Math.max(0, Math.min(shown.length - 1, next))]?.focus()
  }
  return (
    <div
      data-slot="emoji-picker"
      className={cn(
        "w-80 max-w-full space-y-3 rounded-lg border bg-popover p-3",
        className
      )}
    >
      <Input
        aria-label="Search emoji"
        placeholder="Search emoji…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setPage(0)
        }}
        disabled={disabled}
      />
      <div
        className="flex gap-1 overflow-x-auto pb-1"
        role="group"
        aria-label="Emoji categories"
      >
        {["All", ...new Set(items.map((item) => item.category))].map((name) => (
          <button
            type="button"
            key={name}
            aria-pressed={name === category}
            onClick={() => {
              setCategory(name)
              setPage(0)
            }}
            disabled={disabled}
            className={cn(
              "shrink-0 rounded px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
              name === category && "bg-accent text-accent-foreground"
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <label className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        Skin tone
        <select
          aria-label="Skin tone"
          disabled={disabled}
          value={chosenTone}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (controlledTone === undefined) setTone(value)
            onSkinToneChange?.(value)
          }}
          className="rounded border bg-popover px-2 py-1 text-foreground"
        >
          {[
            "Default",
            "Light",
            "Medium light",
            "Medium",
            "Medium dark",
            "Dark",
          ].map((name, i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <div
        ref={grid}
        role="group"
        aria-label="Emoji"
        className="grid min-h-32 grid-cols-6 gap-1"
      >
        {shown.map((item, index) => {
          const emoji = chosenTone
            ? (item.skins?.[chosenTone - 1] ?? item.emoji)
            : item.emoji
          return (
            <button
              type="button"
              key={item.emoji}
              data-emoji
              aria-label={item.name}
              title={item.name}
              disabled={disabled}
              onKeyDown={(e) => key(e, index)}
              onClick={() => onSelect(emoji)}
              className="rounded p-2 text-xl outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {emoji}
            </button>
          )
        })}
      </div>
      {!filtered.length ? (
        <p role="status" className="p-3 text-xs text-muted-foreground">
          No emoji found.
        </p>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Previous emoji page"
            disabled={disabled || currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span role="status" className="text-xs text-muted-foreground">
            {currentPage + 1} / {pages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Next emoji page"
            disabled={disabled || currentPage >= pages - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
