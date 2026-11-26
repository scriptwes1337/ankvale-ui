"use client"
import { useEffect, useRef, useState } from "react"
import {
  DropZone,
  acceptsFile,
  fileUploadId,
} from "@ankvale/ui/components/drop-zone"
import { Button } from "@ankvale/ui/components/button"
import { Progress } from "@ankvale/ui/components/progress"
export type UploadItem = {
  id: string
  file: File
  relativePath?: string
  status: "queued" | "uploading" | "complete" | "error" | "cancelled"
  progress: number
  error?: string
  url?: string
}
export type UploadTransport = (
  file: File,
  context: {
    signal: AbortSignal
    onProgress: (percent: number) => void
    relativePath?: string
  }
) => Promise<{ url?: string } | void>
export type UploadCandidate = { file: File; relativePath?: string }
function relativePath(value: string) {
  const parts = value
    .replaceAll("\\", "/")
    .split("/")
    .filter((part) => part && part !== ".")
  if (parts.includes(".."))
    throw new Error("A dropped file has an invalid relative path.")
  return parts.join("/")
}
/** Read every directory-reader batch before returning files to the upload queue. */
export async function readDroppedFiles(
  dataTransfer: DataTransfer,
  { signal, maxFiles = 1000 }: { signal?: AbortSignal; maxFiles?: number } = {}
): Promise<UploadCandidate[]> {
  // Capture entries synchronously: browser DataTransfer access expires after drop.
  const entries = Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === "file")
    .map((item) => ({
      entry: item.webkitGetAsEntry?.() ?? null,
      file: item.getAsFile(),
    }))
  const fallback = Array.from(dataTransfer.files ?? [])
  const limit = Math.max(1, Math.min(10000, Math.floor(maxFiles) || 1000))
  const files: UploadCandidate[] = []
  function check() {
    if (signal?.aborted)
      throw new DOMException("Directory reading cancelled", "AbortError")
  }
  function add(file: File, path?: string) {
    check()
    if (files.length >= limit)
      throw new Error(
        `The drop exceeds the ${limit}-file limit. Choose a smaller directory.`
      )
    files.push({
      file,
      relativePath:
        path || file.webkitRelativePath
          ? relativePath(path || file.webkitRelativePath)
          : undefined,
    })
  }
  async function walk(
    entry: FileSystemEntry,
    parent: string,
    depth: number
  ): Promise<void> {
    check()
    if (depth > 64)
      throw new Error("The dropped directory is nested too deeply.")
    const path = parent ? `${parent}/${entry.name}` : entry.name
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) =>
        (entry as FileSystemFileEntry).file(resolve, reject)
      )
      add(file, path)
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      while (true) {
        check()
        const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
          reader.readEntries(resolve, reject)
        )
        if (!batch.length) break
        for (const child of batch) await walk(child, path, depth + 1)
      }
    }
  }
  if (entries.length) {
    for (const item of entries) {
      if (item.entry) await walk(item.entry, "", 0)
      else if (item.file) add(item.file)
    }
  } else for (const file of fallback) add(file)
  check()
  return files
}
export function useUploadQueue({
  upload,
  concurrency = 2,
  beforeUpload,
}: {
  upload: UploadTransport
  concurrency?: number
  beforeUpload?: (file: File) => File | Promise<File>
}) {
  const [items, setItems] = useState<UploadItem[]>([])
  const active = useRef(new Map<string, AbortController>())
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    const requests = active.current
    return () => {
      alive.current = false
      requests.forEach((controller) => controller.abort())
      requests.clear()
    }
  }, [])
  useEffect(() => {
    const count = Math.max(1, Math.min(8, Math.floor(concurrency) || 1))
    const queued = items
      .filter(
        (item) => item.status === "queued" && !active.current.has(item.id)
      )
      .slice(0, Math.max(0, count - active.current.size))
    for (const item of queued) {
      const controller = new AbortController()
      active.current.set(item.id, controller)
      setItems((previous) =>
        previous.map((value) =>
          value.id === item.id
            ? { ...value, status: "uploading", error: undefined }
            : value
        )
      )
      Promise.resolve()
        .then(() => (beforeUpload ? beforeUpload(item.file) : item.file))
        .then((file) => {
          if (controller.signal.aborted) throw new Error("cancelled")
          return upload(file, {
            signal: controller.signal,
            relativePath: item.relativePath,
            onProgress: (progress) => {
              if (alive.current && !controller.signal.aborted)
                setItems((previous) =>
                  previous.map((value) =>
                    value.id === item.id
                      ? {
                          ...value,
                          progress: Math.max(0, Math.min(100, progress)),
                        }
                      : value
                  )
                )
            },
          })
        })
        .then((result) => {
          if (alive.current && !controller.signal.aborted)
            setItems((previous) =>
              previous.map((value) =>
                value.id === item.id
                  ? {
                      ...value,
                      status: "complete",
                      progress: 100,
                      url: result?.url,
                    }
                  : value
              )
            )
        })
        .catch(() => {
          if (alive.current && !controller.signal.aborted)
            setItems((previous) =>
              previous.map((value) =>
                value.id === item.id
                  ? {
                      ...value,
                      status: "error",
                      error: "Upload failed. Try again.",
                    }
                  : value
              )
            )
        })
        .finally(() => {
          active.current.delete(item.id)
          if (alive.current) setItems((previous) => [...previous])
        })
    }
  }, [items, upload, beforeUpload, concurrency])
  return {
    items,
    add: (files: (File | UploadCandidate)[]) =>
      setItems((previous) => {
        const next = [...previous]
        for (const input of files) {
          const candidate =
            "file" in input
              ? input
              : {
                  file: input,
                  relativePath: input.webkitRelativePath || undefined,
                }
          const path = candidate.relativePath
            ? relativePath(candidate.relativePath)
            : undefined
          const id = `${path ? `${path}:` : ""}${fileUploadId(candidate.file)}`
          if (!next.some((item) => item.id === id))
            next.push({
              id,
              file: candidate.file,
              relativePath: path,
              status: "queued",
              progress: 0,
            })
        }
        return next
      }),
    cancel: (id: string) => {
      active.current.get(id)?.abort()
      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, status: "cancelled" } : item
        )
      )
    },
    retry: (id: string) =>
      setItems((previous) =>
        previous.map((item) =>
          item.id === id &&
          (item.status === "error" || item.status === "cancelled")
            ? { ...item, status: "queued", progress: 0, error: undefined }
            : item
        )
      ),
    remove: (id: string) => {
      active.current.get(id)?.abort()
      setItems((previous) => previous.filter((item) => item.id !== id))
    },
  }
}
function FilePreview({ file }: { file: File }) {
  if (!file.type.startsWith("image/")) return null
  return (
    <img
      ref={(element) => {
        if (!element || typeof URL.createObjectURL !== "function") return
        const url = URL.createObjectURL(file)
        element.src = url
        return () => URL.revokeObjectURL(url)
      }}
      alt={`Preview of ${file.name}`}
      className="size-12 rounded border object-cover"
    />
  )
}

