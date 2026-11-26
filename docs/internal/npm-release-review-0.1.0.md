# npm 0.1.0 artifact review

Reviewed 27 November 2026 for the unified @ankvalelabs/ui package. This records the distribution reviewed, not legal certification or clearance of every repository-wide finding.

- Source commit: df9db4e3d28d414d703e8349d3aab186178a20ff; clean working tree at packaging: true.
- Tarball: ankvalelabs-ui-0.1.0.tgz; 700 files; 807491 compressed bytes.
- npm integrity: `sha512-h6ZismoNMRTwqJN59MHoJ+wK8VIB/8cFeahK3QXWCeFxwgNKavT6Tfce7ci+A69NpR8T/ql76Y1wp77a+dLZfg==`.
- Tarball SHA-256: `f93e88ff62824bd0fae6828a35a2918713087a47906920484a9def7286108666`.
- MapLibre worker SHA-256: `a2621042e70401ef14af02e41d0a6bc391da8a80cdd7bfe6f6e5430b2f8fefa4`.

The packed file list contains compiled Ankvale ESM/declarations, CSS, CLI, local context, one bundled MapLibre worker, README and license/notice texts. It contains no node_modules, native binaries, font binaries, website application, native package or authoring application. The 30 direct runtime dependencies declare MIT, Apache-2.0 or BSD-3-Clause in their installed manifests; dependencies are referenced through npm rather than embedded as node_modules.

The original Ankvale LICENSE is retained byte for byte and its custom attribution terms are declared by package metadata. Full retained third-party notices include the known shadcn MIT source terms, Tailwind, tw-animate-css, MapLibre and TypeScript texts. The MapLibre worker retains its upstream license header; its bundled imports were resolved and it has no external module imports. Product map tiles and services remain consumer-owned and are not included.

Repository findings for native binaries, Next compiled server dependencies and downloaded fonts do not describe materials inside this npm tarball. Missing notices in separately installed upstream packages and incomplete historical source provenance remain documented in [the broader audit](licensing-audit.md); this review does not erase them. Future changes to dependencies or copied assets require a new artifact review.

Release validation passed real tarball installation, Next.js and Vite production builds, npx CLI discovery/setup/doctor, existing instruction preservation, managed-file conflict protection, explicit template scaffolding, browser/CLI separation and all 307 catalog import/export entries.

Publication: the registry serves @ankvalelabs/ui@0.1.0 with the exact npm integrity recorded above. The first CLI submission completed before the operational version became visible; during processing the registry briefly exposed its 0.0.0-stage placeholder. A repeat submission was rejected as an already published version and did not replace the artifact.

Public registry verification passed: downloaded tarball bytes match the recorded SHA-512 integrity; `latest` resolves to 0.1.0. A fresh Next.js project initialized through the published npx CLI with both agent adapters, installed the exact registry package, and passed doctor. The registry temporarily returned 404 for the tarball while publication propagated; public installation was verified before website rollout.
