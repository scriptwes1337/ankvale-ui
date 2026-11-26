import type { ReactNode } from "react"
import { ArrowSquareOutIcon } from "@phosphor-icons/react"
function safeUrl(url: string) {
  try {
    const parsed = new URL(url)
    return ["https:", "http:"].includes(parsed.protocol)
      ? parsed.href
      : undefined
  } catch {
    return undefined
  }
}
export function ChatSource({
  title,
  url,
  description,
  index,
  icon,
}: {
  title: string
  url: string
  description?: string
  index?: number
  icon?: ReactNode
}) {
  const href = safeUrl(url)
  return (
    <a
      data-slot="chat-source"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!href || undefined}
      className="inline-flex max-w-xs items-start gap-2 rounded-md border bg-card p-3 text-start hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
    >
      {icon ??
        (index !== undefined && (
          <span className="text-xs text-muted-foreground">{index}</span>
        ))}
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">{title}</span>
        {description && (
          <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <ArrowSquareOutIcon className="size-3 shrink-0 text-muted-foreground" />
    </a>
  )
}
