import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { unzipSync, strFromU8 } from "fflate"
import { renderToString } from "react-dom/server"
import { render, cleanup, fireEvent, act } from "@testing-library/react"
import { Motion } from "../packages/ui/src/components/motion"
import { NotFoundPage } from "../packages/ui/src/blocks/error-pages"
export async function run() {
  const fullRegistry = JSON.parse(
    await readFile("apps/web/public/r/ankvale-ui.json", "utf8")
  )
  assert(
    fullRegistry.css[":root"]["--surface-shadow"],
    "Motion tokens must preserve existing root CSS"
  )
  assert.equal(fullRegistry.cssVars.light["motion-fast"], "120ms")
  const patterns = JSON.parse(
    await readFile("apps/web/public/api/patterns.json", "utf8")
  )
  const sourcePatterns = JSON.parse(
    await readFile("docs/agents/patterns.json", "utf8")
  )
  assert.deepEqual(
    patterns,
    sourcePatterns,
    "Published task recipes must match their source"
  )
  assert.equal(
    new Set(patterns.map((pattern: { id: string }) => pattern.id)).size,
    patterns.length,
    "Task recipe IDs must be unique"
  )
  const recommendedBlocks = new Set(
    patterns.flatMap((pattern: { blocks: string[] }) => pattern.blocks)
  )
  for (const family of ["app", "site"]) {
    const definitions = JSON.parse(
      await readFile(`apps/web/lib/${family}-block-definitions.json`, "utf8")
    )
    for (const { id } of definitions) {
      assert(recommendedBlocks.has(id), `Missing task recommendation for ${id}`)
    }
  }
  const recommendedComponents = new Set(
    patterns.flatMap((pattern: { components: string[] }) => pattern.components)
  )
  const documentedComponents: string[] = []
  for (const family of ["enhancement", "asset", "query"]) {
    const names = JSON.parse(
      await readFile(`apps/web/lib/${family}-preview-names.json`, "utf8")
    )
    documentedComponents.push(...names)
    for (const id of names) {
      assert(
        recommendedComponents.has(id),
        `Missing task recommendation for ${id}`
      )
    }
  }
  for (const id of ["ankvale-provider", "animation"]) {
    assert(
      recommendedComponents.has(id),
      `Missing task recommendation for ${id}`
    )
  }
  const selectionGuide = await readFile(
    "docs/agents/component-selection.md",
    "utf8"
  )
  for (const id of documentedComponents) {
    assert(selectionGuide.includes(id), `Selection guide must explain ${id}`)
  }
  for (const id of [...recommendedBlocks].filter((id) =>
    String(id).startsWith("app-")
  )) {
    assert(
      selectionGuide.includes(String(id)),
      `Selection guide must explain ${id}`
    )
  }
  for (const pattern of patterns) {
    for (const id of [
      ...pattern.components,
      ...pattern.blocks,
      ...pattern.templates.map((name: string) => `${name}-template`),
    ]) {
      const manifest = JSON.parse(
        await readFile(`apps/web/public/r/${id}.json`, "utf8")
      )
      assert.equal(manifest.name, id)
    }
  }
  for (const name of ["ankvale-code", "ankvale-design"]) {
    const files = unzipSync(
      await readFile(`apps/web/public/downloads/${name}.zip`)
    )
    const skill = strFromU8(files[`${name}/SKILL.md`]!)
    for (const match of skill.matchAll(/\]\((references\/[^)]+)\)/g)) {
      assert(
        files[`${name}/${match[1]}`],
        `Missing packaged reference ${match[1]}`
      )
    }
  }
  const bundle = unzipSync(
    await readFile("apps/web/public/downloads/ankvale-agent-guide.zip")
  )
  for (const name of [
    "AGENTS.md",
    "component-selection.md",
    "design-guide.md",
    "motion-guide.md",
    "patterns.json",
  ])
    assert(bundle[`ankvale-ui/${name}`])
  assert.deepEqual(
    JSON.parse(strFromU8(bundle["ankvale-ui/patterns.json"]!)),
    sourcePatterns,
    "Packaged recipes must match source"
  )
  assert.equal(
    strFromU8(bundle["ankvale-ui/component-selection.md"]!),
    selectionGuide,
    "Packaged selection guidance must match source"
  )
  console.log(
    "✓ task recommendations resolve to real registry items; skill and AGENTS bundles include references"
  )
  const html = renderToString(
    <Motion>
      <button>Continue</button>
    </Motion>
  )
  assert(html.includes("Continue") && !html.includes("opacity:0"))
  const notFound = render(<NotFoundPage secondaryHref="/playground" />)
  assert.equal(
    notFound.getByRole("heading", { level: 1 }).textContent,
    "Page not found"
  )
  assert.equal(
    notFound.getByRole("link", { name: "Go home" }).getAttribute("href"),
    "/"
  )
  assert.equal(
    notFound
      .getByRole("link", { name: "Browse components" })
      .getAttribute("href"),
    "/playground"
  )
  cleanup()
  console.log(
    "✓ server-rendered content stays visible and 404 offers valid recovery destinations"
  )
  let reduced = false,
    plays = 0,
    cancels = 0
  const listeners = new Set<() => void>()
  const originalMedia = window.matchMedia
  window.matchMedia = (() => ({
    get matches() {
      return reduced
    },
    addEventListener(_type: string, fn: () => void) {
      listeners.add(fn)
    },
    removeEventListener(_type: string, fn: () => void) {
      listeners.delete(fn)
    },
  })) as unknown as typeof window.matchMedia
  const originalAnimate = HTMLElement.prototype.animate
  HTMLElement.prototype.animate = function () {
    plays++
    return {
      cancel() {
        cancels++
      },
    } as Animation
  }
  const originalObserver = globalThis.IntersectionObserver
  let intersect: (() => void) | undefined
  globalThis.IntersectionObserver = class {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      intersect = () => callback([{ isIntersecting: true }])
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
  try {
    const view = render(
      <Motion>
        <button>Continue</button>
      </Motion>
    )
    assert.equal(plays, 0)
    act(() => intersect?.())
    assert.equal(plays, 1)
    view.rerender(
      <Motion>
        <button>Continue again</button>
      </Motion>
    )
    assert.equal(plays, 1, "ordinary rerenders must not replay motion")
    fireEvent.focusIn(view.getByRole("button"))
    assert(cancels > 0)
    cleanup()
    const before = plays
    reduced = true
    render(
      <Motion>
        <button>Static</button>
      </Motion>
    )
    act(() => intersect?.())
    assert.equal(plays, before, "reduced motion must not animate")
    cleanup()
    reduced = false
    render(
      <Motion>
        <span>Live preference</span>
      </Motion>
    )
    act(() => intersect?.())
    const cancelBefore = cancels
    act(() => {
      reduced = true
      listeners.forEach((listener) => listener())
    })
    assert(
      cancels > cancelBefore,
      "live preference changes cancel active motion"
    )
    cleanup()
    reduced = false
    render(
      <div data-motion="none">
        <Motion>Static subtree</Motion>
      </div>
    )
    const subtreeBefore = plays
    act(() => intersect?.())
    assert.equal(plays, subtreeBefore)
    cleanup()
    delete (
      globalThis as { IntersectionObserver?: typeof IntersectionObserver }
    ).IntersectionObserver
    render(<Motion>Fallback</Motion>)
    assert(
      plays > subtreeBefore,
      "missing observer should gracefully play on mount"
    )
    cleanup()
    delete (
      HTMLElement.prototype as {
        animate?: typeof HTMLElement.prototype.animate
      }
    ).animate
    assert(
      render(<Motion>No animation API</Motion>).getByText("No animation API")
    )
    cleanup()
  } finally {
    window.matchMedia = originalMedia
    HTMLElement.prototype.animate = originalAnimate
    globalThis.IntersectionObserver = originalObserver
  }
  console.log(
    "✓ motion viewport lifecycle, replay prevention, focus cancellation, live reduced motion and API fallbacks"
  )
}
