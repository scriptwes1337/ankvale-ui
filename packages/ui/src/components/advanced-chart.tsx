"use client"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { useAnkvaleDefaults } from "@ankvale/ui/lib/ankvale-config"
import { Button } from "@ankvale/ui/components/button"
export type AdvancedChartDatum = {
  name: string
  value: number
  x?: number
  y?: number
  size?: number
  row?: string
  column?: string
  open?: number
  close?: number
  low?: number
  high?: number
}
export type SankeyLink = { source: string; target: string; value: number }
export type ChartViewport = { x: [number, number]; y: [number, number] }
export type SankeyNodeLayout = {
  name: string
  stage: number
  x: number
  y: number
  height: number
  value: number
}
export type SankeyLayout = {
  nodes: SankeyNodeLayout[]
  links: (SankeyLink & {
    sourceY: number
    targetY: number
    thickness: number
  })[]
  error?: string
}
/** Stable DAG layout; invalid/cyclic graphs are reported instead of silently misrepresented. */
export function layoutSankey(
  links: SankeyLink[],
  width = 528,
  height = 168
): SankeyLayout {
  const empty = (error: string): SankeyLayout => ({
    nodes: [],
    links: [],
    error,
  })
  if (!links.length) return { nodes: [], links: [] }
  if (
    links.some(
      (link) =>
        !link.source.trim() ||
        !link.target.trim() ||
        !Number.isFinite(link.value) ||
        link.value <= 0 ||
        link.source === link.target
    )
  )
    return empty("Flows need distinct named nodes and finite positive values.")
  const names = [
    ...new Set(links.flatMap((link) => [link.source, link.target])),
  ]
  const incoming = new Map(names.map((name) => [name, 0]))
  const outgoing = new Map(names.map((name) => [name, [] as SankeyLink[]]))
  for (const link of links) {
    incoming.set(link.target, incoming.get(link.target)! + 1)
    outgoing.get(link.source)!.push(link)
  }
  const queue = names.filter((name) => incoming.get(name) === 0),
    stages = new Map(names.map((name) => [name, 0]))
  let visited = 0
  for (let index = 0; index < queue.length; index++) {
    const source = queue[index]!
    visited++
    for (const link of outgoing.get(source)!) {
      stages.set(
        link.target,
        Math.max(stages.get(link.target)!, stages.get(source)! + 1)
      )
      incoming.set(link.target, incoming.get(link.target)! - 1)
      if (incoming.get(link.target) === 0) queue.push(link.target)
    }
  }
  if (visited !== names.length)
    return empty(
      "Sankey flows must be acyclic. Remove the cycle before rendering."
    )
  const last = Math.max(...stages.values()),
    columns = Array.from({ length: last + 1 }, () => [] as string[])
  for (const name of names) columns[stages.get(name)!]!.push(name)
  const values = new Map(
    names.map((name) => [
      name,
      Math.max(
        links
          .filter((l) => l.source === name)
          .reduce((sum, l) => sum + l.value, 0),
        links
          .filter((l) => l.target === name)
          .reduce((sum, l) => sum + l.value, 0)
      ),
    ])
  )
  const gap = Math.min(
    12,
    height / Math.max(2, ...columns.map((col) => col.length)) / 2
  )
  const scale = Math.min(
    ...columns.map(
      (col) =>
        (height - Math.max(0, col.length - 1) * gap) /
        Math.max(
          1,
          col.reduce((sum, name) => sum + values.get(name)!, 0)
        )
    )
  )
  const nodes = columns.flatMap((column, stage) => {
    let y =
      (height -
        column.reduce((sum, name) => sum + values.get(name)! * scale, 0) -
        Math.max(0, column.length - 1) * gap) /
      2
    return column.map((name) => {
      const value = values.get(name)!,
        node = {
          name,
          stage,
          x: (stage / Math.max(1, last)) * (width - 10),
          y,
          height: value * scale,
          value,
        }
      y += node.height + gap
      return node
    })
  })
  const map = new Map(nodes.map((node) => [node.name, node])),
    sourceOffsets = new Map<string, number>(),
    targetOffsets = new Map<string, number>()
  const positioned = links.map((link) => {
    const source = map.get(link.source)!,
      target = map.get(link.target)!,
      thickness = link.value * scale
    const sourceOffset = sourceOffsets.get(link.source) ?? 0,
      targetOffset = targetOffsets.get(link.target) ?? 0
    sourceOffsets.set(link.source, sourceOffset + thickness)
    targetOffsets.set(link.target, targetOffset + thickness)
    return {
      ...link,
      sourceY: source.y + sourceOffset + thickness / 2,
      targetY: target.y + targetOffset + thickness / 2,
      thickness,
    }
  })
  return { nodes, links: positioned }
}
function boundedRange(
  range: [number, number],
  full: [number, number]
): [number, number] {
  const span = full[1] - full[0],
    minimum = span / 100
  const requested =
    Number.isFinite(range[0]) && Number.isFinite(range[1])
      ? Math.min(span, Math.max(minimum, range[1] - range[0]))
      : span
  const first = Number.isFinite(range[0])
    ? Math.max(full[0], Math.min(full[1] - requested, range[0]))
    : full[0]
  return [first, first + requested]
}
export type AdvancedChartProps = {
  kind:
    | "scatter"
    | "bubble"
    | "sparkline"
    | "gauge"
    | "heatmap"
    | "funnel"
    | "sankey"
    | "candlestick"
    | "radial-line"
  data: AdvancedChartDatum[]
  label: string
  links?: SankeyLink[]
  max?: number
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  loading?: boolean
  error?: string
  onRetry?: () => void
  onExport?: (csv: string) => void
  interactive?: boolean
  height?: number
  /** Controlled geometric domain for scatter, bubble, sparkline and candlestick. */
  viewport?: ChartViewport
  onViewportChange?: (viewport: ChartViewport) => void
}
/** Deterministic SVG charts, exact data, bounded geometric navigation and accessible range controls. */
export function AdvancedChart({
  kind,
  data,
  label,
  links = [],
  max = 100,
  locale: requestedLocale,
  formatOptions,
  loading = false,
  error,
  onRetry,
  onExport,
  interactive = true,
  height = 280,
  viewport: controlledViewport,
  onViewportChange,
}: AdvancedChartProps) {
  const defaults = useAnkvaleDefaults()
  const locale = requestedLocale ?? defaults.locale
  const id = useId()
  const [showData, setShowData] = useState(false)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState<number | null>(null)
  const from = Math.min(start, Math.max(0, data.length - 1))
  const to = Math.max(from + 1, Math.min(end ?? data.length, data.length))
  const geometric = ["scatter", "bubble", "sparkline", "candlestick"].includes(
    kind
  )
  const invalidData = data.some((datum) =>
    [
      datum.value,
      datum.x,
      datum.y,
      datum.size,
      datum.open,
      datum.close,
      datum.low,
      datum.high,
    ].some((value) => value !== undefined && !Number.isFinite(value))
  )
  const canNavigate =
    interactive && geometric && data.length > 1 && !invalidData
  const rows = geometric ? data : data.slice(from, to)
  const format = new Intl.NumberFormat(locale, formatOptions).format
  const blue = "var(--primary)"
  const ink = "var(--foreground)"
  const muted = "var(--muted-foreground)"
  const width = 600,
    H = 240,
    pad = 36
  const numeric = rows.flatMap((d) => [
    d.value,
    d.y ?? d.value,
    d.high ?? d.value,
    d.low ?? d.value,
    d.open ?? d.value,
    d.close ?? d.value,
  ])
  const finite = numeric.filter(Number.isFinite)
  const lo = Math.min(0, ...finite),
    hi = Math.max(1, ...finite)
  const xs = rows.map((d, i) => (Number.isFinite(d.x) ? d.x! : i))
  const smallestX = xs.length ? Math.min(...xs) : 0
  const largestX = xs.length ? Math.max(...xs) : 1
  const xPadding =
    kind === "candlestick"
      ? Math.max(1, (largestX - smallestX) / Math.max(1, rows.length - 1)) / 2
      : 0
  const minimumX = smallestX - xPadding,
    maximumX = Math.max(smallestX + 1, largestX) + xPadding
  const full: ChartViewport = { x: [minimumX, maximumX], y: [lo, hi] }
  const signature = `${kind}:${minimumX}:${maximumX}:${lo}:${hi}`
  const [localView, setLocalView] = useState<{
    signature: string
    value: ChartViewport
  } | null>(null)
  const requestedView =
    controlledViewport ??
    (localView?.signature === signature ? localView.value : full)
  const view: ChartViewport = {
    x: boundedRange(requestedView.x, full.x),
    y: boundedRange(requestedView.y, full.y),
  }
  const changeView = (next: ChartViewport) => {
    const value = {
      x: boundedRange(next.x, full.x),
      y: boundedRange(next.y, full.y),
    }
    setLocalView({ signature, value })
    onViewportChange?.(value)
  }
  const pan = (dx: number, dy: number) =>
    changeView({
      x: [view.x[0] + dx, view.x[1] + dx],
      y: [view.y[0] + dy, view.y[1] + dy],
    })
  const zoom = (factor: number) => {
    const range = (axis: [number, number]): [number, number] => {
      const center = (axis[0] + axis[1]) / 2,
        half = ((axis[1] - axis[0]) * factor) / 2
      return [center - half, center + half]
    }
    changeView({ x: range(view.x), y: range(view.y) })
  }
  const scaleY = (value: number) =>
    H - pad - ((value - view.y[0]) / (view.y[1] - view.y[0])) * (H - pad * 2)
  const scaleX = (index: number) =>
    pad +
    ((xs[index]! - view.x[0]) / (view.x[1] - view.x[0])) * (width - pad * 2)
  const drag = useRef<{
    target: SVGSVGElement
    pointerId: number
    x: number
    y: number
    view: ChartViewport
    signature: string
    mode: "pan" | "brush"
  } | null>(null)
  const [brushDraft, setBrushDraft] = useState<[number, number] | null>(null)
  const position = (event: ReactPointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect(),
      viewHeight =
        Number(event.currentTarget.getAttribute("viewBox")?.split(/\s+/)[3]) ||
        H
    const ratio = Math.min(box.width / width, box.height / viewHeight)
    if (!ratio) return null
    return {
      x: (event.clientX - box.left - (box.width - width * ratio) / 2) / ratio,
      y:
        (event.clientY - box.top - (box.height - viewHeight * ratio) / 2) /
        ratio,
    }
  }
  const release = () => {
    const current = drag.current
    drag.current = null
    if (current) {
      try {
        if (current.target.hasPointerCapture(current.pointerId))
          current.target.releasePointerCapture(current.pointerId)
      } catch {
        /* Detached pointer target. */
      }
    }
  }
  useEffect(
    () => () => {
      const current = drag.current
      drag.current = null
      if (current) {
        setBrushDraft(null)
        try {
          current.target.releasePointerCapture(current.pointerId)
        } catch {
          /* Unmounted target. */
        }
      }
    },
    [signature, canNavigate, loading, error]
  )
  const begin = (
    event: ReactPointerEvent<SVGSVGElement>,
    mode: "pan" | "brush"
  ) => {
    if (!canNavigate || event.button !== 0 || drag.current) return
    const point = position(event)
    if (
      !point ||
      point.x < pad ||
      point.x > width - pad ||
      (mode === "pan" && (point.y < pad || point.y > H - pad))
    )
      return
    event.preventDefault()
    event.currentTarget.focus()
    drag.current = {
      target: event.currentTarget,
      pointerId: event.pointerId,
      x: point.x,
      y: point.y,
      view,
      signature,
      mode,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* Keyboard controls remain available without capture. */
    }
    if (mode === "brush") setBrushDraft([point.x, point.x])
  }
  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    if (current.signature !== signature) {
      release()
      setBrushDraft(null)
      return
    }
    const point = position(event)
    if (!point) return
    if (current.mode === "brush") {
      setBrushDraft([current.x, Math.max(pad, Math.min(width - pad, point.x))])
      return
    }
    const dx =
        (-(point.x - current.x) / (width - pad * 2)) *
        (current.view.x[1] - current.view.x[0]),
      dy =
        ((point.y - current.y) / (H - pad * 2)) *
        (current.view.y[1] - current.view.y[0])
    changeView({
      x: [current.view.x[0] + dx, current.view.x[1] + dx],
      y: [current.view.y[0] + dy, current.view.y[1] + dy],
    })
  }
  const endDrag = (event: ReactPointerEvent<SVGSVGElement>, cancel = false) => {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    if (current.signature !== signature) {
      release()
      setBrushDraft(null)
      return
    }
    if (current.mode === "brush" && !cancel) {
      const point = position(event)
      if (point && Math.abs(point.x - current.x) > 2) {
        const toValue = (x: number) =>
          full.x[0] +
          ((Math.max(pad, Math.min(width - pad, x)) - pad) /
            (width - pad * 2)) *
            (full.x[1] - full.x[0])
        const a = toValue(current.x),
          b = toValue(point.x)
        changeView({ x: [Math.min(a, b), Math.max(a, b)], y: view.y })
      }
    }
    release()
    setBrushDraft(null)
  }
  const graph =
    kind === "sankey" ? layoutSankey(links, width - pad * 2, H - pad * 2) : null
  let art: ReactNode = null
  if (kind === "sparkline") {
    const points = rows
      .map((d, i) => `${scaleX(i)},${scaleY(d.value)}`)
      .join(" ")
    art = (
      <>
        <polyline points={points} fill="none" stroke={blue} strokeWidth="3" />
        {rows.map((d, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(d.value)} r="3" fill={blue}>
            <title>{`${d.name}: ${format(d.value)}`}</title>
          </circle>
        ))}
      </>
    )
  }
  if (kind === "scatter" || kind === "bubble") {
    art = (
      <>
        {rows.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.y ?? d.value)}
            r={
              kind === "bubble"
                ? Math.max(
                    4,
                    Math.min(24, Math.sqrt(Math.max(0, d.size ?? d.value)) * 2)
                  )
                : 5
            }
            fill={blue}
            fillOpacity=".7"
            stroke={blue}
          >
            <title>{`${d.name}: ${format(d.y ?? d.value)}`}</title>
          </circle>
        ))}
      </>
    )
  }
  if (kind === "gauge") {
    const value = Math.max(0, Math.min(max, rows[0]?.value ?? 0)),
      angle = Math.PI * (value / Math.max(1, max))
    const x = 300 - Math.cos(angle) * 100,
      y = 150 - Math.sin(angle) * 100
    art = (
      <>
        <path
          d="M200 150 A100 100 0 0 1 400 150"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {value > 0 && (
          <path
            d={`M200 150 A100 100 0 ${angle > Math.PI ? 1 : 0} 1 ${x} ${y}`}
            fill="none"
            stroke={blue}
            strokeWidth="18"
            strokeLinecap="round"
          />
        )}
        <text x="300" y="150" textAnchor="middle" fill={ink} fontSize="28">
          {format(value)}
        </text>
        <text x="300" y="180" textAnchor="middle" fill={muted} fontSize="12">
          of {format(max)}
        </text>
      </>
    )
  }
  if (kind === "heatmap") {
    const columns = [...new Set(rows.map((d) => d.column ?? d.name))],
      groups = [...new Set(rows.map((d) => d.row ?? "Value"))]
    const cellW = (width - pad * 2) / Math.max(1, columns.length),
      cellH = (H - pad * 2) / Math.max(1, groups.length)
    art = (
      <>
        {rows.map((d, i) => (
          <g key={i}>
            <rect
              x={pad + columns.indexOf(d.column ?? d.name) * cellW}
              y={pad + groups.indexOf(d.row ?? "Value") * cellH}
              width={Math.max(1, cellW - 3)}
              height={Math.max(1, cellH - 3)}
              rx="3"
              fill={blue}
              fillOpacity={
                0.15 +
                (0.85 * Math.max(0, d.value)) /
                  Math.max(1, ...rows.map((d) => d.value))
              }
            >
              <title>{`${d.row ?? ""} ${d.column ?? d.name}: ${format(d.value)}`}</title>
            </rect>
            <text
              x={pad + columns.indexOf(d.column ?? d.name) * cellW + cellW / 2}
              y={pad + groups.indexOf(d.row ?? "Value") * cellH + cellH / 2 + 4}
              fill={ink}
              textAnchor="middle"
              fontSize="11"
            >
              {format(d.value)}
            </text>
          </g>
        ))}
      </>
    )
  }
  if (kind === "funnel") {
    const tallest = Math.max(1, ...rows.map((d) => d.value))
    const segment = (H - pad * 2) / Math.max(1, rows.length)
    art = (
      <>
        {rows.map((d, i) => {
          const w = Math.max(20, (d.value / tallest) * (width - pad * 2))
          const next = Math.max(
            20,
            ((rows[i + 1]?.value ?? d.value * 0.8) / tallest) *
              (width - pad * 2)
          )
          return (
            <g key={i}>
              <path
                d={`M${300 - w / 2} ${pad + i * segment}h${w}L${300 + next / 2} ${pad + (i + 1) * segment - 3}h${-next}Z`}
                fill={blue}
              />
              <text
                x="300"
                y={pad + i * segment + segment / 2 + 3}
                fill="white"
                textAnchor="middle"
                fontSize="11"
              >
                {d.name}: {format(d.value)}
              </text>
            </g>
          )
        })}
      </>
    )
  }
  if (kind === "candlestick") {
    const y = scaleY
    art = (
      <>
        {rows.map((d, i) => {
          const x = scaleX(i),
            o = d.open ?? d.value,
            c = d.close ?? d.value
          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={y(d.high ?? Math.max(o, c))}
                y2={y(d.low ?? Math.min(o, c))}
                stroke={ink}
              />
              <rect
                x={x - 8}
                y={Math.min(y(o), y(c))}
                width="16"
                height={Math.max(2, Math.abs(y(o) - y(c)))}
                fill={c >= o ? blue : "var(--background)"}
                stroke={c >= o ? blue : ink}
              />
              <title>{`${d.name}: open ${format(o)}, close ${format(c)}, low ${format(d.low ?? d.value)}, high ${format(d.high ?? d.value)}`}</title>
            </g>
          )
        })}
      </>
    )
  }
  if (kind === "radial-line") {
    const limit = Math.max(1, max, ...rows.map((d) => d.value))
    const points = rows
      .map((d, i) => {
        const a = (i / Math.max(1, rows.length)) * Math.PI * 2 - Math.PI / 2,
          r = (Math.max(0, d.value) / limit) * 80
        return `${300 + Math.cos(a) * r},${120 + Math.sin(a) * r}`
      })
      .join(" ")
    art = (
      <>
        <circle cx="300" cy="120" r="80" fill="none" stroke="var(--border)" />
        <circle cx="300" cy="120" r="40" fill="none" stroke="var(--border)" />
        <polygon points={points} fill="none" stroke={blue} strokeWidth="3" />
        {rows.map((d, i) => {
          const a = (i / rows.length) * Math.PI * 2 - Math.PI / 2
          return (
            <text
              key={i}
              x={300 + Math.cos(a) * 105}
              y={120 + Math.sin(a) * 105}
              fill={muted}
              textAnchor="middle"
              fontSize="10"
            >
              {d.name}
            </text>
          )
        })}
      </>
    )
  }
  if (kind === "sankey" && graph && !graph.error) {
    const nodeMap = new Map(graph.nodes.map((node) => [node.name, node]))
    art = (
      <>
        {graph.links.map((link, i) => {
          const source = nodeMap.get(link.source)!,
            target = nodeMap.get(link.target)!,
            x1 = pad + source.x + 10,
            x2 = pad + target.x,
            middle = (x1 + x2) / 2
          return (
            <path
              key={i}
              data-sankey-link={`${link.source}:${link.target}`}
              d={`M${x1} ${pad + link.sourceY}C${middle} ${pad + link.sourceY},${middle} ${pad + link.targetY},${x2} ${pad + link.targetY}`}
              fill="none"
              stroke={blue}
              strokeOpacity=".25"
              strokeWidth={link.thickness}
            >
              <title>{`${link.source} → ${link.target}: ${format(link.value)}`}</title>
            </path>
          )
        })}
        {graph.nodes.map((node) => (
          <g key={node.name} data-sankey-stage={node.stage}>
            <rect
              x={pad + node.x}
              y={pad + node.y}
              width="10"
              height={node.height}
              fill={blue}
            >
              <title>{`${node.name}: ${format(node.value)}`}</title>
            </rect>
            <text
              x={pad + node.x + (node.x === 0 ? 14 : -4)}
              y={pad + node.y + node.height / 2 + 4}
              textAnchor={node.x === 0 ? "start" : "end"}
              fill={ink}
              fontSize="11"
            >
              {node.name}
            </text>
          </g>
        ))}
      </>
    )
  }
  const dataColumns =
    kind === "sankey"
      ? ["source", "target", "value"]
      : [
          "name",
          "value",
          ...[
            "x",
            "y",
            "size",
            "row",
            "column",
            "open",
            "close",
            "low",
            "high",
          ].filter((key) =>
            rows.some(
              (row) => row[key as keyof AdvancedChartDatum] !== undefined
            )
          ),
        ]
  const exactRows: Record<string, string | number | undefined>[] =
    kind === "sankey" ? links : rows
  const csvCell = (value: string | number | undefined) =>
    typeof value === "number"
      ? String(value)
      : `"${String(value ?? "")
          .replace(/^[=+@\-\t\r]/, "'$&")
          .replaceAll('"', '""')}"`
  return (
    <figure data-slot="advanced-chart" className="min-w-0 space-y-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowData((v) => !v)}
            aria-expanded={showData}
          >
            View data
          </Button>
          {onExport && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                onExport(
                  [
                    dataColumns.join(","),
                    ...exactRows.map((row) =>
                      dataColumns.map((key) => csvCell(row[key])).join(",")
                    ),
                  ].join("\r\n")
                )
              }
            >
              Export CSV
            </Button>
          )}
        </div>
      </figcaption>
      {loading ? (
        <p
          role="status"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          Loading chart…
        </p>
      ) : error ? (
        <div role="alert" className="py-8 text-sm text-destructive">
          {error}
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Retry
            </Button>
          )}
        </div>
      ) : invalidData && kind !== "sankey" ? (
        <p role="alert" className="py-8 text-sm text-destructive">
          Chart values must be finite numbers.
        </p>
      ) : graph?.error ? (
        <p role="alert" className="py-8 text-sm text-destructive">
          {graph.error}
        </p>
      ) : !(kind === "sankey" ? links.length : rows.length) ? (
        <p
          role="status"
          className="py-12 text-center text-sm text-muted-foreground"
        >
          No chart data.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${H}`}
          tabIndex={canNavigate ? 0 : undefined}
          aria-describedby={canNavigate ? `${id}-interaction` : undefined}
          onPointerDown={(event) => begin(event, "pan")}
          onPointerMove={move}
          onPointerUp={(event) => endDrag(event)}
          onPointerCancel={(event) => endDrag(event, true)}
          onLostPointerCapture={() => {
            drag.current = null
            setBrushDraft(null)
          }}
          onBlur={() => {
            release()
            setBrushDraft(null)
          }}
          onKeyDown={(event) => {
            if (!canNavigate) return
            const dx = (view.x[1] - view.x[0]) * 0.1,
              dy = (view.y[1] - view.y[0]) * 0.1
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "+",
                "=",
                "-",
                "Home",
                "Escape",
              ].includes(event.key)
            )
              event.preventDefault()
            if (event.key === "ArrowLeft") pan(-dx, 0)
            if (event.key === "ArrowRight") pan(dx, 0)
            if (event.key === "ArrowUp") pan(0, dy)
            if (event.key === "ArrowDown") pan(0, -dy)
            if (event.key === "+" || event.key === "=") zoom(0.5)
            if (event.key === "-") zoom(2)
            if (event.key === "Home") changeView(full)
            if (event.key === "Escape") {
              release()
              setBrushDraft(null)
            }
          }}
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
          style={{
            width: "100%",
            height,
            touchAction: canNavigate ? "none" : undefined,
          }}
        >
          <defs>
            <clipPath id={`${id}-plot`}>
              <rect
                x={pad}
                y={pad}
                width={width - pad * 2}
                height={H - pad * 2}
              />
            </clipPath>
          </defs>
          <title id={`${id}-title`}>{label}</title>
          <desc id={`${id}-description`}>
            {kind} chart. A table of exact values is available using View data.
          </desc>
          {["scatter", "bubble", "sparkline", "candlestick"].includes(kind) && (
            <>
              <path
                d={`M${pad} ${pad}V${H - pad}H${width - pad}`}
                fill="none"
                stroke="var(--border)"
              />
              <text x="4" y={pad} fill={muted} fontSize="9">
                {format(view.y[1])}
              </text>
              <text x="4" y={H - pad} fill={muted} fontSize="9">
                {format(view.y[0])}
              </text>
            </>
          )}
          <g clipPath={geometric ? `url(#${id}-plot)` : undefined}>{art}</g>
        </svg>
      )}
      {canNavigate && !loading && !error && (
        <div className="space-y-3">
          <p id={`${id}-interaction`} className="text-xs text-muted-foreground">
            Drag the plot to pan. Arrow keys pan; +/− zoom; Home resets. Drag
            the overview to select an X range, or use its sliders.
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Chart navigation"
          >
            <Button size="sm" variant="outline" onClick={() => zoom(0.5)}>
              Zoom in
            </Button>
            <Button size="sm" variant="outline" onClick={() => zoom(2)}>
              Zoom out
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pan(-(view.x[1] - view.x[0]) * 0.2, 0)}
            >
              Pan left
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pan((view.x[1] - view.x[0]) * 0.2, 0)}
            >
              Pan right
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pan(0, (view.y[1] - view.y[0]) * 0.2)}
            >
              Pan up
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pan(0, -(view.y[1] - view.y[0]) * 0.2)}
            >
              Pan down
            </Button>
            <Button size="sm" variant="ghost" onClick={() => changeView(full)}>
              Reset view
            </Button>
          </div>
          <p role="status" className="text-xs text-muted-foreground">
            X {format(view.x[0])}–{format(view.x[1])}; Y {format(view.y[0])}–
            {format(view.y[1])}
          </p>
          <svg
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault()
                release()
                setBrushDraft(null)
              }
            }}
            onBlur={() => {
              release()
              setBrushDraft(null)
            }}
            viewBox={`0 0 ${width} 64`}
            role="img"
            aria-label={`${label} range overview`}
            style={{ width: "100%", height: 64, touchAction: "none" }}
            onPointerDown={(event) => begin(event, "brush")}
            onPointerMove={move}
            onPointerUp={(event) => endDrag(event)}
            onPointerCancel={(event) => endDrag(event, true)}
            onLostPointerCapture={() => {
              drag.current = null
              setBrushDraft(null)
            }}
          >
            <rect
              x={pad}
              y="8"
              width={width - pad * 2}
              height="40"
              fill="var(--muted)"
            />
            {rows.map((d, index) => (
              <circle
                key={index}
                cx={
                  pad +
                  ((xs[index]! - full.x[0]) / (full.x[1] - full.x[0])) *
                    (width - pad * 2)
                }
                cy={46 - (((d.y ?? d.value) - lo) / (hi - lo)) * 36}
                r="2"
                fill={blue}
              />
            ))}
            <rect
              data-slot="chart-brush"
              x={
                brushDraft
                  ? Math.min(...brushDraft)
                  : pad +
                    ((view.x[0] - full.x[0]) / (full.x[1] - full.x[0])) *
                      (width - pad * 2)
              }
              y="6"
              width={
                brushDraft
                  ? Math.abs(brushDraft[1] - brushDraft[0])
                  : ((view.x[1] - view.x[0]) / (full.x[1] - full.x[0])) *
                    (width - pad * 2)
              }
              height="44"
              fill={blue}
              fillOpacity=".12"
              stroke={blue}
            />
          </svg>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs">
              Range start {format(view.x[0])}
              <input
                type="range"
                aria-label="Range start"
                min={full.x[0]}
                max={view.x[1] - (full.x[1] - full.x[0]) / 100}
                step={(full.x[1] - full.x[0]) / 1000}
                value={view.x[0]}
                onChange={(event) =>
                  changeView({
                    ...view,
                    x: [Number(event.target.value), view.x[1]],
                  })
                }
                className="accent-primary"
              />
            </label>
            <label className="grid gap-1 text-xs">
              Range end {format(view.x[1])}
              <input
                type="range"
                aria-label="Range end"
                min={view.x[0] + (full.x[1] - full.x[0]) / 100}
                max={full.x[1]}
                step={(full.x[1] - full.x[0]) / 1000}
                value={view.x[1]}
                onChange={(event) =>
                  changeView({
                    ...view,
                    x: [view.x[0], Number(event.target.value)],
                  })
                }
                className="accent-primary"
              />
            </label>
          </div>
        </div>
      )}
      {interactive && !geometric && kind !== "sankey" && data.length > 2 && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-xs text-muted-foreground">
            First point {from + 1}
            <input
              type="range"
              min="0"
              max={Math.max(0, data.length - 1)}
              value={from}
              onChange={(e) => {
                setStart(Number(e.target.value))
                setEnd(null)
              }}
              className="accent-primary"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            Last point {to}
            <input
              type="range"
              min={from + 1}
              max={data.length}
              value={to}
              onChange={(e) => setEnd(Number(e.target.value))}
              className="accent-primary"
            />
          </label>
        </div>
      )}
      {showData && (
        <div className="overflow-auto rounded border">
          <table className="w-full text-start text-xs">
            <caption className="sr-only">{label} data</caption>
            <thead>
              <tr>
                {dataColumns.map((column) => (
                  <th key={column} className="p-2 text-start capitalize">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exactRows.map((row, i) => (
                <tr key={i} className="border-t">
                  {dataColumns.map((column) => (
                    <td key={column} className="p-2 tabular-nums">
                      {typeof row[column] === "number"
                        ? format(row[column] as number)
                        : row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  )
}
