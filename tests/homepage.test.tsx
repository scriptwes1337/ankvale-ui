import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
  cleanup,
} from "@testing-library/react"
import { ProjectWorkspace } from "../apps/web/components/home/project-workspace"
import {
  ComponentShowcases,
  AgentShowcase,
  WebsiteShowcases,
} from "../apps/web/components/home/component-showcases"

export async function run() {
  globalThis.FormData = window.FormData
  const html = renderToString(<ProjectWorkspace />)
  assert(html.includes("Website relaunch"))
  assert(!html.includes("opacity:0"))
  assert(html.includes("Launch project board"))
  render(<ProjectWorkspace />)
  const column = screen.getByRole("region", { name: "To do" })
  const before = within(column)
    .getAllByRole("heading", { level: 4 })
    .map((node) => node.textContent)
  fireEvent.keyDown(
    screen.getByRole("button", { name: "Move Map the customer journey" }),
    { key: "ArrowDown" }
  )
  const after = within(column)
    .getAllByRole("heading", { level: 4 })
    .map((node) => node.textContent)
  assert.equal(after[0], before[1])
  assert.equal(after[1], before[0])
  fireEvent.change(
    screen.getByLabelText("Move Map the customer journey to column"),
    { target: { value: "done" } }
  )
  assert.equal(
    screen
      .getByRole("progressbar", { name: "Launch progress" })
      .getAttribute("aria-valuenow"),
    "50"
  )
  fireEvent.click(screen.getByRole("button", { name: "Overview", exact: true }))
  assert.equal(
    screen
      .getByRole("progressbar", { name: "Project completion" })
      .getAttribute("aria-valuenow"),
    "50"
  )
  fireEvent.click(screen.getByRole("button", { name: "List", exact: true }))
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Complete Write the launch story" })
  )
  assert.equal(
    screen
      .getByRole("progressbar", { name: "Launch progress" })
      .getAttribute("aria-valuenow"),
    "67"
  )
  fireEvent.click(screen.getByRole("button", { name: "New task" }))
  fireEvent.change(screen.getByLabelText("Task title"), {
    target: { value: "Review the new homepage" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Create task" }))
  await waitFor(() => assert(!screen.queryByRole("dialog")))
  assert(screen.getByText("Review the new homepage"))
  fireEvent.click(screen.getByRole("button", { name: "Reset preview" }))
  assert(!screen.queryByText("Review the new homepage"))
  assert.equal(
    screen
      .getByRole("progressbar", { name: "Launch progress" })
      .getAttribute("aria-valuenow"),
    "33"
  )
  fireEvent.click(
    screen.getByRole("button", { name: "Search workspace tasks" })
  )
  fireEvent.change(
    screen.getByRole("combobox", { name: "Find a workspace task" }),
    { target: { value: "Sketch the home screen" } }
  )
  fireEvent.click(
    await screen.findByRole("option", { name: /Sketch the home screen/ })
  )
  assert(await screen.findByRole("heading", { name: "Edit task" }))
  fireEvent.change(screen.getByLabelText("Task title"), {
    target: { value: "Explore the mobile home" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Save task" }))
  await waitFor(() => assert(!screen.queryByRole("dialog")))
  assert(screen.getByText("Explore the mobile home"))
  fireEvent.click(screen.getByRole("button", { name: "See what this uses" }))
  assert(
    await screen.findByRole("heading", { name: "Inside the project workspace" })
  )
  assert.equal(
    screen
      .getByRole("link", { name: "Kanban", exact: true })
      .getAttribute("href"),
    "/docs/kanban"
  )
  cleanup()
  console.log(
    "✓ workspace SSR, keyboard reorder, status/list/overview shared progress, task creation/reset, cross-project search/edit and component inspector"
  )
  const nativeDateFormat = Date.prototype.toLocaleDateString
  let alternativeLocaleHTML: string
  Date.prototype.toLocaleDateString = function (locales, options) {
    return nativeDateFormat.call(this, locales ?? "en-SG", options)
  }
  try {
    alternativeLocaleHTML = renderToString(<ComponentShowcases />)
  } finally {
    Date.prototype.toLocaleDateString = nativeDateFormat
  }
  assert(
    alternativeLocaleHTML.includes('data-day="12/4/2026"'),
    "calendar data attributes have a deterministic default locale"
  )
  render(<ComponentShowcases />)
  fireEvent.click(screen.getByRole("switch", { name: "Project updates" }))
  assert(screen.getByText("Project updates are paused."))
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Make something together" })
  )
  assert(screen.getByText("3 of 3 steps complete"))
  fireEvent.click(screen.getByRole("button", { name: "month", exact: true }))
  assert(screen.getAllByText("186").length > 0)
  cleanup()
  const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard")
  let copied = ""
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        copied = text
      },
    },
  })
  render(<AgentShowcase />)
  fireEvent.click(
    screen.getByRole("button", { name: "Online store", exact: true })
  )
  fireEvent.click(screen.getByRole("button", { name: "Copy brief" }))
  await screen.findByText("Brief copied.")
  assert(copied.includes("commerce-site"))
  assert(copied.includes("app-catalog"))
  cleanup()
  if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard)
  else Reflect.deleteProperty(navigator, "clipboard")
  render(<WebsiteShowcases />)
  const siteDefinitions = JSON.parse(
    await readFile("apps/web/lib/site-block-definitions.json", "utf8")
  )
  for (const link of screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("href")?.includes("/blocks#"))) {
    const id = link.getAttribute("href")!.split("#")[1]
    assert(
      siteDefinitions.some(
        (definition: { id: string }) => definition.id === id
      ),
      `Unknown showcase ${id}`
    )
  }
  cleanup()
  console.log(
    "✓ preferences, setup completion, chart period, copyable agent briefs and valid site-composition destinations"
  )
}
