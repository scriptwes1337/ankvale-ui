import assert from "node:assert/strict"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import {
  readDroppedFiles,
  UploadManager,
} from "../packages/ui/src/components/upload-manager"
function fileEntry(
  file: File,
  getFile = (resolve: (file: File) => void) => resolve(file)
): FileSystemEntry {
  return {
    name: file.name,
    isFile: true,
    isDirectory: false,
    file: getFile,
  } as unknown as FileSystemEntry
}
function directory(
  name: string,
  batches: FileSystemEntry[][]
): FileSystemEntry {
  return {
    name,
    isFile: false,
    isDirectory: true,
    createReader() {
      let index = 0
      return {
        readEntries(resolve: (items: FileSystemEntry[]) => void) {
          resolve(batches[index++] ?? [])
        },
      }
    },
  } as unknown as FileSystemEntry
}
function transfer(entries: FileSystemEntry[]): DataTransfer {
  return {
    files: [],
    items: entries.map((entry) => ({
      kind: "file",
      webkitGetAsEntry: () => entry,
      getAsFile: () => null,
    })),
  } as unknown as DataTransfer
}
export async function run() {
  const one = new File(["a"], "same.txt", {
    type: "text/plain",
    lastModified: 1,
  })
  const two = new File(["b"], "same.txt", {
    type: "text/plain",
    lastModified: 1,
  })
  const three = new File(["c"], "last.txt", {
    type: "text/plain",
    lastModified: 1,
  })
  const root = () =>
    directory("project", [
      [directory("one", [[fileEntry(one)], []])],
      [directory("two", [[fileEntry(two)], []]), fileEntry(three)],
      [],
    ])
  const files = await readDroppedFiles(transfer([root()]))
  assert.deepEqual(
    files.map((item) => item.relativePath),
    ["project/one/same.txt", "project/two/same.txt", "project/last.txt"]
  )
  assert.deepEqual(
    files.map((item) => item.file),
    [one, two, three]
  )
  await assert.rejects(
    readDroppedFiles(transfer([root()]), { maxFiles: 2 }),
    /2-file limit/
  )
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    readDroppedFiles(transfer([root()]), { signal: controller.signal }),
    (error) => error instanceof DOMException && error.name === "AbortError"
  )
  const fallback = await readDroppedFiles({
    files: [one],
    items: [],
  } as unknown as DataTransfer)
  assert.equal(fallback[0]?.file, one)
  console.log(
    "✓ recursive directory traversal exhausts all reader batches, preserves hierarchy, falls back to files and enforces bounds/cancellation"
  )
  let release: () => void = () => {}
  const delayed = fileEntry(three, (resolve) => {
    release = () => resolve(three)
  })
  const staged = directory("project", [
    [
      directory("one", [[fileEntry(one)], []]),
      directory("two", [[fileEntry(two)], []]),
      delayed,
    ],
    [],
  ])
  const uploads: { name: string; path?: string }[] = []
  render(
    <UploadManager
      label="Files"
      allowDirectory
      concurrency={1}
      beforeUpload={(file) =>
        new File(["transformed"], file.name.replace(".txt", ".png"), {
          type: "image/png",
        })
      }
      upload={async (file, context) => {
        uploads.push({ name: file.name, path: context.relativePath })
      }}
    />
  )
  fireEvent.drop(screen.getByRole("region", { name: "Files" }), {
    dataTransfer: transfer([staged]),
  })
  await screen.findByText("Reading dropped files…")
  assert.equal(
    uploads.length,
    0,
    "No file uploads before the complete traversal enters the queue"
  )
  release()
  await waitFor(() => assert.equal(uploads.length, 3))
  assert.ok(
    uploads.every((item) => item.name.endsWith(".png")),
    "Transforms retain source relative paths in transport context"
  )
  assert.deepEqual(
    uploads.map((item) => item.path),
    ["project/one/same.txt", "project/two/same.txt", "project/last.txt"]
  )
  assert.ok(screen.getByText("project/one/same.txt"))
  assert.ok(screen.getByText("project/two/same.txt"))
  cleanup()
  const failure = {
    name: "broken",
    isFile: false,
    isDirectory: true,
    createReader: () => ({
      readEntries(_resolve: unknown, reject: (reason: Error) => void) {
        reject(new Error("Directory permission denied"))
      },
    }),
  } as unknown as FileSystemEntry
  render(
    <UploadManager
      label="Files"
      allowDirectory
      upload={async () => {
        throw new Error("Should not upload")
      }}
    />
  )
  fireEvent.drop(screen.getByRole("region", { name: "Files" }), {
    dataTransfer: transfer([failure]),
  })
  await screen.findByText("Directory permission denied")
  assert.equal(screen.queryByText("Reading dropped files…"), null)
  cleanup()
  console.log(
    "✓ manager queues only complete traversal, uploads same-named files in separate folders with source path metadata, and reports directory read failures"
  )
}
