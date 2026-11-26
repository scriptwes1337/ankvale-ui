# CLI setup contract

Status: planned. This describes the intended standalone installation experience; a working installer is not yet shipped.

Installing Ankvale into a Next.js project must also set up the local context needed by coding agents. This is part of normal initialization, not a separate manual documentation step. The package supplies shared runtime behavior; scaffolded application screens belong to the consuming project.

## Distribution boundary

The repository contains both the customer-facing website and the installable frontend system. Installing the system must not install or scaffold the Ankvale marketing site, documentation application or showcase application.

| Area | Customer installation |
| --- | --- |
| `apps/web`: homepage, hosted docs, galleries, previews and site navigation | Excluded |
| Shared components, blocks, layouts, templates, providers, motion and compiled styles | Available through runtime package exports; scaffold screens only when selected |
| Reusable icons, illustrations and product graphics | Available through explicit imports; exclude website-only artwork |
| Local documentation, API catalogs, recipes and skills | Included as versioned agent resources; no documentation website runtime |
| CLI | Setup/scaffolding tool; does not require the customer to clone this repository |
| Repository tests, audit history, build tools and development configuration | Excluded from customer-facing distribution unless specifically required to run the CLI |

Keep the repository root and customer website private/non-publishable as npm packages. Publish dedicated runtime and CLI artifacts with explicit file allowlists. Shared code must not import from `apps/web`, and neither the runtime nor the CLI may depend on the website workspace. Selected reusable website templates remain legitimate system features; the Ankvale site's own pages are excluded.

The CLI installs dependencies and required local context into the target project. It must not copy the repository, add Ankvale marketing routes, replace the project's homepage or install every template automatically. Route scaffolding is an explicit selection.

Check packed artifact contents in release validation, including transitive workspace dependencies. Test a packed installation outside this monorepo to prove it needs neither `apps/web` nor unpublished workspace-only packages. Validate import boundaries and ensure website-only assets and routes are absent from both published artifacts and generated customer files.

## Agent instructions

- If project-root `AGENTS.md` is absent, create it with an Ankvale section.
- If it exists, preserve its contents and append a clearly marked Ankvale-managed section. Do not replace project instructions, framework-generated sections or instructions belonging to other tools.
- Repeated initialization updates only the existing managed section and must not create duplicate sections. Detect locally edited managed content and present a diff before replacing it.
- Keep the section short: point to the installed local guide, explain template/block/component selection, and require reading exact APIs before implementation.
- Respect the project's instructions and the user's design choices. Ankvale defaults are fallbacks, not overrides.
- Resolve the target application and instruction scope explicitly in monorepos; do not silently configure sibling applications.

## Skills and documentation

- Install the coding and design skills, including every referenced resource, into a project-local location supported by the selected agent. Reuse the existing `ankvale-code` and `ankvale-design` content as the starting point.
- Keep a canonical project-local guide bundle and register skills through supported agent-specific adapters. Do not assume every agent discovers the same directory. If the agent cannot be detected, retain usable `AGENTS.md` guidance and report the optional adapter command.
- Do not modify global or personal agent configuration during normal project initialization.
- Include setup and import examples, component/block/layout/template catalogs, selection recipes, design and motion rules, accessibility expectations, asset guidance and backend integration boundaries.
- Provide exact package imports and API contracts for the installed version. Registry-only commands must not be presented as required steps in the standalone package workflow.
- Local guidance must work without a running Ankvale documentation site or an MCP connection. Online docs and MCP are optional discovery enhancements.
- Distinguish shipped capabilities from proposed features and demo data from connected services.

## Versioning and maintenance

- Record runtime, CLI, skill and documentation versions, chosen agent adapters and managed file paths in a setup manifest.
- Initialization is idempotent. Preserve user-authored guides, custom skills and application code.
- An explicit update operation previews changes, refreshes compatible managed files and reports conflicts. Package updates must not silently rewrite project instructions through a postinstall hook.
- Expose a read-only doctor operation that detects broken guide links, missing resources, duplicate managed sections and package/context version mismatches.
- End initialization with a concise report of files created or changed and any remaining setup requirements. Do not claim an adapter is active unless its configuration was verified.

## Acceptance checks

Validate fresh and existing Next.js projects, existing `AGENTS.md` files, repeated initialization, locally edited managed content and monorepo application targets. Verify installed skills resolve all references, local catalogs match package exports, and a supported agent can select a real block and use its exact API from the local bundle. Verify an agent without a skill adapter can still discover the same guidance through `AGENTS.md`.
