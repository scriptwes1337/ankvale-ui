# Animations, icons and graphics

Use motion to explain feedback and changes in state. Keep an interface quiet at rest. Use icons for compact functional meaning and illustrations for compositions that benefit from more visual explanation.

## Animation layers

| Layer | Use |
| --- | --- |
| CSS transitions/keyframes | Hover, focus, press, control states and existing overlay transitions |
| Ankvale `Motion` | One-shot section entrances; content remains available before hydration |
| Motion for React | Presence, keyed switches, layout changes, animated lists and accessible reorder |
| Optional specialist engine | A product-specific timeline, authored illustration or 3D scene requiring additional capabilities |

Ankvale uses `motion/react` for its animation wrappers. You can add GSAP, Lottie or Three.js for specialist scenes when your product needs them; load those integrations only where they are used.

## Use the shared policy

```tsx
"use client"

import { useState } from "react"
import { AnkvaleProvider } from "@/components/ui/ankvale-provider"
import { Presence } from "@/components/ui/animation"
import { Button } from "@/components/ui/button"

export function NoticeExample() {
  const [visible, setVisible] = useState(false)
  return (
    <AnkvaleProvider motion="system">
      <Button onClick={() => setVisible((value) => !value)}>Toggle notice</Button>
      <Presence present={visible} preset="reveal" duration={180}>
        <p role="status">Your draft is ready.</p>
      </Presence>
    </AnkvaleProvider>
  )
}
```

Keep `Presence` mounted and change its `present` prop. Use Dialog/Sheet components for modal behavior; animation wrappers do not replace focus management. Preserve stable IDs in lists and use the documented keyboard reorder controls.

Public timing defaults are 120ms for fast feedback, 180ms for state changes, 280ms for entrances and 160ms for exits. Wrapper durations are clamped to 0–600ms. The shared wrappers apply the provider’s motion preference and support server-rendered content.

## Reduced motion and looping assets

The provider and shared hook follow the operating system and explicit product opt-outs. A reduced-motion state should show the final information without decorative movement. Do not hide essential content behind an animation.

A standalone looping illustration collection is upcoming. When adding animated artwork to your product, include a static fallback, visibility-based playback, cleanup and an opt-out. Long-running scenes should pause offscreen. Success confirmations normally play once; ongoing work should use an honest pending state. Avoid continuous decoration in a dense working interface.

## Icon conventions

Phosphor is the installed web icon family. Browse `/icons` for searchable previews in thin, light, regular, bold, fill and duotone weights. Choose a consistent weight for a product; regular is the default. The browser copies a React example using the installed package API.

```tsx
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

<button type="button" aria-label="Search projects">
  <MagnifyingGlassIcon size={20} weight="regular" aria-hidden="true" />
</button>
```

The button supplies the action's accessible name, so the nested icon is decorative. Label standalone meaningful graphics appropriately. Use `currentColor` so icons follow foreground/disabled/theme states. Choose clear silhouettes and do not rely on color alone. Directional icons need deliberate RTL review; do not blindly mirror logos, clocks or every arrow.

Import only the icons your product uses. The icon catalog lets you preview the full family without requiring your app to include every icon. Preserve Phosphor’s MIT notice when redistributing its artwork.

## Illustration and product graphics

Ankvale’s illustration style is color-neutral: black, white and achromatic grays, clear linework and restrained detail. Use primary-action blue in the interface while keeping supporting illustrations adaptable to your product.

Use existing icons for routine statuses rather than drawing a separate illustration for every control. Use richer compositions for onboarding, empty screens and marketing, built from reusable frames, cards, documents and connectors. Original React/SVG compositions are included in the hero blocks; a standalone graphics catalog is upcoming.

Prefer code-native SVG/React for diagrams, frames and themeable graphic primitives. Use raster artwork for detailed illustrations and keep editable vector sources where customization is important.

## Asset rights and performance

Retain creator, license, source, version/revision where known, modification notes and permitted redistribution for every shipped third-party asset. Map tiles, photos, fonts, emoji datasets, logos and animations have separate rights from their rendering libraries. A renderer's permissive license does not grant rights to arbitrary content loaded through it.

Provide meaningful text alternatives where needed, set explicit dimensions, use responsive formats and load heavy assets only when relevant. External URLs and paid services require product-level configuration and rights review.
