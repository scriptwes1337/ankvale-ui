# Installation and first use

Install the frontend system from npm. One package includes components, blocks, templates, compiled styles, animations, icons, the setup CLI and version-matched agent resources.

## Prerequisites

Use Node.js 22.13 or newer and React/React DOM 19.3 or newer within major version 19. Automatic setup supports Next.js App Router. Other React applications, including Vite, use the manual setup below. No shadcn CLI or Tailwind build is required for the npm package.

See [supported technologies](platforms.md) for the tested framework baseline.

## Set up a Next.js project

Run this from your application's directory:

```sh
npx @ankvalelabs/ui init
```

The CLI installs the matching package version, imports compiled styles, adds a provider boundary and visible attribution, and preserves existing layout content and routes. It creates or extends `AGENTS.md`, adds `.ankvale` documentation/catalogs, and installs project-local skills. Use `--agent both` for Codex and Claude, or choose `codex`, `claude` or `none`. Global agent settings are unchanged.

Review changes first with `--dry-run`. In a monorepo, select the application with `--cwd apps/my-app`. Edited managed files produce conflicts rather than being overwritten.

```sh
npx @ankvalelabs/ui init --dry-run
npx @ankvalelabs/ui doctor
npx @ankvalelabs/ui add dashboard --path app/dashboard/page.tsx
```

The last command creates an explicitly selected template route. Templates start with demo data; connect your own services.

## Use a component

```tsx
import { Button } from "@ankvalelabs/ui/components/button"

export function SaveAction() {
  return <Button type="submit">Save changes</Button>
}
```

Use direct feature imports. The installed `.ankvale/catalog.json` maps component, block and template IDs to imports and exact API records. The package is also listed on [npm](https://www.npmjs.com/package/@ankvalelabs/ui).

## Manual React or Vite setup

```sh
npm install @ankvalelabs/ui
```

Import `@ankvalelabs/ui/styles.css` once at your application boundary and wrap your UI in the provider. In Next.js, keep this provider in a client component and mount it inside your root layout's body:

```tsx
"use client"

import type { ReactNode } from "react"
import "@ankvalelabs/ui/styles.css"
import { AnkvaleProvider } from "@ankvalelabs/ui"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AnkvaleProvider
      appearance="inherit"
      locale="en-SG"
      timeZone="Asia/Singapore"
      motion="system"
    >
      {children}
      <footer>Built with Ankvale UI by Ankvale Labs</footer>
    </AnkvaleProvider>
  )
}
```

Use your application's theme setup for a site-wide preference, or an explicit provider appearance for a section. Load custom CSS after the package stylesheet. Styles are scoped to the provider, while default semantic variables are global; an optional global reset is available at `@ankvalelabs/ui/reset.css`. Arbitrary new utility classes still need your own CSS or utility build.

Manual map setup requires copying `node_modules/@ankvalelabs/ui/assets/maplibre-gl-worker.mjs` to `public/ankvale-assets/maplibre-gl-worker.mjs`, or supplying a hosted `workerUrl` to Map. The CLI handles the copy for Next.js.

## Updates and agent resources

Use `npx @ankvalelabs/ui@<version> update` to install that version and refresh its managed context. Review conflicts and local changes before accepting an update. Run `doctor` with the same version as your installed package. Read [coding agents](agents.md) for local skill setup and discovery.

## Editable source alternative

The shadcn source registry remains available for projects that want to own and edit component source. This alternative requires a configured shadcn + Tailwind CSS v4 project:

```sh
npx shadcn@latest add https://ui.ankvale.com/r/button.json
```

Registry imports follow your configured aliases, such as `@/components/ui/button`; npm imports use `@ankvalelabs/ui/components/button`. Choose a consistent installation approach per component and review overwrite prompts.

Keep the installed licenses and [required visible attribution](../legal/licensing.md). Continue with [building apps](building-apps.md) and [customization](customization.md) to choose layouts and adapt your brand.
