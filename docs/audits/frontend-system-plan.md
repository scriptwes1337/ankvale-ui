# Ankvale as an npm-installed frontend system

**Implementation update:** C01–C38, E01–E21, B01–B34 and W01–W18 have public initial implementations and previews: 176 components and 97 blocks including heroes. This includes [clipboard/computed grids](../implementation/grid-analysis.md), [nested queries](../implementation/query-builder.md), [image cropping](../implementation/image-cropper.md), [directory uploads](../implementation/upload-directory.md), [timezone-aware scheduling](../implementation/scheduler.md), [chart navigation](../implementation/chart-interactions.md), [animation/provider](../implementation/animation-system.md), [application blocks](../implementation/app-blocks.md) and [website blocks](../implementation/website-blocks.md). The machine backlog records scope and specialist boundaries. Standalone npm compilation/distribution remains a separate phase.

Audited 26 November 2026 against the current source checkout and live official catalogs. This document is a proposal and implementation backlog. No package has been renamed, published, or migrated as part of the audit.

## Decision

Make npm installation the primary distribution path. Keep the registry as an optional way to copy and own source. A consuming project should install Ankvale, import its stylesheet once, and use stable components, compositions, and feature-facing callbacks. Staff should not have to run shadcn or assemble a design system in every project.

Use one centrally maintained visual language: white surfaces, ink text, restrained neutral borders, Bootstrap blue primary, shared typography/spacing, and purposeful motion. Allow a small documented token layer for product branding; avoid a forked theme per employee or a large collection of competing visual presets.

A frontend system can own presentation, accessibility behavior, responsive layout, interactions, motion, state presentation, and frontend workflow scaffolds. Product teams still provide domain data, permissions, authentication, persistence, uploads, billing, email, analytics, and backend operations through explicit interfaces. Templates must not pretend those services are connected.

## What actually exists

- 121 component-family TSX modules in `packages/ui/src/components`.
- 30 installable website block variants: nine heroes plus 21 other sections, including a 404 page. There are 11 block source modules; helpers and artwork modules are not additional block variants.
- Five application templates: dashboard, mail, chat, CRM, finances. `templates/shared.tsx` is a helper module, not a sixth full application.
- Shared web motion, reduced-motion handling, semantic CSS variables, design manifest tooling, agent guides, two skills, task recommendations and a read-only MCP server.
- Native UI is a separate package. Native-only controls do not fill corresponding web gaps; physical-device verification remains separate.

These counts describe breadth, not maturity. A component file or successful preview is not evidence of full feature, accessibility, device, localization, performance or maintenance parity with another library.

## Package readiness: present blockers

Evidence: `packages/ui/package.json`, `packages/ui/src/styles/globals.css`, `packages/ui/src/components/message-scroller.tsx`, `questionnaire.tsx`, `apps/web/app/layout.tsx` and the dry-run package inspection.

| Current state                                                                                   | Required change                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name `@ankvale/ui`, `private: true`, version `0.0.0`                                          | Choose an available organization scope and package name; release from your private registry or private npm scope initially                                                           |
| Raw `.ts`/`.tsx` export targets; no library build                                               | Emit ESM JavaScript and declarations; preserve module boundaries and client directives; add source maps as appropriate                                                               |
| Internal `@ankvale/ui/*` imports                                                              | Rewrite to distributable relative/self imports and validate tarball consumers                                                                                                        |
| React and React DOM are ordinary dependencies pinned to 19.3.1                                  | Move supported React/React DOM ranges to peers; test the promised versions rather than claiming compatibility                                                                        |
| No explicit publication `files`, CSS side-effect contract, root API, or package release process | Explicit export map and files allowlist; mark CSS as side-effectful; changesets/versioning, changelog, migration and deprecation policy                                              |
| CSS imports Tailwind, shadcn CSS, maps and scheduler CSS unconditionally                        | Ship compiled Ankvale styles; split optional reset, map and scheduler CSS; remove consumer build assumptions                                                                          |
| CSS `@source` paths point into this monorepo and node_modules                                   | Compile internally so consumers do not scan package sources; optional Tailwind integration can be separate                                                                           |
| `shadcn` is imported for CSS; `@shadcn/react` supplies two runtime primitives                   | No CLI is needed in the proposed consumer flow. Retain runtime primitives privately, or replace them deliberately if full shadcn independence is desired; do not delete them blindly |
| 29 declared web dependencies, including heavy feature engines                                   | Keep basic controls lightweight; isolate heavy features and their CSS/dependencies                                                                                                   |
| Theme/Tooltip providers and font loading live in the demo app                                   | Public provider/setup integration; predictable typography independent of Next.js                                                                                                     |
| No web publish/pack release gate or license file found in the inspected project source          | Publish only reviewed runtime/docs/assets; decide project license/internal distribution terms and retain upstream notices                                                            |
| Current package dry run includes config/source files                                            | Add an allowlist and inspect every release tarball                                                                                                                                   |

