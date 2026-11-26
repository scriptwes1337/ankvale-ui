import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react"
import { heroVariants, heroExamples } from "../apps/web/lib/hero-catalog"
import { HeroGallery } from "../apps/web/components/hero-gallery"
import {
  HeroWorkspace,
  HeroWorkflow,
  HeroPoster,
  HeroCanvasVisual,
  HeroSculpture,
  HeroTeamVisual,
} from "../packages/ui/src/blocks/hero-graphics"
export async function run() {
  for (const [name, Hero] of Object.entries(heroVariants)) {
    const html = renderToString(
      <Hero
        {...heroExamples[name as keyof typeof heroVariants]}
        headingLevel="h1"
      />
    )
    assert(html.includes(`data-slot="hero-${name}"`))
    assert.equal((html.match(/<h1/g) ?? []).length, 1)
    assert(
      /data-slot="hero-title"[^>]*leading-\[\.97\]/.test(html),
      `${name} retains compact leading after font-size class merging`
    )
    assert(!/gradient|backdrop-blur|undefined/.test(html))
    const custom = renderToString(
      <Hero title="Custom title">
        <div>Customer supplied artwork</div>
      </Hero>
    )
    assert(custom.includes("Customer supplied artwork"))
    const textOnly = renderToString(<Hero title="Text only" children={null} />)
    assert(
      !/data-slot="hero-(sculpture|poster|workspace|canvas-visual|team-visual|workflow|index-visual)"/.test(
        textOnly
      )
    )
  }
  console.log(
    "✓ nine distinct hero layouts render, preserve heading semantics and accept custom/no artwork"
  )
  render(<HeroWorkspace />)
  fireEvent.click(
    screen.getByRole("button", { name: "Mark Design the homepage complete" })
  )
  assert(screen.getByText("2 / 4 complete"))
  await waitFor(() =>
    assert.equal(
      document.activeElement?.getAttribute("aria-label"),
      "Mark Design the homepage in progress"
    )
  )
  fireEvent.click(screen.getByRole("button", { name: /list/i }))
  assert.equal(screen.getAllByRole("checkbox").length, 4)
  assert.equal(
    (screen.getAllByRole("checkbox")[1] as HTMLInputElement).checked,
    true
  )
  cleanup()
  render(<HeroWorkflow />)
  fireEvent.click(screen.getByRole("button", { name: /Launch/ }))
  assert(screen.getByText("Prepare for launch."))
  assert(screen.getByText("Run the final checks"))
  cleanup()
  const poster = render(<HeroPoster />)
  fireEvent.click(screen.getByRole("button", { name: "ink" }))
  assert.equal(
    screen.getByRole("button", { name: "ink" }).getAttribute("aria-pressed"),
    "true"
  )
  assert.equal(
    (
      poster.container.querySelector(
        '[data-slot="hero-poster"] > div'
      ) as HTMLElement
    ).style.backgroundColor,
    "rgb(25, 25, 25)"
  )
  cleanup()
  const sculpture = render(<HeroSculpture />)
  const group = () =>
    sculpture.container.querySelector("g[style]")?.getAttribute("style")
  const before = group()
  fireEvent.click(
    screen.getByRole("button", { name: "Rotate the blue sculpture" })
  )
  assert.notEqual(group(), before)
  cleanup()
  render(<HeroTeamVisual />)
  fireEvent.click(screen.getByRole("button", { name: "View Sam Rivera" }))
  assert(screen.getByText("Sam Rivera"))
  cleanup()
  render(<HeroCanvasVisual />)
  const card = screen.getByRole("button", { name: /The big idea/ })
  const left = card.style.left
  fireEvent.keyDown(card, { key: "ArrowRight" })
  assert.notEqual(card.style.left, left)
  fireEvent.click(screen.getByRole("button", { name: /Reset layout/ }))
  assert.equal(card.style.left, left)
  cleanup()
  console.log(
    "✓ workspace task focus/board/list, workflow steps, poster palette, sculpture rotation, team selection and keyboard canvas"
  )
  render(<HeroGallery source="layout source" graphicsSource="graphic source" />)
  fireEvent.click(screen.getByRole("button", { name: /03\s*Showcase/i }))
  assert(screen.getByRole("heading", { name: /Less friction/ }))
  fireEvent.click(screen.getByRole("button", { name: "Mobile preview" }))
  assert.equal(
    screen
      .getByRole("button", { name: "Mobile preview" })
      .getAttribute("aria-pressed"),
    "true"
  )
  fireEvent.click(screen.getByRole("button", { name: "Customize" }))
  fireEvent.change(screen.getByLabelText("Headline"), {
    target: { value: "A custom hero" },
  })
  assert(screen.getByRole("heading", { name: "A custom hero" }))
  fireEvent.click(screen.getByRole("button", { name: /02\s*Product/i }))
  assert(screen.getByRole("heading", { name: /From first idea/ }))
  fireEvent.click(screen.getByRole("button", { name: /03\s*Showcase/i }))
  assert(
    screen.getByRole("heading", { name: "A custom hero" }),
    "customizations persist per layout"
  )
  fireEvent.click(screen.getByRole("button", { name: /^source$/i }))
  fireEvent.click(screen.getByRole("button", { name: "hero-graphics.tsx" }))
  assert(screen.getByText("graphic source"))
  cleanup()
  const registry = JSON.parse(
    await readFile("apps/web/public/r/hero-blocks.json", "utf8")
  )
  assert(
    registry.files.some((file: { path: string }) =>
      file.path.endsWith("/hero-graphics.tsx")
    )
  )
  assert(
    !registry.files.some((file: { content: string }) =>
      file.content.includes("@workspace/")
    )
  )
  console.log(
    "✓ gallery layout/viewport/customization/source controls and complete hero install bundle"
  )
}
