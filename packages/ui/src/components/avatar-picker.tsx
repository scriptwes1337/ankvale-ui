"use client"
import { useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@ankvale/ui/components/avatar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@ankvale/ui/components/popover"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
export type AvatarPerson = { id: string; name: string; src?: string }
export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  )
}
export function AvatarCollection({
  people,
  max = 4,
  label = "Team",
}: {
  people: AvatarPerson[]
  max?: number
  label?: string
}) {
  return (
    <AvatarGroup aria-label={label}>
      {people.slice(0, Math.max(0, max)).map((person) => (
        <Avatar key={person.id} title={person.name}>
          {person.src && <AvatarImage src={person.src} alt={person.name} />}
          <AvatarFallback>{initials(person.name)}</AvatarFallback>
        </Avatar>
      ))}
      {people.length > max && (
        <AvatarGroupCount aria-label={`${people.length - max} more people`}>
          +{people.length - max}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
export function AvatarPicker({
  people,
  label,
  value,
  defaultValue = [],
  onValueChange,
  disabled = false,
}: {
  people: AvatarPerson[]
  label: string
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (ids: string[]) => void
  disabled?: boolean
}) {
  const [selected, set] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [query, setQuery] = useState("")
  return (
    <Popover>
      <PopoverTrigger
        render={<Button type="button" variant="outline" disabled={disabled} />}
      >
        {label}
        {selected.length > 0 && (
          <span className="text-muted-foreground">({selected.length})</span>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <Input
          aria-label={`Search ${label}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="max-h-64 space-y-1 overflow-auto">
          {people
            .filter((person) =>
              person.name.toLowerCase().includes(query.toLowerCase())
            )
            .map((person) => (
              <li key={person.id}>
                <label className="flex items-center gap-3 rounded p-2 text-sm hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={selected.includes(person.id)}
                    onChange={(e) =>
                      set(
                        e.target.checked
                          ? [...selected, person.id]
                          : selected.filter((id) => id !== person.id)
                      )
                    }
                    className="accent-primary"
                  />
                  <Avatar>
                    {person.src && <AvatarImage src={person.src} alt="" />}
                    <AvatarFallback>{initials(person.name)}</AvatarFallback>
                  </Avatar>
                  {person.name}
                </label>
              </li>
            ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
