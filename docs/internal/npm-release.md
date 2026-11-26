# Standalone npm release

Prepared 27 November 2026. Status: unpublished release candidate, version 0.1.0.

## Package boundaries

| Package | Contents |
| --- | --- |
| `@ankvalelabs/ui` | Compiled ESM and declarations, components, blocks, templates, provider, animation helpers, Phosphor icon entries, scoped precompiled CSS, optional reset, MapLibre worker, versioned API/design context, license and third-party notices; bundled Next.js setup CLI |


The package has an `ankvale` bin pointing to `cli/index.mjs`. The CLI reads the same context and assets as the runtime package, avoiding duplicated guide/asset copies. Its Node entry and TypeScript dependency are separate from browser imports; consumer checks verify that the CLI/parser are absent from the Vite browser chunks. `packages/cli` remains a private implementation workspace, not a separately published product.

The website, hosted documentation application, playground, native source package and design-system authoring package are excluded. Workspace aliases remain private source-authoring names; staged imports are rewritten to the public package. The runtime has React/React DOM 19 peers and ESM exports. Node 22.13 or newer is required. Vite supports manual runtime installation; automatic setup currently supports Next.js App Router only.

Styles are compiled during packaging, so consumers do not need shadcn or a Tailwind build. Selectors are scoped to `AnkvaleProvider`; default semantic variables remain global. `reset.css` is a separate, optional global reset. Custom class names need the consuming application's own CSS; packaging cannot generate styles for arbitrary future utility classes. The stylesheet currently favors complete catalog coverage over minimum size.

## Build and verify

```sh
npm ci
npm run audit:dependencies
npm run release:build
npm run release:pack
npm run test:release
```

Only `.release` is reset by the build. It is ignored by Git. Review `.release/report.json`, `pack-report.json`, `verification.json`, the staged manifest and README and tarball file lists. `builtFrom` records HEAD and `workingTreeDirty` identifies uncommitted inputs; a dirty candidate is not reproducible solely from that commit. Rebuild from the final release commit before publication.

The consumer test installs real tarballs outside this monorepo, exercises the npm install path, dry runs, preservation of existing AGENTS.md and layout markup, repeat initialization, both skill adapters, managed-file conflicts, template route safeguards and doctor. It builds clean Next.js and Vite applications, and checks every catalog import/export against packed declarations. Fixtures remain in the reported temporary directory for browser verification. Production Next.js browser checks verified blue controls, calendar, modal portal and animation; Vite checks verified that an outside host button retains its native styling.

## Customer commands after publication

```sh
npx @ankvalelabs/ui@0.1.0 init --agent both
npx @ankvalelabs/ui@0.1.0 doctor
npx @ankvalelabs/ui@0.1.0 add dashboard --path app/dashboard/page.tsx
```

Use `--cwd` for the actual Next.js application in a monorepo. `--dry-run` performs no installation or file writes. `--no-install` skips npm installation. `--agent none` skips adding skill adapters; it does not remove existing skills. Skills are project-local, never global. Initialization appends a managed AGENTS section and wraps the existing layout body; it does not replace routes. It also adds the required visible attribution footer. Edited managed files produce conflicts rather than being overwritten. Commit the application before setup and review the resulting diff.

For manual React setup, install the runtime and compatible React peers, import `@ankvalelabs/ui/styles.css` once, and wrap the application in `AnkvaleProvider`. Use `context/catalog.json` and its API records for actual imports. Manual map setup also requires copying the supplied worker into `public/ankvale-assets` or supplying a hosted worker URL. Product services, authentication, data persistence and map tile terms remain the application's responsibility.

## Remaining release gates

- Review the actual artifacts against [licensing findings](licensing-audit.md), including copied worker notices and missing upstream notice findings applicable to shipped materials. The retained repository-wide notices are evidence, not a compliance certification or artifact-specific SBOM. The packages do not bundle native components or font binaries.
- Confirm the maintainer's npm account can publish in `@ankvalelabs`. Authenticate interactively without putting credentials in repository files. Initial publication remains a separate owner decision.
- Commit release tooling and evidence, rebuild, rerun consumer verification and inspect the exact tarballs that will be published.
- Publish the single reviewed `@ankvalelabs/ui` tarball with public access. Verify registry versions and integrity, then test the real registry command in a fresh Next.js project.
- Update customer installation documentation from the existing registry instructions only after the scoped packages are publicly available. Keep publication status and README roadmap current.

Do not run `npm publish` from the repository root or private source workspaces. Publish only reviewed staged tarballs. Never claim npm installation works publicly before registry verification.
