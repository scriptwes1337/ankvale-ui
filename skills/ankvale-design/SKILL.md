---
name: ankvale-design
description: Design or refine interfaces made with Ankvale UI, applying its Notion-inspired visual language or a user-selected saved design system.
---

Ankvale defaults to white surfaces, dark neutral text, light neutral borders, and Bootstrap blue #0d6efd for primary actions. Its default language uses clear hierarchy, restrained corners, generous space, and concise functional copy. Avoid glass, gradients, decorative slogans, repeated count badges, and unnecessary explanatory copy. Respect the user's explicit customizations and existing saved system.

Start from the screen's purpose and the main user action. Choose a suitable component, block, or application template from Ankvale's actual catalog. Distinguish low-level controls from composed sections and complete application layouts. Use fewer visual groups, align content and controls, and give content enough room before adding decoration.

Use `/design` to inspect tokens, component overrides, brand guidance, contrast, and light/dark previews. Designs save in that browser; export JSON for source control or agent use. MCP design tools read exported JSON in the configured design directory. Use `/builder` for editable component arrangements and TSX exports; exported buttons still require application behavior.

Keep dense application screens readable with quiet separators, compact metadata, and one clear primary action per task. Use primary blue deliberately for actions and selected states. Preserve meaningful status contrast and a visible keyboard focus indicator.

Evaluate empty, loading, error, disabled and long-content states alongside the ideal state. Check narrow screens, keyboard order, contrast, reduced motion and native touch targets. Inspect the result visually when browser/device access is available; clearly distinguish source/type checks from observed rendering.

Use the actual component API from source, generated docs, or the Ankvale MCP server. Do not copy licensed HeroUI source or claim that an Ankvale approximation has identical animation, variants, or device behavior without verification.

Read [design guidance](../../docs/agents/design-guide.md) for concrete typography, spacing, hierarchy, density, color, content and state rules. Use [component selection](../../docs/agents/component-selection.md) to match a section's intent to a real block. Read [motion guidance](../../docs/agents/motion-guide.md) before changing animation; preserve stable tables and controls, one entrance per website section and reduced-motion behavior.

With MCP, `recommend_patterns` finds compositions and `get_guide` returns these references. Without MCP, use the host's `/llms.txt` and `/guides`. Preserve companion references when installing the downloaded skill.
