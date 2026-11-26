"use client"
import { ListView } from "@ankvale/ui/components/list-view"
import { Button } from "@ankvale/ui/components/button"
import { TrashIcon, ChatCircleIcon } from "@phosphor-icons/react"
export type ChatListItem = { id: string; title: string; updatedAt?: string }
export function ChatListView({
  items,
  value,
  onValueChange,
  onDelete,
  className,
}: {
  items: ChatListItem[]
  value?: string
  onValueChange: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}) {
  return (
    <ListView
      data-slot="chat-list-view"
      label="Conversations"
      className={className}
      selectionMode="single"
      selected={value ? [value] : []}
      onSelectionChange={(ids) => {
        if (ids[0]) onValueChange(ids[0])
      }}
      emptyMessage="No conversations."
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.updatedAt,
        icon: (
          <ChatCircleIcon className="size-4 shrink-0 text-muted-foreground" />
        ),
        actions: onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${item.title}`}
            onClick={() => onDelete(item.id)}
          >
            <TrashIcon />
          </Button>
        ) : undefined,
      }))}
    />
  )
}
