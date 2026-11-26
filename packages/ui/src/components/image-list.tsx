"use client"
import { useState } from "react"
import {
  Image,
  ImagePreview,
  type GalleryImage,
} from "@ankvale/ui/components/image"
import { cn } from "@ankvale/ui/lib/utils"
export function ImageList({
  images,
  label,
  className,
}: {
  images: GalleryImage[]
  label: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  return (
    <section data-slot="image-list" aria-label={label}>
      {!images.length ? (
        <p className="text-sm text-muted-foreground">No images.</p>
      ) : (
        <ul className={cn("grid grid-cols-2 gap-4 md:grid-cols-3", className)}>
          {images.map((image, i) => (
            <li key={image.id}>
              <figure>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i)
                    setOpen(true)
                  }}
                  aria-label={`Preview ${image.alt}`}
                  className="block w-full overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className="aspect-[4/3] w-full"
                  />
                </button>
                {image.caption && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      )}
      <ImagePreview
        images={images}
        index={Math.min(index, images.length - 1)}
        onIndexChange={setIndex}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  )
}
