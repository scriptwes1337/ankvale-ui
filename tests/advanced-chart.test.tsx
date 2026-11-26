import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import { render, fireEvent, cleanup } from "@testing-library/react"
import {
  AdvancedChart,
  layoutSankey,
  type ChartViewport,
} from "../packages/ui/src/components/advanced-chart"
import { AnkvaleProvider } from "../packages/ui/src/components/ankvale-provider"

const data = [
  { name: "Alpha", value: 10, x: 0, y: 10 },
  { name: "Beta", value: 40, x: 50, y: 40 },
  { name: "Gamma", value: 100, x: 100, y: 100 },
]
function pointer(target: Element, type: string, x: number, y: number, id = 7) {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX: x,
    clientY: y,
    button: 0,
  })
  Object.defineProperty(event, "pointerId", { value: id })
  fireEvent(target, event)
}
function prepare(svg: SVGSVGElement, height = 240) {
  let captured: number | undefined,
    releases = 0
  svg.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 600,
    height,
    right: 600,
    bottom: height,
    x: 0,
    y: 0,
    toJSON() {
      return {}
    },
  })
  svg.setPointerCapture = (id) => {
    captured = id
  }
  svg.hasPointerCapture = (id) => captured === id
  svg.releasePointerCapture = (id) => {
    if (captured === id) {
      captured = undefined
      releases++
    }
  }
  return {
    get captured() {
      return captured
    },
    get releases() {
      return releases
    },
  }
}
export async function run() {
  const html = renderToString(
    <AdvancedChart kind="scatter" label="Revenue" data={data} />
  )
  assert(
    html.includes("Alpha") &&
      html.includes("chart-brush") &&
      !html.includes("NaN")
  )
  assert.equal(
    html,
    renderToString(
      <AdvancedChart kind="scatter" label="Revenue" data={data} />
    ),
    "SSR must be deterministic"
  )
  let latest: ChartViewport | undefined
  const chart = render(
    <AdvancedChart
      kind="scatter"
      label="Revenue"
      data={data}
      onViewportChange={(value) => {
        latest = value
      }}
    />
  )
  const plot = chart.getByRole("img", {
    name: /^Revenue scatter chart/,
  }) as unknown as SVGSVGElement
  const status = () => chart.getByRole("status").textContent
  fireEvent.click(chart.getByRole("button", { name: "Zoom in" }))
  assert.deepEqual(latest, { x: [25, 75], y: [25, 75] })
  const beta = plot.querySelector("circle:nth-child(2)")
  assert(beta)
  const firstX = plot.querySelector("circle")!.getAttribute("cx")
  assert(
    Number(firstX) < 36,
    "Domain zoom must move marks geometrically, not slice records"
  )
  fireEvent.keyDown(plot, { key: "ArrowRight" })
  assert.equal(latest!.x[0], 30)
  fireEvent.keyDown(plot, { key: "ArrowUp" })
  assert.equal(latest!.y[0], 30)
  fireEvent.keyDown(plot, { key: "Home" })
  assert.deepEqual(latest, { x: [0, 100], y: [0, 100] })
  fireEvent.change(chart.getByRole("slider", { name: "Range start" }), {
    target: { value: "20" },
  })
  fireEvent.change(chart.getByRole("slider", { name: "Range end" }), {
    target: { value: "60" },
  })
  assert.deepEqual(latest!.x, [20, 60])
  assert(status()?.includes("20–60"))
  const capture = prepare(plot)
  pointer(plot, "pointerdown", 300, 120)
  assert.equal(capture.captured, 7)
  pointer(plot, "pointermove", 432, 120)
  assert.equal(latest!.x[0], 10)
  pointer(plot, "pointercancel", 432, 120)
  assert.equal(capture.captured, undefined)
  const afterCancel = JSON.stringify(latest)
  pointer(plot, "pointermove", 500, 120)
  assert.equal(
    JSON.stringify(latest),
    afterCancel,
    "Cancelled drags must no longer update the viewport"
  )
  const overview = chart.getByRole("img", {
    name: "Revenue range overview",
  }) as unknown as SVGSVGElement
  const brushCapture = prepare(overview, 64)
  pointer(overview, "pointerdown", 168, 20)
  pointer(overview, "pointermove", 432, 20)
  pointer(overview, "pointerup", 432, 20)
  assert.deepEqual(latest!.x, [25, 75])
  assert.equal(brushCapture.captured, undefined)
  pointer(overview, "pointerdown", 36, 20)
  pointer(overview, "pointermove", 564, 20)
  pointer(overview, "pointercancel", 564, 20)
  assert.deepEqual(
    latest!.x,
    [25, 75],
    "Cancelled brush must not commit its draft"
  )
  pointer(plot, "pointerdown", 300, 120)
  chart.unmount()
  assert.equal(
    capture.captured,
    undefined,
    "Unmount must release pointer capture"
  )
  cleanup()
  console.log(
    "✓ geometric zoom/pan, keyboard reset, native range controls and pointer brush/cancel/unmount cleanup"
  )

  let exported = ""
  const controlled = render(
    <AnkvaleProvider locale="de-DE">
      <AdvancedChart
        kind="bubble"
        label="Exact"
        data={[{ name: "=SUM(1)", value: 1234.5, x: 1, y: 2, size: 9 }]}
        viewport={{ x: [0, 10], y: [0, 10] }}
        onExport={(csv) => {
          exported = csv
        }}
      />
    </AnkvaleProvider>
  )
  assert.equal(controlled.queryByRole("slider"), null)
  fireEvent.click(controlled.getByRole("button", { name: "View data" }))
  assert(
    controlled.getByRole("table").textContent?.includes("1.234,5"),
    "Exact table must retain provider number formatting"
  )
  assert(controlled.getByRole("columnheader", { name: "size" }))
  fireEvent.click(controlled.getByRole("button", { name: "Export CSV" }))
  assert(exported.startsWith("name,value,x,y,size\r\n"))
  assert(
    exported.includes('"\'=SUM(1)"'),
    "CSV strings must neutralize spreadsheet formulas"
  )
  assert(
    exported.includes("1234.5,1,2,9"),
    "CSV must preserve canonical numeric values"
  )
  cleanup()
  const readOnly = render(
    <AdvancedChart
      kind="sparkline"
      label="Static"
      data={data}
      interactive={false}
    />
  )
  assert.equal(readOnly.queryByRole("slider"), null)
  assert.equal(readOnly.queryByRole("button", { name: "Zoom in" }), null)
  cleanup()
  let proposed: ChartViewport | undefined
  const fixed = render(
    <AdvancedChart
      kind="sparkline"
      label="Controlled"
      data={data}
      viewport={{ x: [0, 100], y: [0, 100] }}
      onViewportChange={(value) => {
        proposed = value
      }}
    />
  )
  const getFirstX = () =>
    fixed.container.querySelector("circle")!.getAttribute("cx")
  const originalX = getFirstX()
  fireEvent.click(fixed.getByRole("button", { name: "Zoom in" }))
  assert.equal(
    getFirstX(),
    originalX,
    "A controlled viewport must wait for its owner"
  )
  assert.deepEqual(proposed, { x: [25, 75], y: [25, 75] })
  fixed.rerender(
    <AdvancedChart
      kind="sparkline"
      label="Controlled"
      data={data}
      viewport={proposed}
    />
  )
  assert.notEqual(getFirstX(), originalX)
  const controlledPlot = fixed.getByRole("img", {
    name: /^Controlled sparkline chart/,
  }) as unknown as SVGSVGElement
  const controlledCapture = prepare(controlledPlot)
  pointer(controlledPlot, "pointerdown", 300, 120)
  fixed.rerender(
    <AdvancedChart
      kind="sparkline"
      label="Controlled"
      data={[...data, { name: "New", x: 200, y: 200, value: 200 }]}
    />
  )
  assert.equal(
    controlledCapture.captured,
    undefined,
    "Domain replacement must release an old gesture"
  )
  cleanup()
  const invalid = render(
    <AdvancedChart
      kind="scatter"
      label="Bad data"
      data={[{ name: "Bad", value: Infinity }]}
    />
  )
  assert(invalid.getByRole("alert").textContent?.includes("finite numbers"))
  assert.equal(invalid.queryByRole("img"), null)
  cleanup()
  console.log(
    "✓ exact chart dimensions, provider formatting, safe canonical CSV and static opt-out"
  )

  const links = [
    { source: "Visits", target: "Trial", value: 80 },
    { source: "Visits", target: "Docs", value: 20 },
    { source: "Trial", target: "Paid", value: 30 },
    { source: "Docs", target: "Paid", value: 10 },
  ]
  const layout = layoutSankey(links)
  assert.equal(layout.error, undefined)
  assert.equal(layout.nodes.find((node) => node.name === "Paid")!.stage, 2)
  assert.equal(
    layout.nodes.length,
    4,
    "A node shared by incoming/outgoing links must not be duplicated"
  )
  assert(layout.links.every((link) => link.thickness > 0))
  const graph = render(
    <AdvancedChart kind="sankey" label="Flow" data={[]} links={links} />
  )
  assert.equal(graph.queryByText("No chart data."), null)
  assert.equal(
    graph.container.querySelectorAll('[data-sankey-stage="2"]').length,
    1
  )
  fireEvent.click(graph.getByRole("button", { name: "View data" }))
  assert.equal(graph.getAllByRole("row").length, 5)
  assert(graph.getByRole("columnheader", { name: "source" }))
  cleanup()
  for (const invalid of [
    [
      { source: "A", target: "B", value: 1 },
      { source: "B", target: "A", value: 1 },
    ],
    [{ source: "A", target: "A", value: 1 }],
    [{ source: "A", target: "B", value: -1 }],
    [{ source: "A", target: "B", value: Infinity }],
  ]) {
    assert(layoutSankey(invalid).error)
  }
  const cyclic = render(
    <AdvancedChart
      kind="sankey"
      label="Invalid"
      data={[]}
      links={[
        { source: "A", target: "B", value: 1 },
        { source: "B", target: "A", value: 1 },
      ]}
    />
  )
  assert(cyclic.getByRole("alert").textContent?.includes("acyclic"))
  cleanup()
  console.log(
    "✓ multistage DAG Sankey, shared-node identity, exact flow table and invalid/cyclic input recovery"
  )
}
