# Image cropper

`ImageCropper` is a client-side raster crop editor with source selection owned by the application. Import it from `@ankvale/ui/components/image-cropper` in this checkout. Its public types are `ImageCropperProps` and `ImageCrop`; `getImageCrop` exposes the pixel geometry helper.

Pass `source: Blob | string | null`, a descriptive `alt`, and `onCrop(blob, crop, { signal })`. A File is a Blob. Local source URLs are created and revoked when the source changes, retries, or unmounts. Remote URLs use anonymous CORS and require appropriate server headers; load and canvas security failures provide recovery feedback. The component never uploads an image itself.

Persistent labels and native range/select controls adjust horizontal position, vertical position, crop size and aspect ratio with keyboard or pointer. The source selection outline and separate crop preview reflect the same source-coordinate rectangle used by `canvas.drawImage`. `ImageCrop` includes source `x/y/width/height` and integer `outputWidth/outputHeight`; output dimensions default to a maximum edge of 4096 pixels without upscaling. `maxOutputDimension` changes that bound. Default aspects include original, square, landscape, wide and portrait. Supply positive custom ratios or null for original through `aspectRatios`.

`mimeType` supports PNG (default), JPEG and WebP, with `quality` for supported encoders. Use the returned Blob's actual type: browser encoders can fall back to PNG. JPEG has no alpha channel. This cropper does not provide image rotation, EXIF editing, vector editing or a full image manipulation pipeline. Animated sources export the frame rendered by the browser. Domain validation and upload policy remain the application’s responsibility.

The crop callback is awaited. Controls disable during export/save, cancellation remains available, errors preserve the crop, and success is announced only after the callback resolves. Cancel aborts the callback signal and calls `onCancel`; the application owns closing an overlay or clearing its source. Abort does not undo a completed server write; callback implementations must honor the signal for cancellable work. A cancelled, replaced or unmounted export cannot announce stale success. Native canvas encoding itself cannot be interrupted, so a cancelled result is discarded afterward. Crop geometry updates immediately, with no decorative animation or motion dependency.

## UploadManager beforeUpload bridge

`UploadManager` already accepts `beforeUpload(file): File | Promise<File>`. Open an ImageCropper in a Base UI Dialog and resolve that promise with a new File only after the person saves. A serialized crop request queue is appropriate when upload concurrency exceeds one; do not overwrite a single pending resolver with the next file. Close/reject pending requests on route unmount so queued uploads cannot hang.

```tsx
// Called by UploadManager beforeUpload. requestCrop is an application-owned
// queued dialog flow which resolves the Blob or rejects when cancelled.
async function beforeUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file
  const cropped = await requestCrop(file)
  const extension =
    cropped.type === "image/jpeg"
      ? "jpg"
      : cropped.type === "image/webp"
        ? "webp"
        : "png"
  return new File(
    [cropped],
    `${file.name.replace(/\.[^.]+$/, "")}.${extension}`,
    {
      type: cropped.type,
      lastModified: Date.now(),
    }
  )
}
// In the queued crop dialog:
// <ImageCropper source={pending.file} alt={pending.file.name}
//   onCrop={(blob) => pending.resolve(blob)}
//   onCancel={() => pending.reject(new Error("Crop cancelled"))} />
```

The existing upload queue checks its abort signal after `beforeUpload` resolves. Its transform callback does not currently receive that signal; crop-dialog queue cancellation must be coordinated by the owner. Rejecting a transform uses the upload queue's error path, allowing retry. Use the actual `upload(file, { signal, onProgress })` transport for persistence and progress; cropping has no simulated network state.

## Preview and verification

The extractable `asset-previews.tsx` example contains original SVG geometry, accepts local files and offers a real cropped PNG download. Its output URL is revoked when replaced/unmounted. Source SVG is only a small generated demo asset; canvas exports real raster bytes in the browser.

`node scripts/test-tooling.mjs tests/image-cropper.test.tsx` verifies crop math/output bounds, accessible adjustment, exact canvas draw coordinates, Blob callback payload, pending and cancellation behavior, stale result suppression, failure/value preservation, source URL lifecycle, load retry and canvas security errors. The test harness stubs canvas encoding; browser verification of decoded files, raster output and responsive appearance remains necessary. No shared registry/catalog regeneration is performed by this implementation task.
