"use client"
import type { ReactNode } from "react"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerButton,
} from "@ankvale/ui/components/message-scroller"
import { cn } from "@ankvale/ui/lib/utils"
export function ChatConversation({
  children,
  className,
  label = "Conversation",
  emptyMessage = "No messages yet.",
}: {
  children?: ReactNode
  className?: string
  label?: string
  emptyMessage?: string
}) {
  return (
    <MessageScrollerProvider>
      <MessageScroller
        data-slot="chat-conversation"
        className={cn("h-96 rounded-lg border", className)}
      >
        <MessageScrollerViewport aria-label={label}>
          <MessageScrollerContent className="p-4">
            {children ?? (
              <p className="m-auto py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
