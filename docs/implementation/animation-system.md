# Ankvale animation system

Ankvale uses CSS for immediate control feedback, the existing one-shot `Motion` for section entrances, and Motion for React for presence, layout changes and reorder interactions. `motion` is the runtime dependency; the React entry point is `motion/react`. The public Ankvale APIs keep timing, appearance and reduced-motion policy consistent.

## Which engine belongs where

| Engine                    | Role in Ankvale                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| CSS transitions/keyframes | Hover, focus, press, state changes and existing Base UI overlays                                                              |
| Existing Ankvale `Motion`  | One-shot viewport reveal; content remains visible without JavaScript                                                          |
| Motion for React          | `Presence`, `AnimatedSwitch`, `AnimatedLayout`, `AnimatedList`, `AnimationGroup`, `ReorderList`                               |
| GSAP                      | Optional project-level integration for complex timelines and scene choreography; not a core dependency                        |
| Lottie                    | Optional lazy-loaded authored illustration assets with a static poster and playback controls; not a core dependency           |
| Three.js                  | Optional lazy-loaded 3D scenes with a static fallback, rendering budget and explicit interaction model; not a core dependency |

This division avoids loading multiple animation engines for ordinary UI. A separate specialist package/adapter can be introduced when real project assets require it. Do not add a library merely to reproduce a button transition.

## Provider and defaults

`AnkvaleProvider` supplies locale, timeZone, direction, density, appearance, tooltip delay, scoped portal container and motion preference. Default appearance is `inherit`, locale `en-US`, timezone `UTC`, density `comfortable`, and motion `system`. It does not modify the document, persist preferences, or read storage. A product may control those preferences from its own settings and pass them in.

`appearance="system"` uses a stable `serverAppearance` fallback during SSR, then follows live browser preference changes. Set it from server-known preferences when available. For site-wide appearance without a hydration flash, keep the site's existing server/root theme setup and use `appearance="inherit"`. Explicit light/dark providers can nest within another appearance. Portal wrappers default into the provider container so dialogs, menus and tooltips inherit the same tokens and direction. Set `portalContainer` explicitly for a host or shadow-root integration; external targets must load Ankvale styles and provide their own matching appearance, `lang`, `dir`, density variables and motion scope because DOM inheritance does not cross portal boundaries. Avoid transformed/clipped provider ancestors when using fixed overlays.

Density currently sets compact/spacious heights for standard Input and Select trigger controls; it is not a blanket rewrite of custom component size props. Components may consume `useAnkvaleConfig` for additional defaults. Locale/timeZone are defaults exposed to consumers; not every existing component automatically localizes every string from them. Pass the component's documented locale/localizer where needed. Opt into the provider's Toaster with `toasts`; defaults avoid duplicate global toasters in embedded contexts.

## Use the public APIs

```tsx
import { AnkvaleProvider } from "@/components/ui/ankvale-provider"
import {
  Presence,
  AnimatedLayout,
  ReorderList,
} from "@/components/ui/animation"

// Owner controls these values and callbacks.
;<AnkvaleProvider locale="en-SG" timeZone="Asia/Singapore" motion="system">
  <Presence present={showNotice} preset="reveal">
    <p>Your draft is ready for review.</p>
  </Presence>
  <AnimatedLayout>{details}</AnimatedLayout>
  <ReorderList
    label="Launch checklist"
    items={items}
    onItemsChange={setItems}
  />
</AnkvaleProvider>
```

Durations in Ankvale props are **milliseconds**, including `Motion`, `Presence`, and `AnimatedSwitch`. Public timing values are fast 120, state 180, enter 280 and exit 160ms; transitions are clamped to 0–600ms. Motion's internal transition configuration uses seconds; wrappers handle that conversion. Keep any direct third-party usage consistent with the same tokens.

- `Presence`: mount the wrapper outside the condition and toggle `present`. Removed content becomes inert/hidden to assistive technology immediately while its visual exit finishes. Use ordinary Dialog/Sheet for modal interactions; Presence does not replace focus management.
- `AnimatedSwitch`: change `stateKey` to crossfade replacement content in one grid cell. Exiting content is inert. Keep active form fields and focused controls outside content that will remount. `ContentTransition` now delegates to this implementation.
- `AnimatedLayout`: animates position changes, not an arbitrary height/width morph. `layoutId` can link shared elements inside an `AnimationGroup`; use stable IDs and avoid collisions across unrelated groups.
- `AnimatedList`: stable item IDs preserve identity during enter/remove/reorder. It provides presentation, not selection, pagination or virtualization. Use the collection/grid APIs for large datasets.
- `ReorderList`: controlled single-axis ordering with a pointer handle and explicit move-up/down buttons. A live status announces changes. The caller owns the ordered array and persistence. Do not use it as a multidimensional Kanban engine.
- `AnimationProvider disabled`: local motion opt-out for an animated subtree. `AnkvaleProvider motion="none"` applies the shared policy across CSS and JavaScript animations. A nested provider cannot re-enable motion inside an explicit opt-out.

## Accessibility and lifecycle

The shared `useReducedMotion` follows live OS changes and provider opt-outs and defaults to reduced motion during SSR. Shared Motion-based wrappers disable decorative movement and use zero-duration changes when reduced. Under reduced motion, reorder drag handles are disabled and the immediate move controls remain available; this avoids inertial release animations. Other direct manipulation remains responsive. Existing one-shot Motion still keeps content visible before hydration and cancels on focus. Existing Base UI overlays retain their own placement, focus and dismissal behavior; do not wrap them in a second entrance.

No permanent floating, scroll hijacking, decorative gradients/glass, or unavoidable animated copy is introduced. Keep media optional and provide text/static alternatives. For manually embedded GSAP/Lottie/Three.js, the product integration must honor `useReducedMotion`, visibility, pause/unmount cleanup and renderer-specific disposal; installing Motion does not automatically control those engines.

## Verification and boundaries

`tests/animation-system.test.tsx` checks deterministic SSR, nested opt-out, defaults, scoped portal direction/appearance, presence removal, keyboard reorder actions, live reduced-motion changes and listener cleanup. Existing agent-guide tests cover the viewport Motion lifecycle/fallbacks. Browser review is still necessary for actual interpolation, pointer drag, overlay clipping and shared-layout geometry; JSDOM assertions do not certify those visual behaviors.

Official references: [Motion animation](https://motion.dev/docs/react-animation), [presence](https://motion.dev/docs/react-animate-presence), [layout](https://motion.dev/docs/react-layout-animations), [configuration](https://motion.dev/docs/react-motion-config), [reorder](https://motion.dev/docs/react-reorder), [Lottie Web](https://github.com/airbnb/lottie-web).
