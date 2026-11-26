# Chart navigation and multistage flows

`AdvancedChart` in `packages/ui/src/components/advanced-chart.tsx` now supports geometric navigation for `scatter`, `bubble`, `sparkline` and `candlestick`. Charts still render deterministic SVG on the server, require no animation engine, and retain their exact-value table, export callback, provider-aware number formatting and loading/error/retry/empty states.

## Geometric viewport

With `interactive` enabled (default), datasets with at least two points expose navigation. The chart computes a full numeric X/Y domain from supplied data; `x` supplies a numeric X coordinate or defaults to its record index. Supply sorted epoch/time coordinates when meaningful; values and axis readouts use the documented number formatter rather than implicitly parsing dates. Candles include half an interval at the domain edges. The visible domain changes the actual SVG coordinates and clips marks to the plot; records are not sliced or rescaled independently after every pan.

- Zoom in/out changes both axes about the current center. Pan buttons and plot Arrow keys shift 10–20% of the visible span; `+`/`-` zoom and `Home` resets. All actions have native buttons as alternatives to direct manipulation.
- Drag the main plot to pan within the full domain. Pointer capture keeps the gesture on its initial target; up/cancel/lost-capture/blur/Escape/unmount clear it. Cancellation retains the most recently displayed pan rather than rolling back already applied movement. A domain/type/loading/interaction change releases an active gesture.
- Drag the separate overview to create an X range. The draft commits only on pointer-up and is discarded on cancel/Escape. Native `Range start`/`Range end` sliders provide the same selection without dragging. Y is preserved by the brush.
- Ranges cannot cross, leave the full domain or become smaller than 1% of its span. Zoom is bounded to 100× and Reset restores the full domain. No wheel interception, scroll hijacking, automatic motion, or hidden live service is introduced.
- `viewport?: ChartViewport` and `onViewportChange?: (next: ChartViewport) => void` allow product-owned range state. `ChartViewport` has numeric tuples `{ x: [minimum, maximum], y: [minimum, maximum] }`. Keep a controlled viewport updated from the callback; a supplied viewport without an updating callback remains read-only. Invalid/reversed/oversized requested ranges are normalized. Internal state resets when the chart kind or full domain changes, and otherwise survives same-domain data refreshes.

`interactive={false}` preserves static presentation. Heatmap/funnel/gauge/radial retain their existing record-window controls where applicable; geometric pan/zoom is not applied to categorical or polar layouts. Navigation does not change the exact table or CSV for geometric charts: both retain all supplied rows and all supplied dimensions (X/Y/size/category/OHLC). Other record-window charts expose their selected rows. CSV numbers retain canonical values; string cells escape quotes and neutralize spreadsheet formula prefixes. Non-finite numeric data reports an error instead of rendering invalid SVG coordinates.

The overview is a pointer visualization with native sliders as its keyboard equivalent. The main plot is keyboard focusable only when navigation is useful, has visible focus, and describes its shortcuts. Browser review is still needed for actual touch/stylus capture, resize/letterboxing and assistive-technology reading; the automated suite does not certify those physical interactions.

## Multistage Sankey

`layoutSankey(links, width?, height?)` is an exported deterministic DAG layout. A shared source/target name identifies one node across all stages. Topological longest-path stages support branches, merges and more than two columns. Node heights use the greater of incoming/outgoing totals; link thickness and stacked attachment positions share one value scale. Supplied order determines stable node/link ordering.

Links require nonempty distinct source/target names and finite positive values. Self-loops, cycles and invalid values return a descriptive error; `AdvancedChart` shows that error instead of inventing a flow. A Sankey accepts `data={[]}` with actual `links`; the exact table and CSV expose source/target/value records.

This is an acyclic flow layout, not a cyclic network engine. It does not optimize crossings, route skipped-stage edges around intermediate nodes, wrap long labels, or equalize unbalanced input/output totals. Large or dense graphs may need a specialized layout integration. No business nodes or flows are inferred from missing data.

## Verification

`node scripts/test-tooling.mjs tests/advanced-chart.test.tsx` checks deterministic SSR, actual mark coordinates after zoom, keyboard pan/reset, range selection, pointer-captured pan/brush cancellation and unmount cleanup, controlled domain callbacks, provider formatting, complete and formula-safe CSV, static opt-out, multistage shared-node Sankey and invalid/cyclic graph errors. The existing component-depth suite continues to exercise the complete enhancement preview collection.
