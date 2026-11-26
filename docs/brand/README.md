# Ankvale UI brand

Ankvale UI is the component library by Ankvale Labs. Ankvale comes from Anchorvale, Singapore, where the business began.

## Identity

Use **Ankvale UI** for the library and **Ankvale Labs** for the business. Keep “UI” uppercase. The attribution is “By Ankvale Labs”. The site continues to use white surfaces, neutral borders, Bootstrap blue, concise copy, and no gradients or glass.

The mark joins an architectural A peak with a V valley. It connects the Anchorvale origin to modular interface construction. Use the blue mark beside a neutral, semibold “Ankvale UI” wordmark. Keep at least one quarter of the mark's height clear around it. Preserve its proportions and do not add effects or recolor it to unrelated brand colors.

## Assets

- [Transparent production mark](../../apps/web/public/brand/ankvale-ui-mark.png): 1024 pixels wide.
- [Small web mark](../../apps/web/public/brand/ankvale-ui-mark-small.png): 128 pixels wide; used by `BrandMark`.
- [Original generated artwork](../../apps/web/public/brand/ankvale-ui-logo-source.png): retained at its original resolution.
- The favicon, app icon, and Apple touch icon are in `apps/web/app/`.

The production mark is a raster PNG with transparency, not a vector master. The header and footer render the wordmark as real text for legibility and accessibility.

## Generation

Created using the built-in imagegen tool. Production PNGs and icons were trimmed and resized from the original, preserving transparency. The original prompt is saved in [logo-prompt.txt](logo-prompt.txt).

## Developer names

- Packages: `@ankvale/ui`, `@ankvale/native-ui`, `@ankvale/design-system` (private workspace source packages).
- Web provider: `AnkvaleProvider` from `@ankvale/ui/components/ankvale-provider`.
- Full shadcn registry item: `/r/ankvale-ui.json`.
- Agent skills: `ankvale-code`, `ankvale-design`.
- MCP: `ankvale-ui`; configure `ANKVALE_UI_ROOT` and optional `ANKVALE_DESIGN_SYSTEMS_DIR`.
- Studio environment: `ANKVALE_STUDIO_TOKEN`, `ANKVALE_DESIGN_MODEL`, and the existing `AI_GATEWAY_API_KEY`.

Existing browser-saved designs and interfaces are read from their former storage keys when the new keys are absent. Their contents are preserved and subsequent saves use the Ankvale keys.

The filesystem checkout may still be called `anchor-ui`; renaming a working directory is unnecessary for the product identity. No package publication, domain registration, or deployment is implied by this change.
