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
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "MouseEvent",
  "CustomEvent",
  "MutationObserver",
  "DocumentFragment",
  "HTMLInputElement",
  "HTMLButtonElement",
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
  stdin: {
    contents: `
import * as React from "react"
import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import { render, screen, fireEvent, cleanup, waitFor, act } from "@testing-library/react"
import { BlockDemo, demoProps } from "./apps/web/components/block-demo"
import { blockDefinitions, samplePlans } from "./apps/web/lib/block-catalog"
import { PricingCards } from "@ankvale/ui/blocks/pricing"
import { FeatureTabs } from "@ankvale/ui/blocks/features"
import { FaqAccordion } from "@ankvale/ui/blocks/faq"
import { NavbarStandard } from "@ankvale/ui/blocks/navigation"
import { CtaNewsletter } from "@ankvale/ui/blocks/cta"
import { TooltipProvider } from "@ankvale/ui/components/tooltip"

module.exports = async function run() {
  const originalDefinitions=blockDefinitions.filter(block=>!block.module.match(/^(app|site)-/))
  assert.equal(originalDefinitions.length,21)
  for (const block of originalDefinitions) {
    {
      const html=renderToString(<TooltipProvider><BlockDemo id={block.id} title="A considered beginning" description="A little clarity." /></TooltipProvider>)
      assert.ok(html.includes('data-slot="'+block.id+'"'),block.id)
      assert.ok(!html.includes("undefined"),block.id)
      assert.ok(!/gradient|backdrop-blur|ankvale-glass/.test(html),block.id+" must use solid default styling")
    }
  }
  console.log("PASS all 21 blocks render with the default style")

  render(<PricingCards plans={samplePlans}/>)
  fireEvent.click(screen.getByRole("button",{name:"Yearly"}))
  assert.equal(screen.getByRole("button",{name:"Yearly"}).getAttribute("aria-pressed"),"true")
  assert.ok(screen.getByText("$180"))
  fireEvent.click(screen.getByRole("button",{name:"Monthly"}))
  assert.ok(screen.getByText("$18"))
  cleanup()
  console.log("PASS billing period changes visible prices")

  render(<FeatureTabs items={[{title:"Write",description:"Capture your ideas."},{title:"Plan",description:"Move your next project forward."}]}/>)
  fireEvent.click(screen.getByRole("tab",{name:"Plan"}))
  await waitFor(()=>assert.ok(screen.getByRole("tabpanel").textContent.includes("Move your next project forward.")))
  cleanup()
  console.log("PASS feature tabs change the displayed content")

  render(<FaqAccordion items={[{question:"Can I make it mine?",answer:"Every detail is yours to shape."}]}/>)
  fireEvent.click(screen.getByRole("button",{name:"Can I make it mine?"}))
  await waitFor(()=>assert.ok(screen.getByText("Every detail is yours to shape.")))
  cleanup()
  console.log("PASS FAQ reveals its answer")

  render(<NavbarStandard brand="Studio" links={[{label:"Features",href:"#features"}]}/>)
  const toggle=screen.getByRole("button",{name:"Open navigation"})
  fireEvent.click(toggle)
  assert.ok(screen.getByRole("navigation",{name:"Website mobile"}))
  fireEvent.keyDown(screen.getByRole("navigation",{name:"Website mobile"}),{key:"Escape"})
  assert.equal(screen.queryByRole("navigation",{name:"Website mobile"}),null)
  cleanup()
  console.log("PASS mobile navigation opens and closes with Escape")

  render(<CtaNewsletter title="Stay in the loop"/>)
  fireEvent.change(screen.getByLabelText("Email address"),{target:{value:"reader@example.com"}})
  fireEvent.submit(screen.getByRole("button",{name:"Subscribe"}).closest("form"))
  assert.ok(screen.getByRole("status").textContent.includes("No email was submitted"))
  cleanup()
  console.log("PASS unconnected newsletter explicitly stays in preview mode")

  let finish
  let submitted
  render(<CtaNewsletter onSubscribe={email=>{submitted=email;return new Promise(resolve=>{finish=resolve})}}/>)
  fireEvent.change(screen.getByLabelText("Email address"),{target:{value:"reader@example.com"}})
  fireEvent.submit(screen.getByRole("button",{name:"Subscribe"}).closest("form"))
  assert.equal(submitted,"reader@example.com")
  assert.equal(screen.getByRole("button",{name:"Subscribing…"}).disabled,true)
  await act(async()=>finish())
  assert.ok(screen.getByRole("status").textContent.includes("You're on the list"))
  assert.equal(screen.getByLabelText("Email address").value,"")
  cleanup()
  console.log("PASS subscription pending and success states")

  render(<CtaNewsletter onSubscribe={async()=>{throw new Error("Service unavailable")}}/>)
  fireEvent.change(screen.getByLabelText("Email address"),{target:{value:"reader@example.com"}})
  fireEvent.submit(screen.getByRole("button",{name:"Subscribe"}).closest("form"))
  await waitFor(()=>assert.ok(screen.getByRole("status").textContent.includes("Could not subscribe")))
  assert.equal(screen.getByLabelText("Email address").value,"reader@example.com")
  cleanup()
  console.log("PASS subscription failures preserve the entered email")
}
`,
    resolveDir: root,
    loader: "tsx",
  },
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
  logLevel: "warning",
})
const filename = path.join(root, ".block-tests.cjs")
const compiled = new Module(filename)
compiled.filename = filename
compiled.paths = Module._nodeModulePaths(root)
compiled._compile(result.outputFiles[0].text, filename)
try {
  await compiled.exports()
} finally {
  dom.window.close()
}
