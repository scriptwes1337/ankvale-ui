import assert from "node:assert/strict"
import { readdir } from "node:fs/promises"
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { Playground } from "../apps/web/components/playground"

export async function run() {
  const files = (await readdir("packages/ui/src/components"))
    .filter((file) => file.endsWith(".tsx"))
    .sort()
  const components = files.map((file) => ({
    name: file.replace(/\.tsx$/, ""),
    title: file
      .replace(/\.tsx$/, "")
      .split("-")
      .map((part) => part[0]!.toUpperCase() + part.slice(1))
      .join(" "),
    source: "// Test source",
  }))
  const observers: {
    callback: IntersectionObserverCallback
    target?: Element
  }[] = []
  class Observer {
    record: (typeof observers)[number]
    constructor(callback: IntersectionObserverCallback) {
      this.record = { callback }
      observers.push(this.record)
    }
    observe(target: Element) {
      this.record.target = target
    }
    disconnect() {}
    unobserve() {}
  }
  const previousObserver = window.IntersectionObserver
  Object.assign(window, { IntersectionObserver: Observer })
  Object.assign(globalThis, { IntersectionObserver: Observer })
  window.scrollTo = () => {}
  render(<Playground components={components} />)
  assert.equal(
    screen.getByRole("link", { name: "Ankvale UI home" }).getAttribute("href"),
    "/"
  )
  assert(screen.getByRole("navigation", { name: "Main navigation" }))
  assert.equal(screen.queryByRole("link", { name: "Home", exact: true }), null)
  const main = within(screen.getByRole("main"))
  assert.equal(main.getAllByRole("article").length, components.length)
  for (const component of components) {
    assert(main.getByRole("heading", { name: component.title, level: 2 }))
  }
  assert.equal(main.queryByText("The essentials"), null)
  assert.equal(main.queryByText("The complete collection"), null)
  const buttonTile = main.getByRole("article", { name: "Button component" })
  assert.equal(
    within(buttonTile).queryByRole("button", { name: "Get started" }),
    null
  )
  const buttonObserver = observers.find(
    (item) => item.target && buttonTile.contains(item.target)
  )!
  await act(async () =>
    buttonObserver.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  )
  assert(within(buttonTile).getByRole("button", { name: "Get started" }))

  const search = screen.getByRole("searchbox", {
    name: "Search all components",
  })
  fireEvent.change(search, { target: { value: "  date-picker  " } })
  assert.equal(main.getAllByRole("article").length, 2)
  assert(main.getByRole("heading", { name: "Date Picker", level: 2 }))
  const navigation = within(
    screen.getByRole("navigation", { name: "Components" })
  )
  assert.equal(navigation.getAllByRole("button").length, 2)
  fireEvent.click(navigation.getByRole("button", { name: "Date Picker" }))
  assert.equal(window.location.hash, "#date-picker")
  assert(main.getByRole("heading", { name: "Date Picker", level: 1 }))
  fireEvent.change(screen.getByRole("textbox", { name: "Find a component" }), {
    target: { value: "not-a-real-component" },
  })
  assert.equal(window.location.hash, "")
  assert.equal(main.queryAllByRole("article").length, 0)
  assert(main.getByText("No components found. Try another name."))
  fireEvent.click(main.getByRole("button", { name: "Clear search" }))
  assert.equal(main.getAllByRole("article").length, components.length)
  fireEvent.click(
    navigation.getByRole("button", { name: "Textarea", exact: true })
  )
  fireEvent.click(main.getByRole("button", { name: "All components /" }))
  assert.equal(window.location.hash, "")
  assert.equal(main.getAllByRole("article").length, components.length)
  cleanup()
  Object.assign(window, { IntersectionObserver: previousObserver })
  Reflect.deleteProperty(globalThis, "IntersectionObserver")
  console.log(
    `✓ full ${components.length}-component catalog, viewport previews, search/list navigation, empty/reset and URL state`
  )
}
