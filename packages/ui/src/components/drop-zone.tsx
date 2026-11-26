"use client"
import { useId, useRef, useState } from "react"
import { UploadSimpleIcon, XIcon, FileIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import { cn } from "@ankvale/ui/lib/utils"
export type FileRejection = { file: File; reason: "type" | "size" | "count" }
export type FileUploadState = {
  status: "uploading" | "complete" | "error"
  progress?: number
  error?: string
}
export function fileUploadId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`
}
export type DropZoneProps = {
  uploads?: Record<string, FileUploadState>
  onRetryUpload?: (file: File) => void
  onCancelUpload?: (file: File) => void
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  onReject?: (files: FileRejection[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  label?: string
  description?: string
  className?: string
  name?: string
}
export function acceptsFile(file: File, accept?: string) {
  return (
    !accept ||
    accept.split(",").some((rule) => {
      const type = rule.trim().toLowerCase()
      return type.startsWith(".")
        ? file.name.toLowerCase().endsWith(type)
        : type.endsWith("/*")
          ? file.type.toLowerCase().startsWith(type.slice(0, -1))
          : file.type.toLowerCase() === type
    })
  )
}
export function DropZone({
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  uploads,
  onRetryUpload,
  onCancelUpload,
  accept,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  disabled,
  label = "Upload files",
  description = "Drop files here or select files.",
  className,
  name,
}: DropZoneProps) {
  const [files, setFiles] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  const depth = useRef(0)
  function add(incoming: File[]) {
    if (disabled) return
    const next = multiple ? [...files] : []
    const rejected: FileRejection[] = []
    for (const file of incoming) {
      const reason = !acceptsFile(file, accept)
        ? "type"
        : file.size > maxSize
          ? "size"
          : next.length >= Math.max(1, multiple ? maxFiles : 1)
            ? "count"
            : null
      if (reason) rejected.push({ file, reason })
      else if (
        !next.some(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        )
      )
        next.push(file)
    }
    setFiles(next)
    setErrors(
      rejected.map(
        ({ file, reason }) =>
          `${file.name}: ${reason === "size" ? "file is too large" : reason === "type" ? "file type is not supported" : "file limit reached"}.`
      )
    )
    if (rejected.length) onReject?.(rejected)
  }
  return (
    <div data-slot="drop-zone" className={cn("space-y-3", className)}>
      <div
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled) {
            depth.current++
            setDragging(true)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault()
          if (--depth.current <= 0) {
            depth.current = 0
            setDragging(false)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          depth.current = 0
          setDragging(false)
          add(Array.from(e.dataTransfer.files))
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border border-dashed bg-card p-6 text-center",
          dragging && "border-primary bg-accent",
          disabled && "opacity-50"
        )}
      >
        <UploadSimpleIcon
          className="size-6 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p id={`${id}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
        <input
          ref={input}
          id={id}
          type="file"
          name={name}
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={`${id}-description`}
          onChange={(e) => {
            add(Array.from(e.target.files ?? []))
            e.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          Select files
        </Button>
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 text-xs text-destructive">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul aria-label="Selected files" className="divide-y rounded-lg border">
          {files.map((file, i) => {
            const upload = uploads?.[fileUploadId(file)],
              progress = Math.max(0, Math.min(100, upload?.progress ?? 0))
            return (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 px-3 py-2"
              >
                <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat("en-US", {
                      maximumFractionDigits: 1,
                    }).format(file.size / 1024)}{" "}
                    KB
                  </p>
                </div>
                {upload && (
                  <div className="max-w-40 min-w-24 text-xs">
                    <span className="text-muted-foreground">
                      {upload.status === "uploading"
                        ? `Uploading ${Math.round(progress)}%`
                        : upload.status === "complete"
                          ? "Uploaded"
                          : "Upload failed"}
                    </span>
                    {upload.status === "uploading" && (
                      <progress
                        aria-label={`${file.name} upload progress`}
                        value={progress}
                        max={100}
                        className="mt-1 block h-1.5 w-full accent-primary"
                      />
                    )}
                    {upload.status === "error" && upload.error && (
                      <p role="alert" className="mt-1 text-destructive">
                        {upload.error}
                      </p>
                    )}
                  </div>
                )}
                {upload?.status === "error" && onRetryUpload && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onRetryUpload(file)}
                  >
                    Retry
                  </Button>
                )}
                {upload?.status === "uploading" && onCancelUpload && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onCancelUpload(file)}
                  >
                    Cancel upload
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled}
                  onClick={() =>
                    setFiles(files.filter((_, index) => index !== i))
                  }
                >
                  <XIcon />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
