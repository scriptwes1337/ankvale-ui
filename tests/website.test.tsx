import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react"
import { IconGallery } from "../apps/web/components/icon-gallery"
import { Homepage } from "../apps/web/components/homepage"
import catalog from "../apps/web/lib/icon-catalog.json"

export async function run() {
  const html = renderToString(<Homepage />)
  assert(html.includes("Your React"))
  assert(html.includes("frontend system."))
  assert(
    html.includes(
      "Components, blocks, templates, animations, icons, and graphics."
    )
  )
  assert(!html.includes("Your next app,"))
  let copied = ""
  const previousClipboard = Object.getOwnPropertyDescriptor(
    navigator,
    "clipboard"
  )
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (value: string) => {
        copied = value
      },
    },
  })
  render(<IconGallery />)
  assert.equal(screen.getAllByRole("button", { pressed: false }).length, 96)
  fireEvent.click(screen.getByRole("button", { name: "Show more icons" }))
  assert.equal(screen.getAllByRole("button", { pressed: false }).length, 192)
  fireEvent.change(screen.getByRole("searchbox", { name: "Search icons" }), {
    target: { value: "  address-book  " },
  })
  assert.equal(screen.getAllByRole("button", { pressed: false }).length, 2)
  fireEvent.change(screen.getByRole("searchbox", { name: "Search icons" }), {
    target: { value: "acorn" },
  })
  fireEvent.change(screen.getByRole("combobox", { name: "Weight" }), {
    target: { value: "fill" },
  })
  fireEvent.change(screen.getByRole("combobox", { name: "Size" }), {
    target: { value: "48" },
  })
  const tile = screen.getByRole("button", { name: "Acorn", exact: true })
  assert.equal(
    tile.querySelector("use")?.getAttribute("href"),
    "/icon-assets/fill.svg#Acorn"
  )
  fireEvent.click(tile)
  const dialog = await screen.findByRole("dialog", { name: "Acorn" })
  fireEvent.click(within(dialog).getByRole("button", { name: "Copy example" }))
  await within(dialog).findByText("Example copied.")
  assert(copied.includes('import { AcornIcon } from "@phosphor-icons/react"'))
  assert(copied.includes('size={48} weight="fill" aria-hidden="true"'))
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }))
  fireEvent.change(screen.getByRole("searchbox", { name: "Search icons" }), {
    target: { value: "no-such-icon-example" },
  })
  assert(screen.getByText("No icons found. Try another name."))
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
  assert.equal(screen.getAllByRole("button", { pressed: false }).length, 96)
  cleanup()
  if (previousClipboard)
    Object.defineProperty(navigator, "clipboard", previousClipboard)
  else Reflect.deleteProperty(navigator, "clipboard")
  for (const weight of [
    "thin",
    "light",
    "regular",
    "bold",
    "fill",
    "duotone",
  ]) {
    const sprite = await readFile(
      `apps/web/public/icon-assets/${weight}.svg`,
      "utf8"
    )
    assert.equal((sprite.match(/<symbol /g) ?? []).length, catalog.length)
    for (const { name } of catalog) assert(sprite.includes(`id="${name}"`))
  }
  assert(
    (
      await readFile("apps/web/public/icon-assets/LICENSE.txt", "utf8")
    ).includes("MIT")
  )
  console.log(
    `✓ frontend-system hero; ${catalog.length} icons, six complete sprites, search, pagination, size/weight, accessible details and copyable examples`
  )
}