export function UploadManager({
  label,
  upload,
  accept,
  maxSize = 10 * 1024 * 1024,
  concurrency = 2,
  beforeUpload,
  allowDirectory = false,
  maxDirectoryFiles = 1000,
}: {
  label: string
  upload: UploadTransport
  accept?: string
  maxSize?: number
  concurrency?: number
  beforeUpload?: (file: File) => File | Promise<File>
  allowDirectory?: boolean
  maxDirectoryFiles?: number
}) {
  const queue = useUploadQueue({ upload, concurrency, beforeUpload })
  const [error, setError] = useState("")
  const readers = useRef(new Set<AbortController>())
  const [pendingReads, setPendingReads] = useState(0)
  useEffect(() => {
    const activeReaders = readers.current
    return () => {
      activeReaders.forEach((controller) => controller.abort())
      activeReaders.clear()
    }
  }, [])
  function add(files: (File | UploadCandidate)[]) {
    const allowed = files.filter((input) => {
      const file = "file" in input ? input.file : input
      return acceptsFile(file, accept) && file.size <= maxSize
    })
    setError(
      allowed.length < files.length
        ? "Some files have an unsupported type or exceed the size limit."
        : ""
    )
    queue.add(allowed)
  }
  return (
    <section
      data-slot="upload-manager"
      aria-label={label}
      className="space-y-3"
      onDragEnterCapture={
        allowDirectory
          ? (event) => {
              event.preventDefault()
              event.stopPropagation()
            }
          : undefined
      }
      onDragOverCapture={
        allowDirectory ? (event) => event.preventDefault() : undefined
      }
      onDropCapture={
        allowDirectory
          ? (event) => {
              event.preventDefault()
              event.stopPropagation()
              const controller = new AbortController()
              readers.current.add(controller)
              setPendingReads((value) => value + 1)
              void readDroppedFiles(event.dataTransfer, {
                signal: controller.signal,
                maxFiles: maxDirectoryFiles,
              })
                .then((files) => {
                  if (!controller.signal.aborted) add(files)
                })
                .catch((reason) => {
                  if (!controller.signal.aborted)
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : "The directory could not be read. Try again."
                    )
                })
                .finally(() => {
                  readers.current.delete(controller)
                  if (!controller.signal.aborted)
                    setPendingReads((value) => value - 1)
                })
            }
          : undefined
      }
      onPaste={(event) => {
        const files = Array.from(event.clipboardData.files)
        if (files.length) {
          event.preventDefault()
          add(files)
        }
      }}
    >
      <DropZone
        label={label}
        accept={accept}
        maxSize={maxSize}
        value={[]}
        onValueChange={add}
      />
      {allowDirectory && (
        <label className="block text-sm">
          Choose a directory
          <input
            type="file"
            multiple
            ref={(node) => node?.setAttribute("webkitdirectory", "")}
            onChange={(event) => {
              add(Array.from(event.currentTarget.files ?? []))
              event.currentTarget.value = ""
            }}
            className="mt-1 block text-xs"
          />
        </label>
      )}
      {pendingReads > 0 ? (
        <p role="status" className="text-sm text-muted-foreground">
          Reading dropped files…
        </p>
      ) : null}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ul className="space-y-2">
        {queue.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <FilePreview file={item.file} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm" title={item.relativePath}>
                {item.relativePath ?? item.file.name}
              </p>
              <p className="text-xs text-muted-foreground">{item.status}</p>
              {item.status === "uploading" && (
                <Progress
                  value={item.progress}
                  aria-label={`Uploading ${item.file.name}`}
                  className="mt-2"
                />
              )}
              {item.error && (
                <p role="alert" className="text-xs text-destructive">
                  {item.error}
                </p>
              )}
              {item.url && (
                <a href={item.url} className="text-xs text-primary underline">
                  Open file
                </a>
              )}
            </div>
            {item.status === "uploading" || item.status === "queued" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => queue.cancel(item.id)}
              >
                Cancel
              </Button>
            ) : item.status === "error" || item.status === "cancelled" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => queue.retry(item.id)}
              >
                Retry
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove ${item.file.name}`}
              onClick={() => queue.remove(item.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
