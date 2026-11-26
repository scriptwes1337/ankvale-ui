# Architecture and maintenance

The repository is an npm-workspace/Turborepo monorepo. Shared UI code and the customer-facing website live together for development, but have different distribution responsibilities.

## Repository map

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js marketing site, documentation, playgrounds, examples and optional authoring tools |
| `packages/ui` | Web components, blocks, templates, hooks and source styles |
| `packages/native-ui` | Separate React Native components and theme adapter |
| `packages/design-system` | Design manifest validation, tokens and exports |
| `packages/eslint-config`, `packages/typescript-config` | Internal development configuration |
| `docs/handbook` | Product and customer implementation documentation |
| `docs/agents`, `skills` | Agent workflows, selection recipes and self-contained skills |
| `docs/legal` | License policy, dependency provenance, retained notices and review evidence |
| `scripts` | Registry/API/preview generation, audits and verification tooling |
| `mcp` | Read-only local discovery server |
| `tests` | Focused interaction, consumer-install, catalog and tooling checks |

## Current source distribution

`npm run registry:build` derives source items, dependency closures, styles and API documentation. Generated public registry files are build output. Edit source and generators rather than hand-editing generated JSON or preview modules.

Each selected registry item must include its local import closure and required upstream source notices. The generator includes Ankvale’s own attribution license as `LICENSES/ankvale-ui-LICENSE.txt` and the preserved shadcn MIT notice as `LICENSES/ankvale-shadcn-ui-LICENSE.md`. The MapLibre worker already carries its upstream license text. npm-installed dependencies retain their own package notices; a future compiled redistribution must also retain the notices applicable to bundled code and assets.

## Planned package boundary

The root and website remain non-publishable application workspaces. Dedicated runtime and CLI artifacts should use explicit file allowlists. Runtime code must not import from `apps/web`, and customer installation must not require cloning this repository or installing the website's server dependencies.

The runtime will supply compiled JavaScript, types, CSS and per-feature imports. Customer-selected screens can be scaffolded into the application. Local docs, catalogs and agent skills accompany the installed version. Website-only artwork, hosted docs routes, galleries, repository audits and development tools stay outside the customer runtime. See the [CLI setup contract](../implementation/cli-setup.md).

Package subpaths can help browser code splitting but do not eliminate the installation cost of dependencies declared in a single package. Separate heavy editor/map/native features when their real distribution weight warrants it. Confirm decisions using packed artifacts and a consuming application, not a monorepo-only build.

## Verification commands

```sh
npm run registry:build
npm run typecheck
npm run test:api
npm run test:registry
npm run test:agent-guides
npm run test:playground
npm run test:website
npm run build --workspace=web
npm run lint
```

Use the relevant focused `test:*` scripts for a changed feature. Existing tests cover local behavior and contracts; browser checks remain necessary for actual geometry, pointer interaction and animation. A physical device check is separate from React Native Web.

Baseline lint warnings exist in parts of the repository. Report warnings and limitations honestly; a zero exit code under warning-only configuration is not a clean lint result. The [verification record](../implementation/verification.md) documents earlier checks, not a perpetual guarantee for later changes.

## Documentation and legal evidence generation

`npm run audit:dependencies` reads manifests, the current lockfile, installed package artifacts and available committed lockfile history. It regenerates version/provenance records and retained notices; it does not certify compliance or contact a registry. Inspect the generated review findings before release. Do not add machine filesystem timestamps as first-install dates.

`npm run docs:build` publishes the customer documentation and downloadable reference bundle from repository Markdown. Normal web prebuild/predev generation also builds this output. Update source documents before regenerating.

## Release responsibilities

Pin a release identifier, regenerate APIs/docs/notices, run relevant checks, inspect `npm pack` contents and validate a clean consuming project outside the monorepo. Confirm dependency and source licenses for the actual browser/server/npm/native artifacts. Preserve the Ankvale Attribution License and required visible credit in distributions, and review third-party compatibility for the final artifacts. Keep the README roadmap and documentation status synchronized.

Use versioned migrations for breaking API/token/CLI changes. Review updates to third-party packages and inherited notices together. Keep existing project customizations intact when refreshing scaffolded code or agent instructions.
