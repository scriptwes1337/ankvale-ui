# Maintainer documentation

These records support Ankvale Labs and project contributors. They are kept in the repository and are excluded from the customer website's documentation pages, raw downloads and reference bundle.

- [Architecture, repository setup and release workflow](architecture.md)
- [Full documentation backlog](documentation-roadmap.md)
- [Licensing audit and unresolved distribution findings](licensing-audit.md)
- [Dependency versions, first repository records and declaring workspaces](../legal/dependencies.md)
- [Transitive dependency inventory](../legal/dependency-inventory.json) and [CSV](../legal/dependency-inventory.csv)
- [Asset/source provenance and hashes](asset-provenance.md)
- [Planned CLI contract](../implementation/cli-setup.md)
- [Standalone npm candidates and release verification](npm-release.md)
- [Coolify website deployment](coolify-deployment.md)
- [Authoring/server administration](../tooling/README.md)

## Develop Ankvale

Use a Node release satisfying `^22.13.0 || ^24.3.0 || >=26.0.0` and the root npm toolchain. Run `npm ci`, then `npm run dev`. For an explicit web port use `npm run dev --workspace=web -- --port 3001`.

Edit source, then run `npm run registry:build` to refresh registries, API docs, skills and public documentation. Use `npm run audit:dependencies` after dependency or license-metadata changes, review the findings, and regenerate docs. The website publisher uses an explicit allowlist and removes stale generated documents.

Ankvale's own license is now defined in the root LICENSE. Third-party release reviews remain open; moving those records off customer pages does not resolve or erase them. Actual historical first-install dates remain unknown and are not replaced with Git timestamps.
