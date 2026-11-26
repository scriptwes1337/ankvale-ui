"use client"
import { useRef, useState, useEffect, type ReactNode } from "react"
import {
  ArrowUpIcon,
  StopIcon,
  PaperclipIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { acceptsFile } from "@ankvale/ui/components/drop-zone"
import { cn } from "@ankvale/ui/lib/utils"
export type PromptSubmission = { text: string; files: File[] }
export type PromptInputProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (text: string) => void
  onSubmit: (message: PromptSubmission) => void | Promise<void>
  onStop?: () => void
  streaming?: boolean
  disabled?: boolean
  placeholder?: string
  label?: string
  accept?: string
  maxFileSize?: number
  maxFiles?: number
  toolbar?: ReactNode
  className?: string
}
export function PromptInput({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  streaming = false,
  disabled,
  placeholder = "Message…",
  label = "Message",
  accept,
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 5,
  toolbar,
  className,
}: PromptInputProps) {
  const [text, setText] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [files, setFiles] = useState<File[]>([]),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false)
  const locked = useRef(false)
  const input = useRef<HTMLInputElement>(null),
    textarea = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = "auto"
      textarea.current.style.height = `${Math.min(200, Math.max(72, textarea.current.scrollHeight))}px`
    }
  }, [text])
  async function submit() {
    if (
      locked.current ||
      disabled ||
      streaming ||
      (!text.trim() && !files.length)
    )
      return
    locked.current = true
    setPending(true)
    setError("")
    const submitted = text
    const submittedFiles = files
    try {
      await onSubmit({ text: submitted.trim(), files: submittedFiles })
      setText("")
      setFiles([])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send message.")
    } finally {
      locked.current = false
      setPending(false)
    }
  }
  function add(incoming: File[]) {
    if (disabled || pending || streaming) return
    const accepted: File[] = []
    let rejected = false
    for (const file of incoming) {
      if (
        files.length + accepted.length >= maxFiles ||
        file.size > maxFileSize ||
        !acceptsFile(file, accept)
      ) {
        rejected = true
        continue
      }
      accepted.push(file)
    }
    setFiles([...files, ...accepted])
    setError(
      rejected
        ? "Some files exceeded the file limit, size limit, or accepted types."
        : ""
    )
  }
  return (
    <form
      data-slot="prompt-input"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
      className={cn(
        "rounded-lg border bg-card p-3 focus-within:border-ring",
        className
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        add(Array.from(e.dataTransfer.files))
      }}
    >
      {files.length > 0 && (
        <ul aria-label="Attachments" className="mb-2 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex max-w-full items-center gap-1 rounded border px-2 py-1 text-xs"
            >
              <span className="truncate">{file.name}</span>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={disabled || pending || streaming}
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  setFiles(files.filter((_, index) => index !== i))
                }
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <textarea
        ref={textarea}
        aria-label={label}
        placeholder={placeholder}
        value={text}
        disabled={disabled || pending}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          if (e.clipboardData.files.length) {
            e.preventDefault()
            add(Array.from(e.clipboardData.files))
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            void submit()
          }
        }}
        className="block min-h-18 w-full resize-none bg-transparent text-sm leading-6 outline-none disabled:opacity-50"
      />
      <div className="mt-2 flex items-center gap-2">
        <input
          type="file"
          ref={input}
          accept={accept}
          multiple
          className="sr-only"
          aria-label="Attach files"
          disabled={disabled || pending || streaming}
          onChange={(e) => {
            add(Array.from(e.target.files ?? []))
            e.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Attach files"
          disabled={disabled || pending || streaming}
          onClick={() => input.current?.click()}
        >
          <PaperclipIcon />
        </Button>
        {toolbar}
        <span className="flex-1" />
        {streaming ? (
          <Button
            type="button"
            size="icon-sm"
            aria-label="Stop response"
            disabled={!onStop}
            onClick={onStop}
          >
            <StopIcon />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon-sm"
            aria-label={pending ? "Sending message" : "Send message"}
            disabled={disabled || pending || (!text.trim() && !files.length)}
          >
            <ArrowUpIcon />
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}
