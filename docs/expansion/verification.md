# Expansion verification

Reviewed 26 November 2026. All 57 added web families, five application templates, 53 native families, and 11 retained tooling entries have implementations. The 12 existing web equivalents remain baseline entries. The three Figma entries were removed from scope at the user's request.

The library now contains 120 web components, 29 website blocks, five application templates, and 53 native catalog families plus Button. Source URLs, preview routes, API routes, and distribution paths are recorded in `inventory.json`. These are original Ankvale implementations; implementation coverage is not a claim of every HeroUI variant or identical behavior.

## Automated coverage

- Production build generates 200 pages; workspace TypeScript and ESLint checks pass.
- All 57 added web previews and all five templates render. Interaction tests cover numeric bounds, segmented controls, ratings, file-tree navigation, list selection, upload validation and progress, grid controls, prompt submission/error/stop handling, approvals, Kanban moves, emoji search, and local template workflows.
- All 20 non-hero website blocks render. Tests cover pricing periods, tabs, FAQ, mobile navigation, and subscription states.
- All 53 native previews render through React Native Web. Tests cover numeric bounds, date validation and ranges, leap days, autocomplete, number pad, selection, accessible chart values, 12-hour conversion, swipe actions, live-chart cleanup, and international phone formatting and country selection.
- All 120 published web API examples type-check using consuming-project imports. The complete web registry type-checks under consumer aliases. The Map item includes its version-matched module worker and pins MapLibre to that version.
- The packed native package resolves and type-checks in a consumer without DOM types.
- Tooling tests cover theme validation, contrast, locked edits, exports, static brand extraction, public-URL restrictions, builder export escaping, persistence, undo/redo, and MCP discovery/source/export/path validation. MCP also passed an actual stdio client check. Both downloadable agent skills passed frontmatter and ZIP checks.
- Production endpoint checks covered studio authorization, public-site brand import, and the unconfigured-agent response.

JSDOM has no layout engine, so chart rendering there emits dimension warnings. React Native Web uses JavaScript animation fallback. Browser checks supplement those tests.

## Browser coverage

Chrome Guest and an isolated Brave window were used on localhost. Checks included the design editor, charts, map raster tiles and marker popups, data grid selection and keyboard row ordering, rich text editing, and calendar view switching. Dark calendar list rows and selected grid cells were corrected during this review.

All five templates were reviewed in the browser. Dashboard period changes, mail reading, chat submission, and CRM company selection were exercised. At a 400px viewport, finances and CRM layouts fit; CRM navigation closes its panel after selecting a section. Native previews now use a compact selector on narrow screens. International phone paste selected Singapore and formatted the national number; country search and selection were exercised.

## Verification limits

Physical iOS/Android rendering, native gesture conflicts, device screen readers, RTL behavior, and every appearance/variant combination have not been verified. Native charts use SVG rather than HeroUI's Skia animation engine. Date controls use local Gregorian dates and wall-clock times. These constraints are documented in the native package README.

The design agent requires configured provider credentials; live model generation was not tested in this environment. Its structured patch validation and lock handling were tested. It edits tokens, component slots, brand metadata and guidance; it has no website tool calling or asset image generation.

The interface builder supports seven node kinds, portable JSON and TSX export. Saved designs use browser storage and explicit JSON export, without cloud synchronization. Templates use sample data and expose service callbacks; production services are consumer integrations.

## Agent guidance, 404 and motion follow-up

The library now has 121 web components and 30 website blocks including the reusable `NotFoundPage`. The website returns HTTP 404 and noindex for an unknown URL. Browser inspection confirmed the designed page and its recovery links.

Four guides, 18 task patterns, a public block catalog and llms.txt discovery are available. The two validated skills include their referenced guides in their ZIPs; a separate AGENTS.md bundle is also provided. MCP has ten tools, including pattern recommendations, block discovery and guide retrieval. Tests resolve recommendations to actual install manifests and check packaged references.

Web motion now shares control/overlay timings, one-time hero/section entrances, content feedback and reduced-motion-aware chart transitions. The Motion preview offers reveal, fade and scale replay; Chrome’s Animations panel captured the browser effects. Tests cover viewport entry, rerender stability, focus cancellation, live reduced-motion changes, subtree opt-out and missing browser API fallbacks. Native animation implementations were not changed in this follow-up.
