"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"

export type ImageCrop = {
  x: number
  y: number
  width: number
  height: number
  outputWidth: number
  outputHeight: number
}
export type ImageCropperProps = {
  source: Blob | string | null
  alt: string
  onCrop: (
    blob: Blob,
    crop: ImageCrop,
    context: { signal: AbortSignal }
  ) => void | Promise<void>
  onCancel?: () => void
  aspectRatios?: { label: string; value: number | null }[]
  mimeType?: "image/png" | "image/jpeg" | "image/webp"
  quality?: number
  maxOutputDimension?: number
  disabled?: boolean
  className?: string
}
const defaultRatios = [
  { label: "Original", value: null },
  { label: "Square", value: 1 },
  { label: "Landscape (4:3)", value: 4 / 3 },
  { label: "Wide (16:9)", value: 16 / 9 },
  { label: "Portrait (3:4)", value: 3 / 4 },
]
/** Pixel coordinates in the decoded source image, independent of preview dimensions. */
export function getImageCrop(
  width: number,
  height: number,
  aspect: number | null,
  size: number,
  horizontal: number,
  vertical: number,
  limit = 4096
): ImageCrop {
  const ratio =
    aspect && Number.isFinite(aspect) && aspect > 0 ? aspect : width / height
  const cropWidth =
    (Math.min(width, height * ratio) * Math.max(10, Math.min(100, size))) / 100
  const cropHeight = cropWidth / ratio
  const scale = Math.min(
    1,
    Math.max(1, Number.isFinite(limit) ? limit : 4096) /
      Math.max(cropWidth, cropHeight)
  )
  return {
    x: ((width - cropWidth) * Math.max(0, Math.min(100, horizontal))) / 100,
    y: ((height - cropHeight) * Math.max(0, Math.min(100, vertical))) / 100,
    width: cropWidth,
    height: cropHeight,
    outputWidth: Math.max(1, Math.round(cropWidth * scale)),
    outputHeight: Math.max(1, Math.round(cropHeight * scale)),
  }
}

