import { JSDOM } from "jsdom"
import { build } from "esbuild"
import Module from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
})
for (const name of [
  "self",
  "window",
  "location",
  "history",
  "document",
  "navigator",
  "HTMLElement",
  "SVGElement",
  "XMLSerializer",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLImageElement",
  "HTMLCanvasElement",
  "Range",
  "Element",
  "Node",
  "Event",
  "MouseEvent",
  "CustomEvent",
  "MutationObserver",
  "DocumentFragment",
  "HTMLInputElement",
  "HTMLButtonElement",
  "File",
  "Blob",
  "localStorage",
]) {
  Object.defineProperty(globalThis, name, {
    value: name === "window" ? dom.window : dom.window[name],
    configurable: true,
  })
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window)
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window
)
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window
)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub
dom.window.ResizeObserver = ResizeObserverStub
dom.window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
})
HTMLElement.prototype.scrollIntoView = function () {}

const result = await build({
  entryPoints: [path.join(root, process.argv[2] ?? "tests/tooling.test.tsx")],
  write: false,
  jsx: "automatic",
  bundle: true,
  platform: "node",
  format: "cjs",
  tsconfig: path.join(root, "apps/web/tsconfig.json"),
  external: [
    "react",
    "react/*",
    "react-dom",
    "react-dom/*",
    "@testing-library/react",
  ],

  plugins: [
    {
      name: "next-image-cjs-interop",
      setup(build) {
        // Keep Next's real Image component while normalizing its CJS default export.
        build.onResolve({ filter: /^next\/image$/ }, () => ({
          path: "next-image",
          namespace: "next-test",
        }))
        build.onLoad({ filter: /.*/, namespace: "next-test" }, () => ({
          contents:
            'export { Image as default } from "next/dist/client/image-component.js"',
          resolveDir: root,
        }))
      },
    },
  ],
  logLevel: "warning",
})
const filename = path.join(root, ".tooling-tests.cjs")
const compiled = new Module(filename)
compiled.filename = filename
compiled.paths = Module._nodeModulePaths(root)
compiled._compile(result.outputFiles[0].text, filename)
try {
  await compiled.exports.run()
} finally {
  dom.window.close()
}
