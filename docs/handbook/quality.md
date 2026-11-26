# Accessibility and security

Ankvale provides accessible interaction foundations and shared interface patterns. Keep these behaviors intact when composing and customizing your application, and test them with your own content and integrations.

## Accessible interfaces

- Give inputs visible labels and icon-only buttons an accessible name.
- Use a logical heading structure and semantic controls.
- Preserve keyboard navigation, focus visibility, modal focus handling and focus restoration.
- Associate validation errors with their fields and announce important status changes.
- Check text, controls, focus and selected states against their backgrounds in both themes.
- Support zoom, narrow layouts, long content and suitable touch targets.
- Respect reduced motion and provide text or exact-value alternatives for meaningful graphics and charts.

Complex editors, grids, trees, calendars and drag interactions deserve additional testing with the assistive technologies your audience uses. If you change markup or replace a primitive's behavior, recheck its keyboard and screen-reader interaction.

## Localization and direction

Use the provider's locale, time zone and direction settings, plus any widget-specific localization props. Supply translated product labels and review directional icons and layouts in RTL. Native controls and web scheduling views have their own documented date/time contracts.

## Application security

Validate and authorize operations on your server. Client-side validation improves feedback but does not replace server checks. Keep credentials out of client code, public assets, design manifests and agent instructions.

Treat uploaded files, rich text, Markdown, imported URLs and saved JSON as untrusted input. Apply the validation, sanitization and storage controls appropriate to your application. Configure file limits and access permissions on the server, even when a component previews or validates files locally.

## Services and external assets

Connect authentication, payments, email, storage and other services through your application's integrations. Handle pending, failure, retry and success states without losing the user's work.

Map tiles, images, fonts and authored animations may have their own usage and attribution terms. Configure external services deliberately and explain relevant data flows in your product's privacy information.

## Design studio data

The design studio saves manifests in browser storage. Export JSON to back up or share a design. Optional AI proposals send the submitted design context and instruction to the configured model provider when you request a proposal. Ordinary components and local guide bundles do not require that service.

## Before you publish

Try the complete user journey with realistic data, long content and service failures. Check the supported browsers, mobile layouts, keyboard focus and reduced motion. Test React Native applications on the physical devices you support.

Component behavior is a foundation for your product's accessibility; it is not a product-wide accessibility or security certification.
