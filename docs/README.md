# Ankvale documentation

## User guides

The user guides are published at `/docs` and included in the downloadable reference bundle.

- [Overview](handbook/overview.md)
- [Installation](handbook/getting-started.md)
- [Supported technologies](handbook/platforms.md)
- [Building apps and websites](handbook/building-apps.md)
- [Customization](handbook/customization.md)
- [Motion, icons and graphics](handbook/motion-assets.md)
- [Coding agents](handbook/agents.md)
- [Accessibility and security](handbook/quality.md)
- [Dependency versions](handbook/dependencies.md)
- [Credits](legal/credits.md)
- [License and required attribution](legal/licensing.md)

## Maintainer records

[Internal documentation](internal/README.md) contains repository architecture, release procedures, the documentation backlog, licensing audits and dependency/asset provenance. These records remain in the repository and are not published in customer documentation downloads.

## Publishing

`npm run docs:build` publishes only the files allowlisted by the documentation catalog and its public resources. It rejects links to unpublished documents. `npm run registry:build` also builds this output and includes both Ankvale's license and the required upstream source notice in installable registry items.
