---
name: ankvale-code
description: Build or edit React, shadcn, and React Native interfaces with Ankvale UI using its real component APIs and installable registry.
---

Use Ankvale's source and generated API documents instead of assuming compatibility with HeroUI or other shadcn presets.

Find components through the Ankvale MCP `list_components` and `get_component` tools when configured. Otherwise inspect `packages/ui/src/components`, `packages/native-ui/src/components`, and generated `apps/web/public/api/components/<name>.json` in an Ankvale checkout. Run `npm run registry:build` if generated files are missing.

For a consuming React project, install only the necessary `/r/<name>.json` items from its running Ankvale host with the project's shadcn CLI. Template items are `<name>-template.json`: dashboard, mail, chat, crm, finances. Preserve existing project aliases and stylesheet imports. Registry manifests include dependencies and CSS. Review the resulting diff before combining tokens with an existing theme.

For native projects, use `@ankvale/native-ui/components/<name>` source with `AnkvaleProvider`, React Native, and react-native-svg. Browser previews at `/native` use React Native Web and do not establish device correctness. Keep user text inside React Native Text components.

Treat templates as local UI scaffolds. Wire their supplied callbacks to the application's auth, data, messaging, or AI services only when requested. The example actions do not establish a backend connection.

Read the selected component's controlled/uncontrolled props before wiring state. Verify the meaningful user flow, loading and error behavior, keyboard/touch input, and the destination platform. Consult a project's AGENTS.md and installed framework documentation before changing its conventions.

Use the saved design manifest and its `web-css`, `native-theme`, `design-md`, or `product-md` exports when available. Source-backed documentation takes precedence over guessed names or props. Report concrete gaps rather than inventing supported variants.

Before choosing a composition, read [component selection](../../docs/agents/component-selection.md). Use the task tables and [task patterns](../../docs/agents/patterns.json) to select exact template, block and component IDs. A matching existing composition is the default starting point; prune unneeded sections rather than adding every recommended section.

For visual decisions read [design guidance](../../docs/agents/design-guide.md); for animation read [motion guidance](../../docs/agents/motion-guide.md). Keep this skill's companion references when installing its downloaded folder.

When MCP is configured, call `recommend_patterns` with the task, then `list_blocks`, `get_registry_item` or `get_component` for the selected parts. `get_guide` returns the selection, design, motion or agent guide. Without MCP, start at the Ankvale host's `/llms.txt`; `/api/patterns.json` and `/api/blocks.json` provide machine-readable discovery. Read selected APIs rather than loading the entire library into context.
