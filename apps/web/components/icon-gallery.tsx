"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, CopyIcon, CheckIcon } from "@phosphor-icons/react"
import type { IconWeight } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import catalog from "@/lib/icon-catalog.json"

const weights: IconWeight[] = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
]
const batchSize = 96

export function IconGallery() {
  const [query, setQuery] = useState("")
  const [weight, setWeight] = useState<IconWeight>("regular")
  const [size, setSize] = useState(32)
  const [limit, setLimit] = useState(batchSize)
  const [selected, setSelected] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  )
  const terms = query
    .trim()
    .toLowerCase()
    .replaceAll(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  const filtered = catalog.filter((icon) =>
    terms.every((term) =>
      `${icon.name} ${icon.title}`.toLowerCase().includes(term)
    )
  )
  const selectedIcon = catalog.find((icon) => icon.name === selected)
  const example = selected
    ? `import { ${selected}Icon } from "@phosphor-icons/react"\n\n<${selected}Icon size={${size}} weight="${weight}" aria-hidden="true" />`
    : ""
  async function copyExample() {
    try {
      await navigator.clipboard.writeText(example)
      setCopyStatus("copied")
    } catch {
      setCopyStatus("error")
    }
  }
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-4 border-b pb-6">
        <div className="min-w-48 flex-1">
          <label
            htmlFor="icon-search"
            className="mb-2 block text-sm font-medium"
          >
            Search icons
          </label>
          <div className="relative">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-3 size-4 text-muted-foreground"
            />
            <Input
              id="icon-search"
              type="search"
              placeholder="Search by name…"
              className="h-11 ps-9"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setLimit(batchSize)
              }}
            />
          </div>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Weight
          <select
            className="h-11 rounded-md border bg-background px-3 text-sm font-normal capitalize"
            value={weight}
            onChange={(event) => {
              setWeight(event.target.value as IconWeight)
              setCopyStatus("idle")
            }}
          >
            {weights.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Size
          <select
            className="h-11 rounded-md border bg-background px-3 text-sm font-normal"
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value))
              setCopyStatus("idle")
            }}
          >
            {[24, 32, 40, 48].map((value) => (
              <option key={value} value={value}>
                {value}px
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="my-5 text-sm text-muted-foreground">
        {filtered.length} of {catalog.length} icons
      </p>
      {selectedIcon && (
        <Dialog
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedIcon.title}</DialogTitle>
              <DialogDescription>
                Phosphor · {weight} · {size}px
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid min-w-0 gap-5 sm:grid-cols-[64px_minmax(0,1fr)]">
              <svg
                width={64}
                height={64}
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
              >
                <use href={`/icon-assets/${weight}.svg#${selectedIcon.name}`} />
              </svg>
              <pre
                tabIndex={0}
                className="min-w-0 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-6 break-words whitespace-pre-wrap"
              >
                <code>{example}</code>
              </pre>
              <Button
                variant="outline"
                className="justify-self-start sm:col-start-2"
                onClick={copyExample}
              >
                {copyStatus === "copied" ? <CheckIcon /> : <CopyIcon />} Copy
                example
              </Button>
            </div>
            <p role="status" className="mt-3 text-xs text-muted-foreground">
              {copyStatus === "copied"
                ? "Example copied."
                : copyStatus === "error"
                  ? "Copy unavailable. Select the example to copy it."
                  : "Decorative icons use aria-hidden. Give icon-only buttons an accessible name; label standalone meaningful icons."}
            </p>
          </DialogContent>
        </Dialog>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {filtered.slice(0, limit).map((icon) => (
          <button
            type="button"
            key={icon.name}
            aria-pressed={selected === icon.name}
            onClick={() => {
              setSelected(icon.name)
              setCopyStatus("idle")
            }}
            className="flex min-h-28 min-w-0 flex-col items-center justify-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-accent"
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
              className="shrink-0"
            >
              <use href={`/icon-assets/${weight}.svg#${icon.name}`} />
            </svg>
            <span className="w-full text-center text-[11px] leading-4 break-words">
              {icon.title}
            </span>
          </button>
        ))}
      </div>
      {!filtered.length && (
        <div className="py-14 text-center">
          <p className="text-sm text-muted-foreground">
            No icons found. Try another name.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQuery("")
              setLimit(batchSize)
            }}
          >
            Clear search
          </Button>
        </div>
      )}
      {filtered.length > limit && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLimit((value) => value + batchSize)}
          >
            Show more icons
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {Math.min(limit, filtered.length)} of {filtered.length}
          </p>
        </div>
      )}
      <p className="mt-10 border-t pt-5 text-xs leading-6 text-muted-foreground">
        Phosphor Icons · MIT license.{" "}
        <a
          href="/icon-assets/LICENSE.txt"
          className="underline underline-offset-4"
        >
          View license
        </a>
        . Previews use the installed icon package; import only the icons your
        project needs.
      </p>
    </div>
  )
}
