"use client"
import { useState } from "react"
import {
  CopyIcon,
  CheckIcon,
  ArrowClockwiseIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
export function ChatMessageActions({
  text,
  onRetry,
  feedback,
  onFeedback,
  disabled,
}: {
  text: string
  onRetry?: () => void
  feedback?: "up" | "down" | null
  onFeedback?: (value: "up" | "down" | null) => void
  disabled?: boolean
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState("")
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setError("")
    } catch {
      setError("Could not copy.")
    }
  }
  return (
    <div
      data-slot="chat-message-actions"
      className="flex items-center gap-1"
      role="group"
      aria-label="Message actions"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={copied ? "Copied" : "Copy message"}
        onClick={copy}
        disabled={disabled}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Retry response"
          onClick={onRetry}
          disabled={disabled}
        >
          <ArrowClockwiseIcon />
        </Button>
      )}
      {onFeedback && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Helpful"
            aria-pressed={feedback === "up"}
            onClick={() => onFeedback(feedback === "up" ? null : "up")}
            disabled={disabled}
          >
            <ThumbsUpIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Not helpful"
            aria-pressed={feedback === "down"}
            onClick={() => onFeedback(feedback === "down" ? null : "down")}
            disabled={disabled}
          >
            <ThumbsDownIcon />
          </Button>
        </>
      )}
      <span role="status" className="text-xs text-destructive">
        {error}
      </span>
    </div>
  )
}
