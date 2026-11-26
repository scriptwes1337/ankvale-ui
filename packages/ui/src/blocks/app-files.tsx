"use client"
import { useState } from "react"
import { Popconfirm } from "@ankvale/ui/components/popconfirm"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { DropZone } from "@ankvale/ui/components/drop-zone"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import { Image } from "@ankvale/ui/components/image"
import {
  AppSection,
  AppForm,
  AsyncAction,
  type AppAction,
} from "@ankvale/ui/blocks/app-shared"
/** RFC-style quoted CSV, including escaped quotes and embedded newlines. */
export function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let value = "",
    quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"'
        i++
      } else if (!value || quoted) quoted = !quoted
      else throw new Error("Unexpected quote")
    } else if (c === "," && !quoted) {
      row.push(value)
      value = ""
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(value)
      if (row.some((v) => v !== "")) rows.push(row)
      row = []
      value = ""
    } else value += c
  }
  if (quoted) throw new Error("Unclosed quoted field")
  row.push(value)
  if (row.some((v) => v !== "")) rows.push(row)
  return rows
}
export function ImportExportWizard({
  fields,
  onImport,
  onExport,
  uniqueBy,
}: {
  fields: {
    id: string
    label: string
    required?: boolean
    validate?: (
      value: string,
      row: Record<string, string>
    ) => string | undefined
  }[]
  onImport: (
    rows: Record<string, string>[]
  ) => Promise<{ created: number; skipped?: number }>
  onExport?: AppAction
  uniqueBy?: string
}) {
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [result, setResult] = useState<{
    created: number
    skipped?: number
  } | null>(null)
  const headers = rows[0] ?? []
  const seen = new Set<string>()
  let duplicates = 0,
    invalid = 0
  const valid: Record<string, string>[] = []
  for (const row of rows.slice(1)) {
    const record = Object.fromEntries(
      fields.map((f) => [
        f.id,
        mapping[f.id] ? (row[Number(mapping[f.id])] ?? "") : "",
      ])
    )
    if (
      fields.some(
        (f) =>
          (f.required && !record[f.id]?.trim()) ||
          !!f.validate?.(record[f.id] ?? "", record)
      )
    ) {
      invalid++
      continue
    }
    const key = uniqueBy ? record[uniqueBy] : undefined
    if (key && seen.has(key)) {
      duplicates++
      continue
    }
    if (key) seen.add(key)
    valid.push(record)
  }
  return (
    <AppSection
      title="Import records"
      actions={
        onExport && (
          <AsyncAction variant="outline" onAction={onExport}>
            Export records
          </AsyncAction>
        )
      }
    >
      <label className="grid gap-2 text-sm font-medium">
        CSV file
        <Input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setError("")
            setResult(null)
            try {
              if (file.size > 5 * 1024 * 1024)
                throw new Error("File is too large")
              const parsed = parseCsv(await file.text())
              if (parsed.length < 2) throw new Error("File has no records")
              setRows(parsed)
              setMapping(
                Object.fromEntries(
                  fields.map((f) => {
                    const index = (parsed[0] ?? []).findIndex(
                      (h) =>
                        h.replace(/^\uFEFF/, "").toLowerCase() ===
                        f.id.toLowerCase()
                    )
                    return [f.id, index < 0 ? "" : String(index)]
                  })
                )
              )
            } catch {
              setError(
                "Choose a valid CSV file under 5 MB with a header and at least one record."
              )
              setRows([])
            }
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {rows.length > 0 && !result && (
        <>
          <h3 className="text-sm font-semibold">Match columns</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.id} className="grid gap-2 text-sm">
                {f.label}
                {f.required ? " *" : ""}
                <select
                  value={mapping[f.id] ?? ""}
                  onChange={(e) =>
                    setMapping({ ...mapping, [f.id]: e.target.value })
                  }
                  className="h-9 rounded border bg-background px-2"
                >
                  <option value="">Do not import</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {valid.length} valid · {invalid} invalid · {duplicates} duplicates
          </p>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {fields.map((f) => (
                    <th key={f.id} className="border-b p-2 text-start">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {valid.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    {fields.map((f) => (
                      <td key={f.id} className="border-b p-2">
                        {r[f.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AsyncAction
            disabled={
              !valid.length ||
              fields.some((f) => f.required && mapping[f.id] === "")
            }
            onAction={async () => setResult(await onImport(valid))}
          >
            Import {valid.length} records
          </AsyncAction>
        </>
      )}
      {result && (
        <div role="status" className="space-y-3 text-sm">
          <p>
            {result.created} records imported
            {result.skipped ? `, ${result.skipped} skipped` : ""}.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setRows([])
              setResult(null)
            }}
          >
            Import another file
          </Button>
        </div>
      )}
    </AppSection>
  )
}
export type ManagedFile = {
  id: string
  name: string
  kind: "folder" | "file" | "image"
  parentId?: string
  size?: string
  url?: string
  modified?: string
}
export function FileManager({
  files,
  onUpload,
  onRename,
  onMove,
  onShare,
  onDelete,
}: {
  files: ManagedFile[]
  onUpload: (files: File[], folderId?: string) => void | Promise<void>
  onRename: (id: string, name: string) => void | Promise<void>
  onMove: (id: string, parentId?: string) => void | Promise<void>
  onShare: (id: string) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
}) {
  const [folder, setFolder] = useState<string | undefined>()
  const [query, setQuery] = useState("")
  const [view, setView] = useState("list")
  const [editing, setEditing] = useState<ManagedFile | null>(null)
  const [preview, setPreview] = useState<ManagedFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(false)
  function isDescendant(candidate: string, ancestor: string) {
    let node = files.find((f) => f.id === candidate)
    const seen = new Set<string>()
    while (node?.parentId && !seen.has(node.id)) {
      seen.add(node.id)
      if (node.parentId === ancestor) return true
      node = files.find((f) => f.id === node!.parentId)
    }
    return false
  }
  const visible = files.filter(
    (f) =>
      f.parentId === folder &&
      f.name.toLowerCase().includes(query.toLowerCase())
  )
  const parent = files.find((f) => f.id === folder)
  return (
    <AppSection title="Files">
      <div className="flex flex-wrap gap-2">
        {folder && (
          <Button variant="outline" onClick={() => setFolder(parent?.parentId)}>
            ← {parent?.name ?? "Back"}
          </Button>
        )}
        <Input
          aria-label="Search files"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <select
          aria-label="File view"
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="rounded border bg-background px-2 text-sm"
        >
          <option value="list">List</option>
          <option value="grid">Grid</option>
        </select>
      </div>
      <DropZone
        label={uploading ? "Uploading…" : "Upload files"}
        disabled={uploading}
        value={[]}
        onValueChange={async (incoming) => {
          setUploading(true)
          setUploadError(false)
          try {
            await onUpload(incoming, folder)
          } catch {
            setUploadError(true)
          } finally {
            setUploading(false)
          }
        }}
      />
      {uploadError && (
        <p role="alert" className="text-sm text-destructive">
          Upload failed. Select the files to try again.
        </p>
      )}
      {!visible.length && (
        <p className="text-sm text-muted-foreground">
          No files in this folder.
        </p>
      )}
      <ul
        className={
          view === "grid"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "divide-y"
        }
      >
        {visible.map((file) => (
          <li
            key={file.id}
            className={
              view === "grid"
                ? "space-y-4 rounded border p-4"
                : "flex flex-wrap justify-between gap-3 py-4"
            }
          >
            <div className="min-w-0">
              <button
                className="text-start text-sm font-medium hover:text-primary"
                onClick={() =>
                  file.kind === "folder" ? setFolder(file.id) : setPreview(file)
                }
              >
                {file.kind === "folder" ? "▱ " : "↗ "}
                {file.name}
              </button>
              <p className="text-xs text-muted-foreground">
                {file.size} {file.modified}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(file)}
              >
                Manage
              </Button>
              <AsyncAction
                size="sm"
                variant="ghost"
                onAction={() => onShare(file.id)}
              >
                Share
              </AsyncAction>
            </div>
          </li>
        ))}
      </ul>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogTitle>Manage file</DialogTitle>
          <DialogDescription>
            Rename, move or remove the selected file.
          </DialogDescription>
          {editing && (
            <>
              <AppForm
                key={editing.id}
                fields={[{ name: "name", label: "Name", required: true }]}
                initialValues={{ name: editing.name }}
                onSubmit={async (v) => {
                  await onRename(editing.id, v.name ?? "")
                  setEditing(null)
                }}
              />
              <label className="grid gap-2 text-sm">
                Move to
                <select
                  className="h-9 rounded border bg-background px-2"
                  value={editing.parentId ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      parentId: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">Root folder</option>
                  {files
                    .filter(
                      (f) =>
                        f.kind === "folder" &&
                        f.id !== editing.id &&
                        !isDescendant(f.id, editing.id)
                    )
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </label>
              <AsyncAction
                variant="outline"
                onAction={async () => {
                  await onMove(editing.id, editing.parentId)
                  setEditing(null)
                }}
              >
                Move file
              </AsyncAction>
              <Popconfirm
                trigger="Delete file"
                title={`Delete ${editing.name}?`}
                confirmLabel="Delete file"
                onConfirm={async () => {
                  await onDelete(editing.id)
                  setEditing(null)
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null)
        }}
      >
        <DialogContent>
          <DialogTitle>{preview?.name ?? "File preview"}</DialogTitle>
          <DialogDescription>
            {preview?.size ?? "Selected file"}
          </DialogDescription>
          {preview?.kind === "image" && preview.url ? (
            <Image src={preview.url} alt={preview.name} />
          ) : preview?.url ? (
            <a
              href={preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Open file
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              Preview unavailable.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </AppSection>
  )
}
