"use client"
import type { ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type PromptSuggestionItem = {
  id: string
  text: string
  description?: string
  icon?: ReactNode
}
export function PromptSuggestion({
  items,
  onSelect,
  disabled,
  className,
}: {
  items: PromptSuggestionItem[]
  onSelect: (text: string) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      data-slot="prompt-suggestion"
      role="group"
      aria-label="Suggested prompts"
      className={cn("grid gap-2 sm:grid-cols-2", className)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item.text)}
          className="flex items-start gap-3 rounded-lg border bg-card p-3 text-start outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {item.icon}
          <span>
            <span className="block text-sm font-medium">{item.text}</span>
            {item.description && (
              <span className="mt-1 block text-xs text-muted-foreground">
                {item.description}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