/** Client-side crop with keyboard-native controls. Remote sources must permit canvas CORS. */
export function ImageCropper({
  source,
  alt,
  onCrop,
  onCancel,
  aspectRatios = defaultRatios,
  mimeType = "image/png",
  quality = 0.92,
  maxOutputDimension = 4096,
  disabled = false,
  className,
}: ImageCropperProps) {
  const id = useId()
  const image = useRef<HTMLImageElement>(null)
  const operation = useRef<AbortController | null>(null)
  const [resource, setResource] = useState<{
    source: Blob | string
    url: string
  } | null>(null)
  const [loaded, setLoaded] = useState<{
    url: string
    width: number
    height: number
  } | null>(null)
  const [size, setSize] = useState(80)
  const [horizontal, setHorizontal] = useState(50)
  const [vertical, setVertical] = useState(50)
  const [aspectIndex, setAspectIndex] = useState(0)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [retry, setRetry] = useState(0)
  const ratios = aspectRatios.filter(
    (item) =>
      item.value === null || (Number.isFinite(item.value) && item.value > 0)
  )
  const choices = ratios.length ? ratios : defaultRatios
  const activeAspect = Math.min(aspectIndex, choices.length - 1)
  const url = resource?.source === source ? resource.url : null
  const dimensions = loaded?.url === url ? loaded : null
  const crop = dimensions
    ? getImageCrop(
        dimensions.width,
        dimensions.height,
        choices[activeAspect]?.value ?? null,
        size,
        horizontal,
        vertical,
        maxOutputDimension
      )
    : null
  useEffect(() => {
    operation.current?.abort()
    operation.current = null
    // Reset the editor when its external image resource is replaced or retried.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusy(false)
    setLoaded(null)
    setError("")
    setSaved(false)
    setHorizontal(50)
    setVertical(50)
    setSize(80)
    if (!source) {
      setResource(null)
      return
    }
    const objectUrl =
      typeof source === "string" ? null : URL.createObjectURL(source)
    setResource({ source, url: objectUrl ?? (source as string) })
    return () => {
      operation.current?.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [source, retry])
  function change(update: () => void) {
    update()
    setSaved(false)
    setError("")
  }
  function cancel() {
    operation.current?.abort()
    operation.current = null
    setBusy(false)
    setSaved(false)
    setError("")
    onCancel?.()
  }
  async function exportCrop() {
    if (!crop || !image.current || operation.current || disabled) return
    const controller = new AbortController()
    operation.current = controller
    setBusy(true)
    setError("")
    setSaved(false)
    try {
      const canvas = document.createElement("canvas")
      canvas.width = crop.outputWidth
      canvas.height = crop.outputHeight
      const context = canvas.getContext("2d")
      if (!context)
        throw new Error("Canvas is unavailable. Try another browser.")
      context.drawImage(
        image.current,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height
      )
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(
                  new Error(
                    "The image could not be exported. Try another image."
                  )
                ),
          mimeType,
          Math.max(0, Math.min(1, quality))
        )
      )
      if (controller.signal.aborted) return
      await onCrop(blob, crop, { signal: controller.signal })
      if (!controller.signal.aborted) setSaved(true)
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error && reason.name !== "SecurityError"
            ? reason.message
            : "This image cannot be exported. Choose a local file or an image that allows cross-origin access."
        )
    } finally {
      if (operation.current === controller) {
        operation.current = null
        setBusy(false)
      }
    }
  }
  const loading = !!source && !dimensions && !error
  return (
    <section
      data-slot="image-cropper"
      aria-label="Crop image"
      className={cn("min-w-0 space-y-4", className)}
    >
      {!source ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Choose an image to crop.
        </p>
      ) : null}
      {url ? (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="relative self-start overflow-hidden rounded-lg border bg-muted">
            {/* Native image dimensions and canvas access are required for local file editing. */}
            <img
              ref={image}
              key={`${url}-${retry}`}
              src={url}
              crossOrigin="anonymous"
              alt={alt}
              className="block h-auto w-full"
              onLoad={(event) => {
                const node = event.currentTarget
                if (node.naturalWidth && node.naturalHeight) {
                  setLoaded({
                    url,
                    width: node.naturalWidth,
                    height: node.naturalHeight,
                  })
                  setError("")
                }
              }}
              onError={() => {
                setLoaded(null)
                setError(
                  "The image could not be loaded. Try again or choose another image."
                )
              }}
            />
            {crop && dimensions ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute border-2 border-primary outline-1 outline-background"
                style={{
                  left: `${(crop.x / dimensions.width) * 100}%`,
                  top: `${(crop.y / dimensions.height) * 100}%`,
                  width: `${(crop.width / dimensions.width) * 100}%`,
                  height: `${(crop.height / dimensions.height) * 100}%`,
                }}
              />
            ) : null}
          </div>
          {crop && dimensions ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Crop preview</p>
              <div
                role="img"
                aria-label={`Cropped preview: ${alt}`}
                className="relative overflow-hidden rounded-lg border bg-muted"
                style={{ aspectRatio: crop.width / crop.height }}
              >
                <img
                  src={url}
                  alt=""
                  aria-hidden="true"
                  className="absolute max-w-none"
                  style={{
                    width: `${(dimensions.width / crop.width) * 100}%`,
                    left: `${(-crop.x / crop.width) * 100}%`,
                    top: `${(-crop.y / crop.height) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {crop.outputWidth} × {crop.outputHeight} pixels
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading image…
        </p>
      ) : null}
      <fieldset
        disabled={disabled || busy || !crop}
        className="grid min-w-0 gap-4 sm:grid-cols-2"
      >
        <label htmlFor={`${id}-aspect`} className="grid gap-2 text-sm">
          Aspect ratio
          <select
            id={`${id}-aspect`}
            value={activeAspect}
            onChange={(event) =>
              change(() => setAspectIndex(Number(event.target.value)))
            }
            className="h-10 rounded-md border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {choices.map((item, index) => (
              <option key={`${item.label}-${index}`} value={index}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {[
          {
            key: "size",
            label: "Crop size",
            value: size,
            min: 10,
            update: setSize,
          },
          {
            key: "x",
            label: "Horizontal position",
            value: horizontal,
            min: 0,
            update: setHorizontal,
          },
          {
            key: "y",
            label: "Vertical position",
            value: vertical,
            min: 0,
            update: setVertical,
          },
        ].map((item) => (
          <label
            key={item.key}
            htmlFor={`${id}-${item.key}`}
            className="grid content-start gap-2 text-sm"
          >
            <span className="flex justify-between gap-2">
              {item.label}
              <span aria-hidden="true" className="text-muted-foreground">
                {item.value}%
              </span>
            </span>
            <input
              id={`${id}-${item.key}`}
              type="range"
              aria-valuetext={`${item.value}%`}
              min={item.min}
              max={100}
              step={1}
              value={item.value}
              onChange={(event) =>
                change(() => item.update(Number(event.target.value)))
              }
              className="h-10 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed"
            />
          </label>
        ))}
      </fieldset>
      {error ? (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>{error}</p>
          {!dimensions ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry loading
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={disabled || busy || !crop}
          onClick={() => void exportCrop()}
        >
          {busy ? "Saving crop…" : "Save crop"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={cancel}
        >
          Cancel
        </Button>
        {saved ? (
          <p role="status" className="text-sm text-muted-foreground">
            Crop saved.
          </p>
        ) : null}
        {busy ? (
          <p role="status" className="text-sm text-muted-foreground">
            Exporting crop…
          </p>
        ) : null}
      </div>
    </section>
  )
}