`npm pack --dry-run --ignore-scripts --json` produced a 155-file candidate, approximately 126 kB packed / 580 kB unpacked. This is tarball size, **not** browser bundle size or proof of publishability. The command did not publish or create an installable release.

## Proposed consumer experience

Names below are illustrative; availability has not been checked. `@ankvale/ui` is not published by this work.

```tsx
// App entry: no shadcn CLI and no consumer Tailwind setup required.
import "@ankvale/ui/styles.css"
import { AnkvaleProvider } from "@ankvale/ui/provider"
import { Button } from "@ankvale/ui/button"
import { HeroSplit } from "@ankvale/ui/blocks/heroes"

export function App() {
  return (
    <AnkvaleProvider>
      <HeroSplit
        headingLevel="h1"
        title="Your product"
        description="Your product's purpose."
        actions={<Button>Start a project</Button>}
      />
    </AnkvaleProvider>
  )
}
```

The runtime provider is now available at `@ankvale/ui/components/ankvale-provider`; the illustrative compiled package subpaths above remain a distribution proposal. Default tokens should work before client hydration. Provider responsibilities should be appearance, density, locale, direction, motion preferences, overlay targets, tooltip/toast defaults and component defaults. Avoid placing all application state inside it. Keep static components server-renderable; only interactive branches need client boundaries. Offer framework-neutral anchors plus optional Next routing integration, not a Next.js requirement.

| Distribution layer                     | Recommendation                                                                                                                                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens, CSS, primitives, forms, motion | One `@ankvale/ui` package with per-feature exports                                                                                                                                                       |
| Blocks and small templates             | Include under package subpaths initially; expose stable typed data/action interfaces                                                                                                                             |
| Icons                                  | Curated Phosphor re-exports or semantic icon mapping; optional icon-provider override                                                                                                                            |
| Heavy features                         | Separate optional packages when their install weight warrants it: editor, maps, scheduler, charts, advanced grid. Subpaths alone can reduce browser imports but do not remove declared installation dependencies |
| Assets                                 | Optional `@your-org/ankvale-assets` or explicit subpaths; no automatic download of unused raster/video files                                                                                                      |
| Native                                 | Separate native package and theme adapter; no React Native dependency in the web core                                                                                                                            |
| Agent context                          | Versioned manifests, guides, examples and skills shipped alongside package releases; MCP should support package IDs/imports as well as registry IDs                                                              |
| New projects                           | A starter/scaffold with providers, fonts, error/loading pages and app shell. It should consume the package rather than copy the library into the app                                                             |

Compile styles in Ankvale's build. Scope component selectors and decide reset ownership explicitly; an unconditional global Tailwind reset should not unexpectedly restyle a host application. Preserve the CSS needed by portals. If consumers opt into a Tailwind extension, document which utilities/tokens they receive and how class overrides behave. Precompiled utility styles need a tested override/cascade policy; shipping CSS alone does not solve conflicting class specificity.

## Dependencies currently used

Declared ranges below come from `packages/ui/package.json`, not an independent claim that these are the latest versions. Exact imported files and source inventory are recorded in `frontend-system-audit.json`.

