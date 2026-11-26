import type { ReactNode } from "react"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from "@ankvale/ui/components/message"
import { cn } from "@ankvale/ui/lib/utils"
export type ChatMessageProps = {
  role: "user" | "assistant" | "system"
  name?: string
  avatar?: ReactNode
  children: ReactNode
  actions?: ReactNode
  time?: string
  className?: string
}
export function ChatMessage({
  role,
  name,
  avatar,
  children,
  actions,
  time,
  className,
}: ChatMessageProps) {
  const author =
    name ??
    (role === "user" ? "You" : role === "assistant" ? "Assistant" : "System")
  return (
    <Message
      data-slot="chat-message"
      align={role === "user" ? "end" : "start"}
      className={cn("py-2", className)}
    >
      <MessageAvatar>
        {avatar ?? (
          <span className="text-xs">{author.slice(0, 2).toUpperCase()}</span>
        )}
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span>{author}</span>
          {time && <time>{time}</time>}
        </MessageHeader>
        <div
          className={cn(
            "max-w-full rounded-lg px-3 py-2",
            role === "user"
              ? "bg-accent text-accent-foreground"
              : "border bg-card"
          )}
        >
          {children}
        </div>
        {actions && <MessageFooter>{actions}</MessageFooter>}
      </MessageContent>
    </Message>
  )
}
