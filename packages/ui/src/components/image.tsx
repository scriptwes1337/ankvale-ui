"use client"
import { useState, type ComponentProps, type ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ankvale/ui/components/dialog"
import { Button } from "@ankvale/ui/components/button"
export type ImageProps = Omit<ComponentProps<"img">, "src"> & {
  src: string
  alt: string
  fallback?: ReactNode
}
function ImageAsset({
  fallback = "Image unavailable",
  className,
  alt,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return failed ? (
    <span
      data-slot="image-fallback"
      role="img"
      aria-label={alt}
      className={cn(
        "flex min-h-32 items-center justify-center bg-muted p-4 text-sm text-muted-foreground",
        className
      )}
    >
      {fallback}
    </span>
  ) : (
    <img
      {...props}
      alt={alt}
      data-slot="image"
      loading={props.loading ?? "lazy"}
      className={cn(
        "block max-w-full object-cover",
        !loaded && "bg-muted",
        className
      )}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      onError={(e) => {
        setFailed(true)
        onError?.(e)
      }}
    />
  )
}
export function Image(props: ImageProps) {
  return <ImageAsset key={props.src} {...props} />
}
export type GalleryImage = {
  id: string
  src: string
  alt: string
  caption?: string
}
function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [zoom, setZoom] = useState(1)
  return (
    <div className="space-y-3">
      <div
        tabIndex={0}
        aria-label="Image viewing area"
        className="h-[min(60vh,640px)] overflow-auto rounded border focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
          <Image src={src} alt={alt} className="size-full object-contain" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={() => setZoom((v) => Math.max(1, v - 0.5))}
        >
          −
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Reset zoom"
          onClick={() => setZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Zoom in"
          disabled={zoom >= 3}
          onClick={() => setZoom((v) => Math.min(3, v + 0.5))}
        >
          +
        </Button>
      </div>
    </div>
  )
}
export function ImagePreview({
  images,
  index = 0,
  onIndexChange,
  open,
  onOpenChange,
}: {
  images: GalleryImage[]
  index?: number
  onIndexChange?: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const current = images[index]
  if (!current) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && index < images.length - 1) {
            e.preventDefault()
            onIndexChange?.(index + 1)
          } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault()
            onIndexChange?.(index - 1)
          }
        }}
      >
        <DialogTitle>{current.caption ?? current.alt}</DialogTitle>
        <ZoomableImage key={current.id} src={current.src} alt={current.alt} />
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={index === 0 || !onIndexChange}
            onClick={() => onIndexChange?.(index - 1)}
          >
            Previous
          </Button>
          <p role="status" className="text-xs text-muted-foreground">
            {index + 1} / {images.length}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={index === images.length - 1 || !onIndexChange}
            onClick={() => onIndexChange?.(index + 1)}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export function ImageLightbox({
  src,
  alt,
  caption,
  className,
}: GalleryImage & { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "block overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label={`Preview ${alt}`}
      >
        <Image src={src} alt={alt} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogTitle>{caption ?? alt}</DialogTitle>
        <ZoomableImage src={src} alt={alt} />
      </DialogContent>
    </Dialog>
  )
}