| Purpose                            | Packages / current declared ranges                                                                   | Recommendation                                                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React runtime                      | `react` 19.3.1, `react-dom` 19.3.1                                                                   | Consumer peers; keep one React instance                                                                                                                                   |
| Accessible interactive foundations | `@base-ui/react` ^1.9.0                                                                              | Keep as implementation dependency; expose Ankvale contracts                                                                                                                |
| Existing shadcn runtime primitives | `@shadcn/react` ^0.3.1                                                                               | MessageScroller and Questionnaire use it today; separate from shadcn CLI                                                                                                  |
| Icons                              | `@phosphor-icons/react` ^2.1.10                                                                      | Current UI icon family; use explicit imports and measure bundling                                                                                                         |
| Classes / variants                 | `cn` ^0.5.2, `class-variance-authority` ^0.7.1                                                       | Internal style utilities                                                                                                                                                  |
| Styling build                      | `tailwindcss` ^4, `@tailwindcss/postcss` ^4                                                          | Build-time tooling in compiled package strategy                                                                                                                           |
| CSS animation                      | `tw-animate-css` ^1.4.0                                                                              | Current overlay/state animation classes; compile with styles                                                                                                              |
| Additional source CSS              | `shadcn` ^4.23.1 (`shadcn/tailwind.css`)                                                             | Replace/export required utility CSS for standalone delivery                                                                                                               |
| Motion engine                      | Native CSS transitions/keyframes, browser Web Animations API, custom `Motion` and `useReducedMotion` | No Framer Motion/Motion, GSAP, Lottie or Three.js dependency in current web source                                                                                        |
| Tables / virtualization            | `@tanstack/react-table` ^9.3.1, `@tanstack/react-virtual` ^3.14.28                                   | Grid feature boundary                                                                                                                                                     |
| Rich text                          | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder` all ^3.35.0                  | Editor boundary; collaboration is not automatically included                                                                                                              |
| Charts                             | `recharts` ^3.8.0                                                                                    | Chart boundary, accessible text/table alternatives                                                                                                                        |
| Scheduler                          | `react-big-calendar` ^1.20.0, `date-fns` ^4.4.0                                                      | Scheduler boundary with its own styles                                                                                                                                    |
| Date selection                     | `react-day-picker` ^10.0.2                                                                           | Calendar base; not a complete date/time input system                                                                                                                      |
| Maps                               | `maplibre-gl` ^6.19.0                                                                                | Optional map engine; map styles/tiles/attribution are separate assets/services                                                                                            |
| Carousel                           | `embla-carousel-react` ^8.6.0                                                                        | Keep behind carousel export                                                                                                                                               |
| Command palette                    | `cmdk` ^1.1.1                                                                                        | Command component                                                                                                                                                         |
| OTP                                | `input-otp` ^1.5.0                                                                                   | OTP input                                                                                                                                                                 |
| Resizable panes                    | `react-resizable-panels` ^4.24.3                                                                     | Split-pane component                                                                                                                                                      |
| Code highlighting                  | `shiki` ^4.6.0                                                                                       | Load languages/themes deliberately rather than full catalog by default                                                                                                    |
| Markdown                           | `streamdown` ^2.8.1                                                                                  | Markdown/streaming UI; retain security constraints                                                                                                                        |
| Emoji data                         | `emojibase-data` ^18.0.0                                                                             | Dataset is included via imports; actual emoji glyph appearance follows the platform font                                                                                  |
| Declared ancillary dependencies    | `next-themes` ^0.4.6, `zod` ^4.6.7, `@types/react-big-calendar` ^1.16.3                              | No direct imports found in this package source. Theme usage exists in the web app; decide ownership; move type-only packages to dev dependencies if declarations allow it |

Next.js 16.4.6, the `ai` SDK, demo route handlers, `react-native-web`, and the design-studio app are application/tooling dependencies, not prerequisites that every web UI consumer should inherit. Current font setup uses Next's Inter and Geist Mono loaders in `apps/web/app/layout.tsx`; the UI package itself does not supply a portable font setup.

Hero graphics are original code-native SVG and React layouts in `hero-graphics.tsx`; no paid image library, WebGL runtime, stock-photo download or animation asset engine is needed. The native package separately declares `libphonenumber-js` and `react-native-svg` and peers React/React Native.

## Assets worth shipping

| Asset/system               | Contents and contract                                                                                                          | Priority |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Typography                 | Optional self-hosted WOFF2 sans/mono, system fallback, font-face entry, metrics and retained font notices                      | P0       |
| Design tokens              | Versioned color, type, spacing, radius, elevation, z-index, density, breakpoints and motion tokens; CSS and JSON               | P0       |
| Icon conventions           | Consistent weight/size/stroke, semantic action/status mapping, Icon wrapper with accessible labeling, RTL directional behavior | P0       |
| Brand kit                  | Ankvale mark, wordmark, favicon/app-icon recipes, monochrome variants and approved clear space                                  | P1       |
| Empty/result illustrations | Small reusable SVG family for search, empty collection, upload, connection, permission, success and error                      | P1       |
| Product illustration kit   | Reusable hero SVGs, diagrams, browser/window/phone frames, connection lines and small product-scene primitives                 | P1       |
| Motion presets             | Named state/entrance/exit/presence/reorder presets plus reduced-motion and opt-out contracts; static fallbacks                 | P1       |
| Avatars / placeholders     | Deterministic initials/patterns, fallback colors, image-error handling; no external personal photo dependency                  | P1       |
| Content fixtures           | Typed realistic demo datasets, long/error/loading examples; clearly demo-only                                                  | P1       |
| Chart system               | Accessible categorical/semantic palettes, number/date formatting, units, legend and data-table recipes                         | P1       |
| Agent artifacts            | Exact version/API manifests, selection recipes, source-aware examples, feature adapters, changelog and migrations              | P0       |
| Media                      | Optional image/video poster sets and aspect-ratio recipes, with provenance and usage terms; load only when requested           | P2       |

Do not bundle competing icon families, large video/3D runtimes, arbitrary stock photography, or many font families into core. Add a new animation dependency only for behavior that the current engine cannot deliver cleanly. Figma remains excluded at your request.

## Coverage result

The complete row-by-row comparison is in [component-comparison.md](component-comparison.md); machine-readable evidence is in [frontend-system-audit.json](frontend-system-audit.json). It covers 62 Material UI Core/Lab entries, all 68 daisyUI catalog entries, all 73 Ant Design core entries, six listed Ant Pro compositions, and six current MUI X families. Equivalent names, internal utilities and intentionally deferred effects are explicitly marked.

This is not 215 missing components: most catalogs overlap and many roles are already served. The following lists deduplicate the work into Ankvale-native components, enhancements and compositions. These are proposals; their presence here does not mark them implemented.

## New public components and utilities to implement

P0 = needed for the first reliable internal package; P1 = next broad business-app coverage; P2 = later specialized use. Items below may share internal building blocks but should have clear public contracts.

| ID  | Component/family                         | Required scope                                                                                                          | Priority |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| C01 | Typography                               | Heading, Text, prose, metadata, inline code, truncation; semantic elements without arbitrary styles                     | P0       |
| C02 | Link                                     | Consistent states, external indication, router composition and accessible disabled policy                               | P0       |
| C03 | Container                                | Responsive content widths and gutters for app/marketing layouts                                                         | P0       |
| C04 | Stack / Inline / Flex                    | Shared spacing, wrapping, alignment and responsive composition                                                          | P0       |
| C05 | LayoutGrid                               | Responsive columns and gaps; unrelated to DataGrid                                                                      | P0       |
| C06 | Surface / Box                            | Token-driven neutral surfaces and explicit elevation; no default nested cards                                           | P1       |
| C07 | Form integration                         | Shared field binding, sync/async validation, submit/error/focus lifecycle and field arrays; choose one adapter strategy | P0       |
| C08 | DatePicker / DateField / DateRangePicker | Typed input plus calendar popup, clear/presets, validation, localized parsing and keyboard behavior                     | P0       |
| C09 | TimePicker / TimeRangePicker             | Typed/spinner selection, intervals, validation and locale-aware display                                                 | P1       |
| C10 | DateTimePicker / DateTimeRangePicker     | Combined date/time with explicit timezone and DST contract                                                              | P1       |
| C11 | PeriodPicker                             | Month, quarter, year, week and period-range selection as one coherent family                                            | P2       |
| C12 | Cascader                                 | Hierarchical path selection, async branches, search and disabled paths                                                  | P1       |
| C13 | TreeSelect                               | Single/multi checkable popup tree with selected values and form semantics                                               | P1       |
| C14 | Transfer                                 | Searchable dual-list selection with keyboard and narrow-screen alternative                                              | P2       |
| C15 | Mentions                                 | Mention suggestions, trigger/token model, async search and keyboard selection                                           | P1       |
| C16 | Chip / Tag                               | Static, removable and checkable variants; icon/avatar; no nested button hazards                                         | P1       |
| C17 | Indicator / Status                       | Anchored count/dot/overflow and standalone status dot paired with text                                                  | P1       |
| C18 | CircularProgress                         | Determinate/indeterminate accessible progress without loading a chart engine                                            | P1       |
| C19 | Descriptions                             | Semantic responsive label/value lists, columns and long values                                                          | P1       |
| C20 | Image / ImagePreview                     | Loading/fallback, aspect ratio, zoom/lightbox gallery, captions, focus and Escape handling                              | P1       |
| C21 | ImageList / Gallery                      | Responsive image collections with captions and selection                                                                | P1       |
| C22 | Masonry                                  | Variable-height layout with predictable reading order and responsive fallbacks                                          | P2       |
| C23 | BottomNavigation                         | Mobile app destinations, current state, safe-area behavior and labels                                                   | P1       |
| C24 | FloatingAction                           | Optional fixed primary action with safe areas and overlay collision policy                                              | P2       |
| C25 | SpeedDial                                | Expandable contextual actions with keyboard/focus/dismiss semantics                                                     | P2       |
| C26 | Affix / BackToTop                        | Sticky/container offsets, accessible return target and reduced-motion scrolling                                         | P2       |
| C27 | Popconfirm                               | Anchored confirmation, async pending/error and focus return                                                             | P1       |
| C28 | Notification                             | Persistent/actionable feedback and grouped delivery; reuse toast internals where suitable                               | P1       |
| C29 | Result                                   | Success, failure, warning, permission and recovery panel; 404 remains route-specific                                    | P1       |
| C30 | Tour                                     | Anchored steps, scrolling, focus, portal boundaries, skip/resume and reduced motion                                     | P2       |
| C31 | QRCode                                   | SVG rendering, accessible description, download and expiration/refresh state                                            | P2       |
| C32 | Countdown                                | Time-based display, pause/expiry and sensible live-region frequency                                                     | P2       |
| C33 | ImageCompare                             | Keyboard/pointer before-after slider with two labeled images                                                            | P2       |
| C34 | PreviewFrame                             | Browser, window and phone frames; reusable beyond hero internals                                                        | P1       |
| C35 | AttachedGroup                            | Mixed inputs/buttons/selects sharing boundaries without doubled borders                                                 | P1       |
| C36 | Swap / ContentTransition                 | Two-state content replacement with accessible state and reduced-motion fallback                                         | P2       |
| C37 | LayeredStack                             | Overlapping card/media stack; separate from flex Stack and AvatarGroup                                                  | P2       |
| C38 | ClientOnly / media utilities             | Optional client-only branch and SSR-safe general media-query hook with documented hydration behavior                    | P2       |

## Existing components that still need deeper implementation

| ID  | Existing family       | Remaining work                                                                                                                                                                                    | Priority |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| E01 | Combobox / Select     | Ship supported single/multi/tag/free-text/async recipes, loading/error/empty states, cancellation and large-option virtualization. Chips already exist; do not list multi-select as wholly absent | P0       |
| E02 | Input / Field         | Ready labeled search/password/clearable fields; shared validation; help/counter; test reset/autofill/disabled/readonly                                                                            | P0       |
| E03 | NumberStepper         | Locale parsing, currency/percentage formatting and decimal precision contract                                                                                                                     | P1       |
| E04 | CellColorPicker       | Full reusable solid-color picker with palette, hex/RGB/HSL/alpha and invalid-text handling. No gradient selection needed                                                                          | P1       |
| E05 | DataGrid editing      | Cell/row edit lifecycle, validation, keyboard navigation, save/cancel and pending/error; render callbacks alone are not a coordinated editor                                                      | P1       |
| E06 | DataGrid presentation | Column visibility/order UI, grouped headers, row details, row/column spans and summary/footer composition                                                                                         | P1       |
| E07 | DataGrid operations   | Typed server adapter, filter operators/query builder, saved views and import/export/print contracts                                                                                               | P1       |
| E08 | DataGrid analytics    | Grouping/aggregation/pivot/formula/clipboard/undo contracts only when business demand justifies complexity                                                                                        | P2       |
| E09 | Tree / FileTree       | Generic content, checkbox/multi selection, lazy loading, editing and reordering; preserve keyboard focus                                                                                          | P1       |
| E10 | ListView              | Grouped virtual list, sticky section headers, infinite loading, query states and item sorting                                                                                                     | P1       |
| E11 | DropZone / Attachment | Preview/crop/paste/directory support; queue concurrency, retry/cancel and provider-neutral transport adapter; existing progress/error UI must remain                                              | P1       |
| E12 | Agenda                | Event editor and booking flow; timezone/DST, recurring events and exceptions, resource lanes, conflicts and keyboard alternatives                                                                 | P2       |
| E13 | Charts                | Scatter/bubble, sparkline, gauge, heatmap, funnel, sankey, candlestick, radial-line families where justified. Existing line/area/bar/pie/radar/radial/composed wrappers remain                    | P2       |
| E14 | Chart infrastructure  | Shared formatting, accessible data view, export, zoom/pan/brush and loading/error/empty states                                                                                                    | P1       |
| E15 | Rating                | Fractional precision/clear/hover preview and custom icon recipes if needed; whole-star keyboard form already exists                                                                               | P2       |
| E16 | Avatar                | Group overlap, overflow count, avatar picker and robust image fallback                                                                                                                            | P1       |
| E17 | FloatingToc           | General scroll container, offset, active-location/history and affix integration                                                                                                                   | P2       |
| E18 | Motion                | Presence/exit, shared-element/layout/reorder support where useful, route/tab/list transitions and deterministic testing; keep existing one-shot Motion and live reduced-motion support            | P1       |
| E19 | Textarea              | Browser support contract or autosize fallback for `field-sizing: content`                                                                                                                         | P1       |
| E20 | Provider / appearance | Package AnkvaleProvider, SSR appearance setup, direction, locale, density, motion, portal and feedback defaults. A saved design manifest is not a runtime provider                                 | P0       |
| E21 | Templates             | Replace hardcoded navigation/sample workflows with explicit typed slots/data/action adapters and documented error/loading/empty states; retain useful demo fixtures separately                    | P0       |

Grid sorting, filtering, pagination, row selection, pinned columns, resizing, tree rows, row reorder, optional virtualization and controlled/manual modes already exist. Do not rebuild them. Some advanced MUI X features are commercial; Ankvale need not purchase or mimic those internals to add its own behavior. MUI's [grid feature catalog](https://mui.com/x/react-data-grid/features/) and Ant's [table documentation](https://ant.design/components/table/) informed the enhancement categories above.

## Missing application blocks and flows

These are reusable **frontend** compositions proposed for business/startup work. They are not all advertised as core components by the three competitors. The comparison references their template categories, while this backlog also reflects your stated product needs. Existing `TemplateSettings`/`TemplateHelp` placeholders and scattered card markup do not count as complete exported feature blocks.

| ID  | Block/flow                          | What it must cover                                                                           | Priority |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| B01 | Sign in / sign up                   | Credential/social slots, validation, pending/error, callback contract                        | P0       |
| B02 | Password recovery/reset             | Request, sent, expired and reset states                                                      | P0       |
| B03 | Verification / MFA                  | OTP, resend cooldown, recovery codes and error states                                        | P1       |
| B04 | Organization onboarding             | Create/join workspace, company details, invite, progress and resumption                      | P0       |
| B05 | Account / workspace switchers       | Identity, organization list, create/join and keyboard behavior                               | P0       |
| B06 | Profile settings                    | Personal details/avatar, async save and validation                                           | P0       |
| B07 | Workspace settings                  | Brand, contact details, defaults and destructive action confirmation                         | P0       |
| B08 | Members / invitations               | Member table, invite, pending invites, role change and remove                                | P0       |
| B09 | Roles / permissions editor          | Capability matrix, inheritance/explanations and permission-denied state                      | P1       |
| B10 | Security settings                   | Password, MFA setup, sessions and revoke workflow                                            | P1       |
| B11 | Notification preferences            | Channel/category controls, save/error state                                                  | P1       |
| B12 | Billing / subscription              | Current plan, usage, change/cancel and invoices; service callbacks                           | P1       |
| B13 | Payment / invoice details           | Payment-method display/edit slots, invoice viewer and receipt/download callback              | P1       |
| B14 | Integrations                        | Integration catalog, connect/disconnect, permissions and failure state                       | P1       |
| B15 | API keys / webhooks                 | Create/reveal/copy/revoke UI, delivery log and retry; no pretend secrets                     | P1       |
| B16 | Audit/activity log                  | Filters, actor/action/object, detail view and export                                         | P1       |
| B17 | Notification center                 | Unread/read, grouping, deep links, empty/error and pagination                                | P1       |
| B18 | Global search                       | Search dialog/page, recent queries, grouped results and async states                         | P1       |
| B19 | Collection toolbar / filter builder | Query input, operators, chips, date range, reset and saved views                             | P0       |
| B20 | CRUD collection                     | List/table/card modes, create/edit/view/delete, selection and bulk actions                   | P0       |
| B21 | Record detail                       | Page header, descriptions, tabs, activity, related records and edit drawer                   | P0       |
| B22 | Import / export wizard              | File mapping, validation preview, duplicates, progress and result                            | P1       |
| B23 | File / asset manager                | Folder/tree, list/grid, preview, upload, rename, move and sharing UI                         | P1       |
| B24 | Task/project detail                 | Board/list/calendar switch, task editor, assignees, due dates and comments                   | P1       |
| B25 | Comment / activity thread           | Replies, mentions, editing, resolve and attachment callbacks                                 | P1       |
| B26 | Booking flow                        | Availability, timezone, details, confirmation and reschedule/cancel                          | P2       |
| B27 | Guided setup checklist              | Progress, actionable tasks, skipped/completed state and resume                               | P1       |
| B28 | Support/help center                 | Searchable topics, article layout, contact/support form                                      | P1       |
| B29 | Feedback / issue report             | Category, description, attachments and real submit states                                    | P1       |
| B30 | App state pages                     | 401/403/500, offline, maintenance, service unavailable and session expiry; keep existing 404 | P0       |
| B31 | Unsaved changes / danger zone       | Leave-page confirmation, async delete and reauthentication slots                             | P1       |
| B32 | Product catalog / detail            | Search/filter, item options, media and actions                                               | P2       |
| B33 | Cart / checkout / order result      | Editable quantities, address, payment-provider slot and success/failure                      | P2       |
| B34 | Order management                    | Orders list/detail, fulfillment and refund-request UI callbacks                              | P2       |

## Missing marketing/content blocks

The 30 existing website variants already cover heroes, navigation, features, social proof, pricing, FAQs, CTAs, footers and 404. These additions fill content types rather than repeating those categories.

| ID  | Block/family               | Required variants                                                                                     | Priority |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| W01 | Contact                    | Contact form/details, department routing, validation and actual service callback                      | P1       |
| W02 | About / company story      | Mission, narrative, history/timeline and visual sections                                              | P1       |
| W03 | Team                       | Team grid, leadership and profile detail                                                              | P1       |
| W04 | Careers                    | Job listings, filters, role detail and application form                                               | P2       |
| W05 | Blog / editorial           | Post grid/list, category/search, article header/body/TOC/related content                              | P1       |
| W06 | Case studies               | Index, customer story, outcomes/evidence and related stories                                          | P1       |
| W07 | How it works               | Process steps, diagram, demo and outcome sections                                                     | P1       |
| W08 | Integrations / ecosystem   | Logo cards, search/categories and integration detail                                                  | P1       |
| W09 | Product comparison         | Comparison table, alternatives and migration narrative                                                | P1       |
| W10 | Changelog / roadmap        | Releases with filters and public roadmap; callbacks if voting exists                                  | P1       |
| W11 | Documentation              | Docs shell, navigation, search, API/article layout and version selector                               | P1       |
| W12 | Gallery / media / video    | Image collection, video poster/dialog, keyboard controls and captions                                 | P1       |
| W13 | Download / app badges      | Platforms, versions, requirements and download actions                                                | P2       |
| W14 | Events / webinars          | Event index, detail, speakers and registration                                                        | P2       |
| W15 | Metrics / evidence         | Standalone stats/counters and comparison evidence; reuse KPI components                               | P1       |
| W16 | Announcement / promotion   | Dismissible announcement bar and release highlights                                                   | P1       |
| W17 | Legal / privacy / consent  | Readable policy layout and configurable consent-preference UI                                         | P1       |
| W18 | Complete site compositions | Product/SaaS, business service, content/publication and ecommerce starter pages assembled from blocks | P1       |

MUI's public [template catalog](https://mui.com/material-ui/getting-started/templates/) includes authentication, checkout, blog, marketing, dashboard and CRUD categories. The [daisyUI store](https://daisyui.com/store/) separately lists paid startup, dashboard, auth, blog, commerce and documentation templates. Catalog presence is verified; paid source and every template section were not inspected, and those products are not counted as missing core primitives. Ant's [overview](https://ant.design/components/overview/) lists its Pro compositions and adjacent template ecosystem separately.

## Intentional deferrals

- Aura / BorderBeam: do not import decorative light-border effects into the default visual language.
- Text Rotate: not needed for business workflows; any eventual implementation needs pause and reduced motion rather than an unavoidable loop.
- Mask and Watermark: optional specialized utilities. Watermark is not a data-security control and is not required for initial product coverage.
- Material Icons: Phosphor already supplies the icon family. A second full icon catalog adds maintenance and visual inconsistency.
- Advanced formulas/pivoting/AI-grid assistants, resource scheduling, collaborative editing and uncommon charts: demand-driven P2 work, not prerequisites for a useful first package.
- Existing HoloCard **already has restrained pointer tilt** with reduced-motion CSS. It is not a missing hover-card effect.
- Figma remains out of scope. No Apple/glass/gradient styling is reintroduced.

## Delivery order and acceptance

1. **Package foundation:** choose a private scope; compile JavaScript/declarations/CSS; isolate styles and heavy engines; peers, exports, license/notices, release/versioning; Next and Vite tarball fixtures. Ship versioned agent docs and package import examples.
2. **Business foundation:** provider, typography/layout, form/date families, field/selector recipes, auth, onboarding, organization switchers, settings, members, CRUD/filter/detail, and app result states.
3. **Daily workflow coverage:** notifications, security, billing/integrations, uploads/files, search, activity/comments and marketing/content sections.
4. **Specialized depth:** enterprise grid analytics, scheduling resources/recurrence, commerce, tours, chart families and optional showcase utilities.

Completion for each item means: documented typed props; controlled/uncontrolled behavior where useful; loading/empty/error/disabled/readonly/long-content states; keyboard/focus and reduced motion; responsive layout; required appearances and locale/direction behavior; focused interaction tests; visual checks; and actual compiled-tarball consumption. Add screen-reader and device testing where the interaction requires it. Do not equate a file or demo with production readiness.

Release gate: production Next App Router/RSC and Vite builds from the tarball, no workspace aliases, no consumer Tailwind/source scan requirement for default usage, correct JS/declaration/CSS exports, preserved client boundaries, React deduplication, measured per-feature bundle budgets, visual regression/accessibility checks, documentation examples type-checked against the released API, and an upgrade test for an existing staff project.

The original comparison is retained as an audit baseline. Implementation updates and focused verification are documented in `docs/implementation/`; these do not certify full enterprise parity or a published npm package.
