# Ankvale design guide

Ankvale uses one visual language: white space, strong typography, neutral surfaces, and useful blue accents. Notion is the sole visual influence. The default primary is Bootstrap blue `#0d6efd`, including dark mode. Use the consuming project's explicit saved design system when supplied.

## Begin with the task

State what the screen lets someone accomplish and identify its main action. Choose the appropriate composition using the component selection guide before deciding how many panels to add. Marketing pages explain a product; application screens help someone complete work. Their density should differ.

## Foundation

| Concern | Default | Application |
| --- | --- | --- |
| Surfaces | White page/panel, near-black text, neutral borders | Use semantic background/card/popover tokens; dark mode follows the same hierarchy |
| Primary action | Blue fill, white text | One dominant action per task or section. Secondary actions use outline or quiet treatment |
| Type | Inter/system sans; 16px body, 14px controls, 12px metadata | 1.5–1.75 body line height. Reserve large bold headings for page and marketing hierarchy |
| Spacing | 4px rhythm | Start with 8–12px within controls, 16–24px within panels, 24–32px between app groups; website blocks supply their own larger spacing |
| Corners | Shared radius tokens, default 8px | Keep related controls consistent. Pills belong to badges, avatars and segmented controls |
| Structure | Alignment, whitespace, thin rules | Introduce a card only when grouping helps. Avoid card-inside-card layouts |
| Elevation | Restrained | Shadows distinguish floating layers, not every surface |
| Color | Blue for action, focus and selection; semantic status colors | Pair status with text or an icon. Leave neutral content neutral |

Use tokens from the installed Ankvale stylesheet. Do not hardcode alternate white/gray/blue values across individual components. Avoid gradients, translucent glass, backdrop blur, excessive rounding, dramatic shadows, decorative uppercase eyebrows, count slogans, and marketing copy unrelated to the user's product.

## Layout and hierarchy

Use one h1 per page, followed by headings that reflect the document structure. Align text, fields and table edges. Limit paragraph width to roughly 60–75 characters where reading is the primary task. A supporting description should explain something the heading and controls do not already communicate.

Use an existing block's spacing before adding custom padding. Within applications, keep actions close to the content they affect. Put global navigation in AppLayout; put contextual filters beside the collection. Side details may use the aside on wide screens and a sheet on narrow screens. Tables and Kanban boards may scroll within their own region rather than widening the whole page.

At narrow widths, stack sections in reading order, keep controls reachable, collapse secondary navigation, and preserve the main task. Do not shrink text to force a desktop layout onto a phone.

## Control and content rules

Use persistent labels rather than placeholder-only inputs. Give icon-only actions an accessible name. Distinguish a toggle from a one-time action. Keep disabled states readable and explain restrictions when the reason is otherwise unclear.

Name actions with concrete verbs: “Save changes”, “Add member”, “Send reply”. Use “Cancel” to abandon an edit and “Close” to dismiss a view. Confirmation dialogs should name the object and consequence. Do not place multiple competing blue actions in one form.

Do not ship fictional testimonials, misleading numbers, fake AI responses, or dead CTA links from examples. Keep service boundaries explicit in documentation; give product users useful states instead of implementation jargon.

## Required states

Design the normal, loading, empty, error, disabled, success, selected and long-content states relevant to the task. A loading skeleton should resemble the layout it replaces. An empty state should offer the next action. A 404 is an unknown route, not an empty dataset. Errors should preserve entered values and state how to recover.

Overlays must keep focus inside while open, support dismissal appropriate to the task, and return focus to the trigger. Preserve the library's keyboard semantics. Aim for WCAG AA contrast and at least 44px touch targets for primary mobile controls. Check contrast with the actual adjacent color, including blue text and disabled states.

## Motion and review

Read the motion guide for timings, supported components and opt-outs. Motion should clarify state, location or feedback. A dense app screen usually needs interaction feedback rather than a choreographed page reveal.

Before delivery, inspect the real interface at desktop and narrow widths, in the required appearances, with long content and error states. Check keyboard navigation and reduced motion. Type checks do not establish visual quality; React Native Web does not establish iOS/Android behavior.
