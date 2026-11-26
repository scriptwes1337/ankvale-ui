import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react"
import { useState } from "react"
import {
  AnkvaleProvider,
  useAnkvaleConfig,
} from "../packages/ui/src/components/ankvale-provider"
import {
  AnimationProvider,
  Presence,
  ReorderList,
  type ReorderListItem,
} from "../packages/ui/src/components/animation"
import { useReducedMotion } from "../packages/ui/src/hooks/use-reduced-motion"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../packages/ui/src/components/dialog"
function Config() {
  const config = useAnkvaleConfig()
  const reduced = useReducedMotion()
  return (
    <p>
      {config.locale}|{config.direction}|{config.density}|{String(reduced)}
    </p>
  )
}
function ReorderExample() {
  const [items, setItems] = useState<ReorderListItem[]>([
    { id: "a", label: "Brief" },
    { id: "b", label: "Design" },
    { id: "c", label: "Launch" },
  ])
  return (
    <AnkvaleProvider motion="none">
      <ReorderList items={items} onItemsChange={setItems} label="Tasks" />
    </AnkvaleProvider>
  )
}
function PresenceExample() {
  const [present, setPresent] = useState(true)
  return (
    <AnimationProvider disabled>
      <button onClick={() => setPresent((v) => !v)}>Toggle</button>
      <Presence present={present}>
        <button>Notice action</button>
      </Presence>
    </AnimationProvider>
  )
}
export async function run() {
  const html = renderToString(
    <AnkvaleProvider
      appearance="light"
      motion="none"
      direction="rtl"
      locale="ar"
      density="compact"
    >
      <Config />
    </AnkvaleProvider>
  )
  assert(html.includes('dir="rtl"'))
  assert(html.includes('data-motion="none"'))
  assert(html.replace(/<!--.*?-->/g, "").includes("ar|rtl|compact|true"))
  assert(!/opacity:0/.test(html))
  console.log(
    "✓ provider defaults and static content render deterministically on the server"
  )
  render(
    <AnkvaleProvider motion="none" locale="en-SG">
      <AnkvaleProvider locale="fr-FR">
        <Config />
      </AnkvaleProvider>
    </AnkvaleProvider>
  )
  assert(screen.getByText("fr-FR|ltr|comfortable|true"))
  cleanup()
  render(
    <AnkvaleProvider appearance="dark" direction="rtl" density="spacious">
      <Dialog>
        <DialogTrigger>Open preferences</DialogTrigger>
        <DialogContent>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>Scoped overlay.</DialogDescription>
        </DialogContent>
      </Dialog>
    </AnkvaleProvider>
  )
  fireEvent.click(screen.getByRole("button", { name: "Open preferences" }))
  const dialog = await screen.findByRole("dialog")
  const provider = dialog.closest('[data-slot="ankvale-provider"]')
  assert(provider)
  assert(provider.classList.contains("dark"))
  assert.equal(provider.getAttribute("dir"), "rtl")
  cleanup()
  console.log(
    "✓ nested motion opt-out, inherited defaults and portal scope/theme/direction"
  )
  render(<PresenceExample />)
  fireEvent.click(screen.getByRole("button", { name: "Toggle" }))
  await waitFor(() =>
    assert.equal(screen.queryByRole("button", { name: "Notice action" }), null)
  )
  fireEvent.click(screen.getByRole("button", { name: "Toggle" }))
  assert(await screen.findByRole("button", { name: "Notice action" }))
  cleanup()
  render(<ReorderExample />)
  fireEvent.click(screen.getByRole("button", { name: "Move Brief down" }))
  await waitFor(() => {
    const labels = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent)
    assert(labels[0]?.includes("Design"))
    assert(labels[1]?.includes("Brief"))
  })
  assert(screen.getByRole("status").textContent?.includes("position 2 of 3"))
  cleanup()
  console.log("✓ presence toggling and explicit accessible reorder actions")
  const original = window.matchMedia
  let reduce = false
  const listeners = new Set<() => void>()
  window.matchMedia = (() => ({
    matches: reduce,
    addEventListener: (_name: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_name: string, fn: () => void) =>
      listeners.delete(fn),
  })) as unknown as typeof window.matchMedia
  render(
    <AnkvaleProvider>
      <Config />
    </AnkvaleProvider>
  )
  assert(screen.getByText("en-US|ltr|comfortable|false"))
  act(() => {
    reduce = true
    listeners.forEach((fn) => fn())
  })
  assert(screen.getByText("en-US|ltr|comfortable|true"))
  cleanup()
  assert.equal(listeners.size, 0)
  window.matchMedia = original
  console.log("✓ live reduced-motion preferences and listener cleanup")
}
