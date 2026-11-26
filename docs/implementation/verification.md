# Frontend system verification

26 November 2026. This records the current checkout implementation, not a published npm release or an exhaustive competitor-parity certification.

The web catalog contains 176 component modules, 88 independently installable application/website block variants plus nine hero layouts, and five application templates. All 111 C/E/B/W audit families have public initial implementations with explicit service/advanced-feature boundaries. New standalone components have independently loaded previews; new blocks have variant previews, copyable examples and module API documentation. There are 42 task recipes in the agent guide.

## Checks

- All workspace TypeScript checks pass: web, UI, native and design-system.
- Production Next.js build passes, including static component/block API routes and generated previews.
- 176 component examples and 67 new block examples compile using consumer import aliases. New block definitions resolve to examples, source manifests and module/variant API docs.
- 273 standalone registry manifests have complete local import closures and no `@workspace/` aliases. The full 230-file TypeScript consumer fixture compiles.
- Real shadcn CSS/variable transforms preserve the installed provider's nested light/dark variants, density reset and motion opt-out. Source and installed CSS compile and pass isolated browser computed-style checks.
- Focused suites pass for animation/provider, 34 application previews, 33 website previews, component enhancements, advanced charts, spreadsheet/computed analysis, recursive queries/export adapters, image crop export, directory uploads, timezone/recurrence scheduling and agent bundles. Existing blocks, heroes, system components and expansion/template tests pass.
- Chrome desktop review confirms presence/reorder/reduced motion, scoped dark/RTL dialog, application/website previews, full-viewport modal backdrop, resource event editing, chart zoom/exact values, crop image/preview and typed nested query changes.

ESLint now parses TS/TSX rather than silently excluding them. New feature files pass focused lint except the documented TanStack compiler-compatibility notices for virtual/table hooks. The wider repository retains baseline warnings for effect initialization, legacy render purity/refs, unused demo values, environment declarations and Next navigation links; the existing lint configuration reports warnings without failing. Full physical-device, assistive-technology and cross-browser certification remains separate. The optional scheduler week/month view uses the browser timezone; its resource-day/editor use the configured IANA zone.

Useful commands are `npm run registry:build`, `npm run typecheck`, `npm run test:api`, `npm run test:registry`, the focused `test:*` scripts in package.json, and `npm run build --workspace=web`.
