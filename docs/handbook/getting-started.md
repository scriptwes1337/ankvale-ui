# Installation and first use

Install Ankvale components into your React project through the source registry. You receive editable source code, its required dependencies and theme configuration. The standalone npm package and automatic setup CLI are upcoming.

## Prerequisites

Use a React project configured for shadcn and Tailwind CSS v4. For a Next.js project, use TypeScript and the App Router, and keep your existing application routes and provider setup.

The [supported technologies guide](platforms.md) lists the current framework baseline. Use the package manager and runtime versions supported by your application.

## Install components

Replace `<registry-origin>` with the origin of the Ankvale website serving the registry. The website's Get started section displays the complete command for its current host.

```sh
# Start with one component
npx shadcn@latest add <registry-origin>/r/button.json

# Add a composed section
npx shadcn@latest add <registry-origin>/r/feature-bento.json

# Or install the complete collection
npx shadcn@latest add <registry-origin>/r/ankvale-ui.json
```

Install individual items when you need only part of the system. Review overwrite prompts when adding source to a project with existing components. Keep the installed license files with the source and add the [required project credit](../legal/licensing.md) to your application.

## Use a component

Imports follow the aliases configured in your project. With the usual shadcn alias:

```tsx
import { Button } from "@/components/ui/button"

export function SaveAction() {
  return <Button type="submit">Save changes</Button>
}
```

Each component's API reference provides its exports, props and examples. Blocks and templates have their own usage examples and data contracts.

## Add shared preferences

Create a client provider boundary for appearance, locale, direction, density and motion preferences:

```tsx
"use client"

import type { ReactNode } from "react"
import { AnkvaleProvider } from "@/components/ui/ankvale-provider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AnkvaleProvider
      appearance="inherit"
      locale="en-SG"
      timeZone="Asia/Singapore"
      direction="ltr"
      density="comfortable"
      motion="system"
      toasts
    >
      {children}
    </AnkvaleProvider>
  )
}
```

Mount this below your root layout and load the installed theme stylesheet once. Use your application's theme setup for a site-wide light/dark preference, or select an explicit provider appearance for a section. If your app already has a global toaster, leave the provider's `toasts` option disabled.

The provider supplies scoped defaults and portal context. Your application controls saved preferences, fonts and service connections. Some widgets have separate localization props; use their API reference when configuring dates or translated labels.

## Build your first screen

Choose a [template or block](building-apps.md), supply your own content and connect its callbacks to your application's services. Try the main action, loading and error states, keyboard navigation and a narrow layout.

Continue with [customization](customization.md) to adjust the brand or [coding agents](agents.md) to install the companion guides and skills.
