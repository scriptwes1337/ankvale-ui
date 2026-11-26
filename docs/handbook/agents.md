# Using Ankvale with coding agents

Give your coding agent the Ankvale guides and skills so it can select suitable components, blocks and templates, follow your design choices, and use the documented APIs.

## Install the guides and skills

Open the website's [Developer tools](/tools) page to download the coding skill, design skill and agent guide bundle. Each skill includes its reference material.

1. Keep the agent guide bundle together in a project-local directory.
2. Add an Ankvale section to your project's `AGENTS.md`, creating the file if needed.
3. Point it to the guide entry point and your saved design manifest, if you have one.
4. Install the skills in the project location supported by your coding agent.

The forthcoming setup CLI will automate this process. For now, the downloadable bundles provide the same selection and design guidance for manual setup.

## Add project instructions

For a guide bundle stored at `vendor/ankvale-guides`, add:

```md
<!-- BEGIN ANKVALE -->
Use the Ankvale guide at ./vendor/ankvale-guides/AGENTS.md.
Read the selection guide and exact API before composing a screen.
Prefer a suitable template or block, then individual components.
Follow this project's design manifest and existing instructions.
Connect real data and services, and verify the complete user flow.
<!-- END ANKVALE -->
```

Change the path to match where you placed the bundle. Keep your existing instructions; Ankvale guidance supplements your project conventions.

## Give the agent a useful brief

Describe the screen, main user action, data, service integrations and important constraints. For example:

> Build a project workspace with a sidebar, overview, task board and team settings. Use Ankvale blocks where suitable, keep the default visual language, and connect task actions to our existing API. Include loading, empty and error states.

Your agent can then choose a composition, read its props, add the required items and connect the application behavior. The [selection guide](/guides/selection) maps common tasks to actual registry IDs.

## Share your design decisions

If you customize the system, include your theme or design manifest in the project and point to it from `AGENTS.md`. Record your colors, typography, density, motion preference, icon weight and intentional component variations so future screens remain consistent.

## Discovery resources

The website provides [agent instructions](/guides/agents), [design guidance](/guides/design), [motion guidance](/guides/motion), `/llms.txt`, `/llms-full.txt`, pattern recipes and component API JSON. Developer tools also includes setup information for the optional local read-only MCP server.

Use local guide bundles when your agent needs documentation without a website connection. Keep the guides and APIs aligned with the Ankvale version installed in your project.

## Review the result

Check the main user flow, service errors, keyboard and focus behavior, mobile layout and reduced motion. Templates begin with sample content and local UI behavior; connect and verify your own services before publishing. Retain the [required attribution](../legal/licensing.md) when an agent scaffolds application pages.
