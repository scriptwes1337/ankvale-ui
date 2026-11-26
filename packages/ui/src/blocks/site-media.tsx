"use client"
import type { ReactNode } from "react"
import { ImageList } from "@ankvale/ui/components/image-list"
import type { GalleryImage } from "@ankvale/ui/components/image"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
import { Button } from "@ankvale/ui/components/button"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
export function MediaGallery({
  images,
  label = "Image gallery",
  ...props
}: SectionProps & { images: GalleryImage[]; label?: string }) {
  return (
    <BlockSection {...props} data-slot="media-gallery">
      <SectionHeading {...props} />
      <ImageList images={images} label={label} />
    </BlockSection>
  )
}
export type VideoShowcaseProps = SectionProps & {
  src: string
  poster?: string
  videoTitle: string
  captionSrc?: string
  captionLanguage?: string
  transcript?: ReactNode
}
export function VideoShowcase({
  src,
  poster,
  videoTitle,
  captionSrc,
  captionLanguage = "en",
  transcript,
  ...props
}: VideoShowcaseProps) {
  return (
    <BlockSection {...props} data-slot="video-showcase">
      <div className="grid items-center gap-10 md:grid-cols-[.8fr_1.2fr]">
        <SectionHeading {...props} className="mb-0" />
        <Dialog>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="relative aspect-video h-auto w-full overflow-hidden p-0"
              />
            }
            aria-label={`Play ${videoTitle}`}
          >
            {poster ? (
              <img
                src={poster}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 bg-muted" />
            )}
            <span className="relative rounded-full border bg-background px-6 py-4 text-sm">
              <span aria-hidden="true">▶ </span>Watch video
            </span>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-auto sm:max-w-4xl">
            <DialogTitle>{videoTitle}</DialogTitle>
            <DialogDescription className="sr-only">
              Video player with playback controls.
            </DialogDescription>
            <video
              src={src}
              poster={poster}
              controls
              preload="metadata"
              aria-label={videoTitle}
              className="aspect-video w-full rounded-md bg-muted"
            >
              {captionSrc && (
                <track
                  kind="captions"
                  label="Captions"
                  srcLang={captionLanguage}
                  src={captionSrc}
                  default
                />
              )}
              Your browser does not support embedded video.
            </video>
            {transcript && (
              <details className="rounded-md border p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Read transcript
                </summary>
                <div className="mt-3 text-sm leading-7 text-muted-foreground">
                  {transcript}
                </div>
              </details>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </BlockSection>
  )
}
