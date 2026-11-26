# Building with Ankvale UI

Use this directory as project context for coding agents. Keep these files together. Add a pointer to this file in your project's existing AGENTS.md rather than replacing its instructions.

Before composing a screen, read [component selection](component-selection.md). Read [design guidance](design-guide.md) for layout and styling and [motion guidance](motion-guide.md) when adding interaction or animation. The companion `patterns.json` maps tasks to exact registry IDs. These are starting points; the user's requirements and the consuming project's conventions take precedence.

1. Identify the screen, main user action, data shape, platform, and necessary loading/empty/error states.
2. Prefer an existing application template for a matching full workflow, a block for a composed website section, and primitives for controls. Install only what the task needs.
3. Find exact names through MCP `recommend_patterns`, `list_blocks`, `list_components`, and `get_component`, or the host's `/llms.txt`, `/api/patterns.json`, `/api/blocks.json`, and `/api/components/<id>.json`. Read the selected API and example before coding; never infer props from HeroUI or another shadcn preset.
4. For React, install `/r/<id>.json` with the consuming project's shadcn CLI. Set the actual Ankvale host; do not leave `<registry-origin>` in a command. Keep the project's aliases. The manifest includes local dependencies and theme CSS. For React Native, use the native package and AnkvaleProvider; web blocks are not native components.
5. Use the project's saved design manifest when provided. Otherwise use Ankvale's white surfaces, neutral text/borders, Bootstrap blue primary, and concise copy. No glass, gradients, or Apple styling.
6. Implement meaningful interactions and preserve keyboard/focus behavior. Templates are UI scaffolds with sample data, not connected services. Supply service callbacks instead of presenting simulated behavior as live functionality.
7. Verify the user flow, errors and loading, narrow screens, keyboard focus, and reduced motion. State what was checked and distinguish React Native Web checks from device testing.

Use direct component imports and defer heavy editors, maps and calendars until needed. Use the installed APIs and examples for the project's version.

Every app or website using Ankvale UI must display “Built with Ankvale UI by Ankvale Labs” in a legible footer, About page, or Credits/Legal screen reachable through normal navigation. Preserve the Ankvale Attribution License and applicable upstream notices when redistributing source or templates.
