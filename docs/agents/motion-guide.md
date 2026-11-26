# Ankvale motion guide

Animate feedback, hierarchy and changes in state. Keep the interface quiet at rest. Do not animate every decorative surface or delay access to content.

## Shared timings

| Token                 | Default                         | Use                                             |
| --------------------- | ------------------------------- | ----------------------------------------------- |
| `--motion-fast`       | 120ms                           | Press, hover, focus and small control changes   |
| `--motion-state`      | 180ms                           | Selection, progress and compact content changes |
| `--motion-enter`      | 280ms                           | One section entrance                            |
| `--motion-ease`       | `cubic-bezier(0.2, 0, 0, 1)`    | Control feedback                                |
| `--motion-ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Settling entrances                              |

Motion uses opacity and small transforms where possible. A press scales to 0.98; a reveal travels 8px; a scale entrance begins at 0.98. No bounce, parallax, cursor followers, perpetual floating, decorative shimmer, or scroll hijacking.

## Component policy

| Family                                            | Treatment                                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Buttons, toggles, segmented controls              | Short color/border feedback; subtle press scale. Disabled controls do not press                                                                        |
| Inputs and selection controls                     | Color, border and focus-ring transitions; preserve immediate keyboard feedback                                                                         |
| Dialogs, sheets, menus, tooltips                  | Existing Base UI state-driven entrances/exits. Keep their placement transforms and focus behavior intact                                               |
| Accordion/collapsible                             | Existing height/opacity transitions explain expansion. Do not also animate the surrounding section on every toggle                                     |
| Progress and sliders                              | Short state transitions. Do not ease a directly dragged thumb behind the pointer                                                                       |
| Skeletons and loaders                             | Activity only while work is pending; keep an accessible status label. Reduced motion keeps a static indicator                                          |
| New chat messages, approval cards and action bars | Short content entrance. Never replay on every streamed token                                                                                           |
| Charts                                            | 320ms series changes, reduced-motion aware. Pass `animate={false}` for frequent live updates or capture                                                |
| NumberValue                                       | Existing numeric interpolation, now follows live reduced-motion changes; the accessible value remains the final value                                  |
| Website heroes and sections                       | One Motion entrance around the composition. Avoid separate stagger delays for every child                                                              |
| Tables, trees, maps and dense app layouts         | Keep geometry stable. Feedback should not move rows or distract from scanning                                                                          |
| Native UI                                         | Keep existing morph, flip, numeric and gesture animation semantics; honor AccessibilityInfo reduced motion. Web CSS does not animate native components |

## Using Motion

```tsx
import { Motion } from "@/components/ui/motion"

export function Introduction() {
  return (
    <Motion preset="reveal">
      <h2>Project overview</h2>
      <p>Recent work and upcoming milestones.</p>
    </Motion>
  )
}
```

Install `/r/motion.json`. Presets are `reveal`, `fade` and `scale`. `duration` overrides the entrance token and is clamped to 0–600ms; delay is clamped to 0–200ms. `disabled` turns the wrapper's motion off. It plays once when entering the viewport, keeps content visible before JavaScript loads, and cancels when focus enters. Remount deliberately to replay; ordinary rerenders should not replay an entrance. Avoid wrapping sticky or fixed elements in a moving composition.

BlockSection and hero layouts already use Motion. Do not wrap them in a second Motion component. Keep navigational headers and footers stable unless a task has a reason to animate them.

## Accessibility and opt-outs

`prefers-reduced-motion: reduce` suppresses CSS transitions and decorative animation. The web `useReducedMotion` hook also follows live preference changes for Web Animations and charts. Content is never dependent on an animation finishing.

Set `disabled` on Motion or put `data-motion="none"` on a subtree to opt out of CSS and section entrances. For a chart use its explicit `animate={false}` prop; for NumberValue use `duration={0}`. The subtree CSS switch does not intercept third-party JavaScript animation. Test native reduced motion on the target device.

## Verification

Check one entrance, repeated rerenders, keyboard focus during an entrance, live preference changes, an offscreen section, and unsupported Web Animations/IntersectionObserver fallbacks. Make sure content is available without JavaScript. Confirm animation does not cause horizontal overflow, layout shifts or a delayed action. Test charts with real dimensions; JSDOM cannot validate their appearance.

## Stateful animation and provider

Use `animation` for Presence, AnimatedSwitch, AnimatedLayout, AnimatedList, AnimationGroup and controlled ReorderList. It uses Motion for React (`motion/react`). Ankvale duration props remain milliseconds (120/180/280/160ms fast/state/enter/exit), with reduced-motion and provider opt-outs. Existing `Motion` remains the visible-before-JavaScript one-shot section entrance; ContentTransition now uses AnimatedSwitch. Do not animate the same element through both systems.

`AnkvaleProvider` supplies locale, zone, direction, density, appearance, portal and motion defaults. Set `motion="none"` to disable shared movement, or use AnimationProvider disabled locally. Exiting content is inert; keep focused inputs out of keyed replacement content. Use Base UI Dialog/Sheet for overlays rather than Presence alone. ReorderList provides drag handles plus explicit keyboard move actions and announcements; it does not replace a virtualized collection or Kanban engine.

GSAP timelines, Lottie assets and Three.js scenes are specialist opt-in project integrations, not core dependencies. Lazy-load them, honor useReducedMotion, provide a static alternative, and dispose work on unmount. The shared Motion provider cannot automatically govern those separate engines.
