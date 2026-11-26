"use client"
import { useEffect, useId, useState } from "react"
import { ImageCropper } from "@ankvale/ui/components/image-cropper"
import { Button } from "@ankvale/ui/components/button"
const artwork = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="#f5f5f5"/><rect x="110" y="120" width="340" height="400" rx="24" fill="#191919"/><circle cx="590" cy="290" r="170" fill="#0d6efd"/><rect x="630" y="330" width="210" height="190" rx="24" fill="#ffffff" stroke="#d6d6d6" stroke-width="4"/></svg>')}`
function ImageCropperPreview() {
  const id = useId()
  const [source, setSource] = useState<Blob | string | null>(artwork)
  const [download, setDownload] = useState("")
  useEffect(() => {
    if (download) return () => URL.revokeObjectURL(download)
  }, [download])
  return (
    <div className="w-full max-w-4xl space-y-4">
      <label htmlFor={id} className="grid gap-2 text-sm font-medium">
        Image
        <input
          id={id}
          type="file"
          accept="image/*"
          className="max-w-full rounded-md border p-2 font-normal"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              setSource(file)
              setDownload("")
            }
            event.target.value = ""
          }}
        />
      </label>
      <ImageCropper
        source={source}
        alt="Geometric study with a blue circle and dark rectangle"
        onCrop={(blob) => setDownload(URL.createObjectURL(blob))}
        onCancel={() => {
          setSource(null)
          setDownload("")
        }}
      />
      {download ? (
        <Button
          nativeButton={false}
          variant="outline"
          render={<a href={download} download="ankvale-crop.png" />}
        >
          Download cropped image
        </Button>
      ) : null}
    </div>
  )
}
const previews = { "image-cropper": ImageCropperPreview }
export const assetPreviewNames = Object.keys(previews)
export function AssetPreview({ name }: { name: string }) {
  const Preview = previews[name as keyof typeof previews]
  return Preview ? <Preview /> : null
}
