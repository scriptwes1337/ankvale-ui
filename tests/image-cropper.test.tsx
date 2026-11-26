import assert from "node:assert/strict"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import {
  getImageCrop,
  ImageCropper,
} from "../packages/ui/src/components/image-cropper"
export async function run() {
  const crop = getImageCrop(1200, 800, 1, 50, 100, 0, 200)
  assert.deepEqual(crop, {
    x: 800,
    y: 0,
    width: 400,
    height: 400,
    outputWidth: 200,
    outputHeight: 200,
  })
  assert.equal(getImageCrop(1200, 800, null, 100, 50, 50).width, 1200)
  console.log(
    "✓ pixel crop geometry stays within source bounds and limits export dimensions"
  )
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL
  const originalContext = HTMLCanvasElement.prototype.getContext
  const originalToBlob = HTMLCanvasElement.prototype.toBlob
  const created: string[] = []
  const revoked: string[] = []
  const draws: unknown[][] = []
  URL.createObjectURL = () => {
    const url = `blob:crop-${created.length}`
    created.push(url)
    return url
  }
  URL.revokeObjectURL = (url) => {
    revoked.push(url)
  }
  HTMLCanvasElement.prototype.getContext = (() => ({
    drawImage: (...args: unknown[]) => draws.push(args),
  })) as typeof HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.toBlob = function (callback) {
    callback(new Blob(["encoded crop"], { type: "image/png" }))
  }
  function load() {
    const img = screen.getByAltText("Test image")
    Object.defineProperties(img, {
      naturalWidth: { value: 1200, configurable: true },
      naturalHeight: { value: 800, configurable: true },
    })
    fireEvent.load(img)
  }
  try {
    const source = new Blob(["source"], { type: "image/png" })
    let payload: unknown[] = []
    let resolveSave: () => void = () => {}
    const saved = new Promise<void>((resolve) => {
      resolveSave = resolve
    })
    const view = render(
      <ImageCropper
        source={source}
        alt="Test image"
        onCrop={async (...args) => {
          payload = args
          await saved
        }}
      />
    )
    assert.ok(screen.getByText("Loading image…"))
    load()
    fireEvent.change(screen.getByLabelText("Aspect ratio"), {
      target: { value: "1" },
    })
    fireEvent.change(screen.getByRole("slider", { name: "Crop size" }), {
      target: { value: "50" },
    })
    fireEvent.change(
      screen.getByRole("slider", { name: "Horizontal position" }),
      {
        target: { value: "100" },
      }
    )
    fireEvent.change(
      screen.getByRole("slider", { name: "Vertical position" }),
      {
        target: { value: "0" },
      }
    )
    assert.ok(screen.getByRole("img", { name: "Cropped preview: Test image" }))
    fireEvent.click(screen.getByRole("button", { name: "Save crop" }))
    await waitFor(() => assert.equal(payload.length, 3))
    assert.equal((payload[0] as Blob).type, "image/png")
    assert.deepEqual(payload[1], {
      x: 800,
      y: 0,
      width: 400,
      height: 400,
      outputWidth: 400,
      outputHeight: 400,
    })
    assert.deepEqual(draws[0]?.slice(1), [800, 0, 400, 400, 0, 0, 400, 400])
    assert.ok(
      (
        screen.getByRole("button", {
          name: "Saving crop…",
        }) as HTMLButtonElement
      ).disabled
    )
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    assert.equal((payload[2] as { signal: AbortSignal }).signal.aborted, true)
    resolveSave()
    await waitFor(() =>
      assert.ok(screen.getByRole("button", { name: "Save crop" }))
    )
    assert.equal(screen.queryByText("Crop saved."), null)
    const second = new Blob(["second"], { type: "image/png" })
    view.rerender(
      <ImageCropper
        source={second}
        alt="Test image"
        onCrop={() => {
          throw new Error("Upload rejected")
        }}
      />
    )
    assert.ok(revoked.includes("blob:crop-0"))
    load()
    fireEvent.click(screen.getByRole("button", { name: "Save crop" }))
    await screen.findByText("Upload rejected")
    assert.equal(
      (screen.getByRole("slider", { name: "Crop size" }) as HTMLInputElement)
        .value,
      "80"
    )
    cleanup()
    assert.ok(revoked.includes("blob:crop-1"))
    console.log(
      "✓ adjustable crop draws selected source pixels, awaits callback, supports abort without stale success, retains edits on failure and revokes URLs"
    )
    render(
      <ImageCropper
        source="https://example.invalid/image.png"
        alt="Test image"
        onCrop={() => {}}
      />
    )
    fireEvent.error(screen.getByAltText("Test image"))
    assert.ok(screen.getByRole("alert"))
    fireEvent.click(screen.getByRole("button", { name: "Retry loading" }))
    assert.ok(screen.getByText("Loading image…"))
    load()
    HTMLCanvasElement.prototype.toBlob = function () {
      throw new DOMException("Tainted canvas", "SecurityError")
    }
    fireEvent.click(screen.getByRole("button", { name: "Save crop" }))
    await screen.findByText(/allows cross-origin access/)
    console.log(
      "✓ image loading retry and tainted-canvas errors offer recovery"
    )
  } finally {
    cleanup()
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
    HTMLCanvasElement.prototype.getContext = originalContext
    HTMLCanvasElement.prototype.toBlob = originalToBlob
  }
}
