# Customizing appearance and behavior

Customize shared tokens first, reusable component variants second, and individual screens last. This keeps products consistent and makes upgrades easier. A customer may choose a different brand; Ankvale's white/ink/blue language is the default when no product-specific design system is provided.

## Color and theme tokens

The installed theme stylesheet supplies light/dark semantic variables for canvas, text, cards, overlays, actions, borders, focus, charts, sidebar and status surfaces. Use token roles instead of scattering literal colors through components.

Important relationships include `--primary` with `--primary-foreground`, `--background` with `--foreground`, `--card` with `--card-foreground`, `--popover` with `--popover-foreground`, and `--sidebar-primary` with `--sidebar-primary-foreground`. Changing one member of a pair requires checking the other.

The default primary is Bootstrap blue `#0d6efd`. This is a color choice, not a dependency on Bootstrap CSS.

To scope an application's brand while preserving provider behavior:

```tsx
<AnkvaleProvider className="product-theme" appearance="light">
  {children}
</AnkvaleProvider>
```

Load custom CSS after the installed stylesheet:

```css
.product-theme[data-slot="ankvale-provider"] {
  --primary: #2457c5;
  --primary-foreground: #ffffff;
  --sidebar-primary: #2457c5;
  --sidebar-primary-foreground: #ffffff;
  --accent: #edf2ff;
  --accent-foreground: #193e8f;
  --ring: #2457c5;
  --sidebar-ring: #2457c5;
  --radius: 0.5rem;
}

.product-theme[data-slot="ankvale-provider"].dark {
  --accent: #233451;
  --accent-foreground: #c2d5ff;
  --ring: #a3c2ff;
  --sidebar-ring: #a3c2ff;
}
```

Use `appearance="dark"` or the documented system/inherited appearance setup when applying the dark treatment. A generic `:root` override alone may not reach an explicitly light scoped provider, because that scope declares its own tokens. Unlayered custom CSS can also outrank layered defaults; inspect the cascade rather than adding arbitrary `!important` declarations.

Check normal, hover, disabled, focus and selected states in both appearances. Test text and non-text contrast against the actual adjacent surface. Semantic status must be understandable through text or symbols as well as color.

## Typography

The Ankvale website uses Inter and Geist Mono. You can load these or your own fonts through your application’s font setup, such as `next/font/google` in Next.js. Choose fonts deliberately, retain their notices, and load them once at the application boundary.

Set the documented font variables or an inherited font family. Keep a small type scale and a clear hierarchy. Avoid image-based body copy and unnecessary font weights. Font licensing and font binary versioning are separate from the version of the Next package that downloads them.

## Spacing, radius and density

Use a 4px rhythm for related spacing and shared radius tokens. The provider accepts `comfortable`, `compact` and `spacious` density. Density currently affects standard Input/Select heights and consumers that read the configuration; it does not automatically resize every custom widget or template.

Use documented size/variant props before adding overrides. Use logical spacing properties so RTL remains viable. Custom layouts should stack or scroll intentionally rather than relying on a smaller global font size.

## Component UI and composition

Use `className` or documented slots for a local change. Add a reusable variant for a design that will repeat. In a source-registry installation the source belongs to the consuming application and can be edited; record important deviations so future updates can be reviewed. Do not remove accessibility behavior while restyling a primitive.

Use your project’s configured import aliases and the component API reference for exact exports and props.

## Design manifests and the studio

The `/design` editor stores named systems locally and exports JSON, web CSS, native theme data and guidance. Export JSON for a portable backup; browser storage is neither cloud sync nor a version-controlled source of truth.

`@ankvale/design-system` supplies `createDesignSystem`, `validateDesignSystem` and `exportDesignSystem`. Component-slot style overrides currently cover defined numeric properties such as radius, padding, border width and font size; the manifest is not an arbitrary CSS or React execution format. Validate imported manifests. Keep the chosen manifest alongside the consuming product's configuration and tell agents to read it.

An exported CSS snapshot may need its selectors adapted for scoped providers. Native exports must be applied through the native theme contract rather than browser CSS.

## Motion customization

Use provider `motion="system"` by default or `motion="none"` for a product-wide opt-out. Use a local `AnimationProvider disabled` for a subtree. Named animation props use milliseconds; Motion's internal transition engine uses seconds. Read [motion and assets](motion-assets.md) before adding custom engines or loops.

## Document a product's decisions

Record its color pairs, typography, density, corner treatment, chosen layouts, motion policy, icon weight, illustration policy and intentional component exceptions. Include the manifest and examples in the project's agent context. Updating a screenshot without updating these decisions leaves the next person or agent to guess.
