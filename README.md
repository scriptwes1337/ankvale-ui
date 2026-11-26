# Ankvale UI

Components, blocks, and templates by **Ankvale Labs**, built for people and coding agents. Ankvale takes its name from Anchorvale, Singapore, where the business began.

The source workspace packages `@ankvale/ui`, `@ankvale/native-ui`, and `@ankvale/design-system` remain private. The standalone npm package is [`@ankvalelabs/ui`](https://www.npmjs.com/package/@ankvalelabs/ui), including its setup CLI. The existing shadcn source registry remains available. See [npm release preparation](docs/internal/npm-release.md).

Read the [project documentation](docs/README.md) for intentions, installation, supported technologies, customization, animations, agent workflows and maintenance. The customer-facing handbook is available at `/docs`, with Markdown and a downloadable reference bundle.

Ankvale’s original work is available under the [Ankvale Attribution License 1.0](LICENSE). Personal and commercial use, modification and redistribution are allowed with the visible credit **“Built with Ankvale UI by Ankvale Labs”** in every app or website using it. Third-party materials retain their own licenses. See [license and attribution](docs/legal/licensing.md) and [credits](docs/legal/credits.md).

Maintainer records, including dependency dates, licensing findings and release checks, are linked from [internal documentation](docs/internal/README.md).

Brand assets and logo usage are documented in [the brand guide](docs/brand/README.md).

A shadcn preset built on Base UI. Notion is the sole design reference: bold ink-black headings, white pages, white panels, fine borders, useful blue accents, and generous spacing. One default style, with light and dark modes. See the [design language](docs/design-language.md) for reference pages and styling rules.

## Roadmap

Ankvale is a complete frontend system for teams and coding agents: design tokens, typography, icons, illustrations, motion, components, blocks, templates and implementation guidance. Track unfinished system layers here alongside runtime and distribution work.

Keep this checklist updated as work progresses. Version 0.1.0 is published on npm. Catalog-wide release hardening and the remaining system layers stay tracked below.

- [x] **Standalone npm build:** compiled ESM/types, scoped precompiled CSS, per-feature imports, and one runtime/CLI package with local agent resources. Marketing and hosted documentation apps are excluded.
- [x] **npm publication:** `@ankvalelabs/ui@0.1.0` published with public access; registry integrity matches the reviewed tarball.
- [x] **Fresh-project validation:** packed packages build in isolated Next.js and Vite apps; browser checks cover styles, portal dialogs, animation and host-style isolation.
- [ ] **Bundle optimization:** measure feature-specific production chunks and set dependency/CSS size budgets.
- [ ] **Team starter:** provide shared providers, typography, an app shell, authentication screens and error/loading states so projects can begin with features and content.
- [x] **Agent distribution and automatic setup:** the CLI creates or extends project `AGENTS.md`, installs project-local coding/design skills and version-matched documentation/catalogs, and updates its managed sections without replacing project instructions. See [the CLI setup contract](docs/implementation/cli-setup.md).
- [ ] **Release hardening:** review responsive layouts, keyboard interactions and accessibility across the catalog.
- [ ] **Icon system:** build on the existing Phosphor family with consistent sizes and weights, accessible labeling, semantic action/status mappings, RTL rules and searchable previews with copyable imports.
- [ ] **Illustration system:** ship an original SVG family for empty/search states, onboarding, uploads, permissions, connectivity, success, errors and 404 pages; include compact and large compositions, theme support and optional reduced-motion-aware animation.
- [ ] **Product graphics:** extract reusable browser/phone frames, diagrams, connectors and product scenes from bespoke showcase artwork; compose them into blocks and templates.
- [ ] **Asset catalog and agent guidance:** document when to choose an icon, illustration or product scene; provide exact asset IDs, imports, editable SVG downloads, provenance and usage terms. Integrate the catalog into agent recipes and ship only assets a project uses.

## Install

```sh
npx @ankvalelabs/ui init
```

The same package supplies runtime imports and the `ankvale` command. Initialization adds the provider, styles, project-local agent instructions, skills and documentation. Use `npx @ankvalelabs/ui doctor` to inspect an installation. See the [installation guide](https://ui.ankvale.com/docs/installation) for prerequisites, manual React/Vite setup and editable source alternatives.

## Develop

```sh
npm install
npm run dev
```

Use the URL printed by Next.js:

- `/`: the interactive Ankvale showcase: project workspace, component demos, website concepts and copyable agent briefs.
- `/playground`: all 176 web components, live previews, source, and foundations.
- `/docs`: user guides, customization, supported technologies, credits and attribution.
- `/icons`: all 1,512 Phosphor icons, searchable previews in six weights, size controls and copyable React examples.
- `/native`: 53 native component families, rendered with React Native Web.
- `/templates`: dashboard, mail, chat, CRM, and finances templates.
- `/design`: design systems, tokens, component overrides, brand import, and exports.
- `/builder`: component arrangements with TSX and JSON export.
- `/docs/<component>`, `/docs/blocks/<module>`, `/docs/native/<component>`, `/docs/templates/<template>`: API reference.
- `/blocks`: 88 application and website blocks, plus nine hero layouts.
- `/blocks/heroes`: nine responsive hero layouts.
- `/examples/studio`: a complete concept website assembled from the blocks.

The toolbar theme control or **D** outside a text field switches between light and dark. The styling stays consistent in both modes.

## Design foundation

Use solid surfaces and strong ink-colored text. Primary actions use blue; blue also provides focus and selected-state emphasis. Semantic colors communicate state alongside text or icons.

Use a 4px spacing rhythm, Inter for interface text, and Geist Mono for code. Body text is 16px, controls are generally 14px, and metadata is 12px. Keep borders and shadows restrained. Preserve Base UI keyboard behavior, focus states, and accessibility semantics.

Tokens live in `packages/ui/src/styles/globals.css`. Components live in `packages/ui/src/components`. Blocks live in `packages/ui/src/blocks`. Import locally from `@ankvale/ui/components/button` or `@ankvale/ui/blocks/features`.

## Website blocks

| Module         | Exports                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `navigation`   | `NavbarStandard`, `NavbarFloating`, `NavbarMega`                                                                                        |
| `features`     | `FeatureGrid`, `FeatureBento`, `FeatureSplit`, `FeatureTabs`                                                                            |
| `social-proof` | `LogoCloud`, `TestimonialGrid`, `TestimonialSpotlight`                                                                                  |
| `pricing`      | `PricingCards`, `PricingComparison`                                                                                                     |
| `faq`          | `FaqAccordion`, `FaqSplit`                                                                                                              |
| `cta`          | `CtaBanner`, `CtaSplit`, `CtaNewsletter`                                                                                                |
| `footers`      | `FooterMinimal`, `FooterColumns`, `FooterEditorial`                                                                                     |
| `heroes`       | `HeroMinimal`, `HeroProduct`, `HeroFramed`, `HeroSplit`, `HeroCentered`, `HeroStatement`, `HeroEditorial`, `HeroShowcase`, `HeroCanvas` |

The `app-*` modules add 34 authentication, settings, team, billing, data, files, project, support and commerce blocks. The `site-*` modules add 33 company, careers, editorial, product, docs, media, events, legal and complete-site variants. See [application contracts](docs/implementation/app-blocks.md) and [website contracts](docs/implementation/website-blocks.md) for the full index.

Sections accept your heading, description, content arrays, and visual/action slots. Hero blocks default to an `h2`; pass `headingLevel="h1"` for a page's primary heading. The gallery provides editable previews, usage code, category source, and installation commands.

`CtaNewsletter` accepts an optional async `onSubscribe(email)` handler. Without one it reports preview mode and submits or stores nothing. Connect your own service for production. Pricing actions are links supplied by you; payments and account creation are outside the library.

The Forma example uses illustrative brands, profiles, quotes, and prices. Replace them with verified content before publishing.

## Editable source alternative

Start with an initialized shadcn + Tailwind v4 React project. The public registry is hosted at `https://ui.ankvale.com`.

```sh
# Complete style, components, and blocks
npx shadcn@latest add https://ui.ankvale.com/r/ankvale-ui.json

# Website block collection
npx shadcn@latest add https://ui.ankvale.com/r/website-blocks.json

# A single block and its category module/dependencies
npx shadcn@latest add https://ui.ankvale.com/r/feature-bento.json

# Hero layouts
npx shadcn@latest add https://ui.ankvale.com/r/hero-blocks.json
```

Review overwrite prompts for existing components. Installed blocks live under your configured `components/blocks` path. Set your preferred sans-serif font and wrap your app with `TooltipProvider` when using tooltips.

Registry files are generated from source and ignored by Git. `predev` and `prebuild` generate them automatically. Run `npm run registry:build` after source changes during an already-running development session.

## Check

```sh
npm run typecheck
npm run lint
npm run test:blocks
npm run test:expansion
npm run test:native
npm run test:tooling
npm run test:api
npm run test:registry
npm run build
```

The block tests cover default-style rendering, billing, tabs, FAQs, mobile navigation, and newsletter preview/pending/success/error states.

Expansion progress is tracked in [the implementation inventory](docs/expansion/inventory.json). New component registries are available individually at `/r/<component>.json`.

See [authoring and developer tooling](docs/tooling/README.md) for the MCP server, agent setup, exported design systems, and skills. Native source-package setup is described in [Ankvale Native](packages/native-ui/README.md).

## Agent guidance and motion

Start at `/guides` or `/llms.txt`. `docs/agents/AGENTS.md` is the project entry point; the selection guide maps tasks to exact component, block and template IDs. The design and motion guides define layout, content, states, timing and accessibility. MCP provides `recommend_patterns`, `list_blocks` and `get_guide` alongside source/API tools. `/tools` offers two self-contained skill ZIPs and an AGENTS.md/reference bundle. Add a pointer to that bundle in an existing project instruction file.

`NotFoundPage` is available in the block gallery and `/r/not-found-page.json`; the library website uses it for unknown routes.

Use `AnkvaleProvider` for appearance, locale, timezone, direction, density, scoped portals, tooltip/toast defaults and shared motion preferences. CSS handles control feedback; the existing `Motion` handles section entrances; `motion/react` powers presence, keyed switches, layout, lists and accessible reordering. `ContentTransition` uses the same state-transition system. All follow OS reduced motion and `motion="none"`; keyboard reorder controls remain available when drag is disabled. GSAP, Lottie and Three.js remain optional product integrations for timelines, authored animation assets and 3D respectively. See [animation setup and contracts](docs/implementation/animation-system.md).

```tsx
import { AnkvaleProvider } from "@ankvale/ui/components/ankvale-provider"
import { Presence } from "@ankvale/ui/components/animation"

<AnkvaleProvider locale="en-SG" timeZone="Asia/Singapore" motion="system">
  <Presence present={saved}><p role="status">Saved</p></Presence>
</AnkvaleProvider>
```

Deeper widgets include editable/clipboard grids and safe computed columns, typed recursive query filters, async virtual selectors, a generic virtual tree, queued uploads with directory paths and image cropping, geometric chart navigation, and timezone-aware recurring scheduling. Their persistence/export contracts remain caller-owned. See [component depth](docs/implementation/component-depth.md), [scheduling](docs/implementation/scheduler.md) and [chart navigation](docs/implementation/chart-interactions.md).
