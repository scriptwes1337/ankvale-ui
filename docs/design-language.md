# Ankvale design language

Notion is the sole visual reference. Ankvale has one default style, with light and dark modes.

## Reference review

Reviewed the structure and content of these representative page families on November 26, 2026; visually inspected the homepage, Docs, and pricing pages. This is a page-family review, not an exhaustive crawl of every localized page, article, or community template.

- [Homepage](https://www.notion.com/): bold centered headline, short explanation, paired actions, a large product demonstration, ample section spacing.
- [Docs](https://www.notion.com/product/docs) and [Projects](https://www.notion.com/product/projects): benefit-led headlines, product visuals, feature grids, examples, and clear calls to action.
- [Pricing](https://www.notion.com/pricing): strong headings, neutral grouped panels, legible plan comparisons, a billing control, and dividing rules.
- [Customers](https://www.notion.com/customers): featured story, category filters, logos, and repeatable story cards.
- [Templates](https://www.notion.com/templates): prominent search, compact category navigation, and browsable collections.
- [Blog](https://www.notion.com/blog): editorial hierarchy, categories, article summaries, and author metadata.
- [Help](https://www.notion.com/help): search, persistent topic navigation, and readable documentation.

Notion's live pages have evolved at different times: the homepage and pricing use black pill actions; Docs uses blue rectangular actions. Ankvale adopts the common foundation rather than reproducing every variation.

## Foundation

- White pages and panels, neutral gray borders and hover states, and near-black ink. Dark mode preserves the same hierarchy.
- Sans-serif type throughout headings and controls. Bold, tightly set marketing headings; comfortable body line-height. Avoid decorative italic hero text and widely tracked uppercase labels.
- Bootstrap blue (`#0d6efd`) primary actions with white labels, quiet secondary actions, and blue links or selection accents. Color communicates a purpose.
- Modest corners on controls and panels. Pills belong to segmented controls, status labels, or avatars when their shape serves the content.
- Thin neutral rules define groups. Shadows are reserved for elevated controls and product screenshots.
- Spacious marketing sections, consistent content widths, and denser utility navigation inside galleries.
- Original line illustrations and actual product previews explain the content. Avoid abstract glossy objects and decorative effects.
- No gradients, glass, blur, or alternative material modes.

## Implementation

Shared tokens live in `packages/ui/src/styles/globals.css`. Shared heading and section rules live in `packages/ui/src/blocks/shared.tsx`; all hero layouts use `packages/ui/src/blocks/heroes.tsx`. Update these sources before introducing page-specific exceptions. Registry generation carries these sources into installable components and blocks.

Preserve accessible focus, contrast, semantic headings, keyboard controls, and reduced-motion behavior. Ankvale retains its own name, icons, text, and illustrations; do not copy Notion branding or assets.

## Copy

Use plain page titles and functional labels. Remove decorative eyebrows, repeated slogans, promotional count badges, and descriptions that do not add information. Instructions should explain an action or constraint. Demo content should resemble real tasks and documents.

## Agent reference

The maintained implementation rules are in [the design guide](agents/design-guide.md), with [task selection](agents/component-selection.md) and [motion guidance](agents/motion-guide.md). The public site exposes these at `/guides` and `/llms.txt`; the downloadable skills include their references.
