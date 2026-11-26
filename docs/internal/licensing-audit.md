# Maintainer licensing audit

Last reviewed: 27 November 2026. Scope: this repository's current manifests/lockfile, installed npm package artifacts on the audit machine, retained upstream notices and selected official license texts. This is an evidence-backed project status record, not a certification that every possible distribution is compliant.

## Current statement

Ankvale preserves third-party copyrights and licenses and does not claim ownership of upstream software. The project has collected available license/notice texts, recorded dependency versions/provenance, included the shadcn MIT notice in source-registry installs, and retained Phosphor attribution for generated previews and MapLibre licensing in its worker asset.

**Complete release compliance is not yet established.** Missing package notices, platform-specific artifacts, font binary revisions, bundled native libraries and final distribution terms still require review. A blanket “fully compliant” statement would not be supported by the current evidence. Public package release must resolve the obligations applicable to the actual artifacts being distributed.

## Ankvale's own terms

Ankvale Labs adopted the custom Ankvale Attribution License 1.0 on 27 November 2026. It grants personal/commercial use, modification and redistribution of original Ankvale work, requires the exact visible credit “Built with Ankvale UI by Ankvale Labs” in every app/website using it, and requires retaining the full license. Public docs must describe this custom license without calling it MIT or OSI-approved.

Root and workspace metadata reference the included LICENSE file. The private workspace flag remains a publication setting, not a license restriction. Original source notices travel with registry items and downloadable guides. Upstream licenses remain independent and unchanged.

## Evidence retained

The generated [dependency inventory](../legal/dependency-inventory.json) covers 1,315 locked package instances and 980 unique package names. There are 68 directly declared third-party package names across application, runtime, native and development workspaces. The audit inspected 1,235 installed instances and collected 1,361 license/notice files, deduplicated into 498 exact texts.

- [Direct dependency register](../legal/dependencies.md): locked versions, licenses, declaring workspaces and first available repository dates.
- [Machine-readable JSON](../legal/dependency-inventory.json): lockfile hash, declared ranges, installed versions, integrity fields, source URLs where available, notice hashes and review findings.
- [CSV inventory](../legal/dependency-inventory.csv): transitive package/version/location records for review.
- [Retained third-party texts](../legal/THIRD_PARTY_NOTICES.txt): full available license/notice contents and originating file paths.
- [shadcn source license](../legal/upstream/shadcn-ui-LICENSE.md): copied verbatim from installed shadcn 4.23.1.
- [Inter font license](../legal/upstream/Inter-OFL.txt) and [Geist Mono font license](../legal/upstream/GeistMono-OFL.txt): upstream family license snapshots.

Counts are a dated snapshot. Regenerate and review evidence after dependency changes. The inventory includes development dependencies and platform variants; it is not an artifact-level SBOM and does not prove that every listed package is shipped to customers.

## First-install dates and versions

npm lockfiles record resolved versions, not first-install timestamps. The actual first installation date was not recorded for these dependencies and is therefore **unknown**. Filesystem creation/modification timestamps and npm publication dates are not used as substitutes.

The register reports the first available Git record of a package name and, separately in JSON, the first record of its currently resolved version. An unavailable date means it does not occur in the inspected committed history. An uncommitted addition may already be installed even though no historical Git date exists. Commit evidence is not a reconstruction of installation events.

For future changes, record the installation/update event, UTC timestamp, package name, requested range, exact version, integrity, author/change reference and reason. Preserve previous history rather than resetting a “first installed” field on upgrade.

## Obligations by license family

These summaries guide the release process; the actual upstream license text and distribution facts control.

| License family | Required review and handling |
| --- | --- |
| MIT, ISC, BSD and similar permissive licenses | Retain the applicable copyright, license and disclaimer notices in source/bundled distributions; follow package-specific conditions and endorsement restrictions |
| Apache-2.0 | Retain the license, applicable notices and attribution; carry upstream NOTICE material where required and identify modifications as required |
| Dual-license expressions | Record which permitted option is used; do not treat `OR` as requiring both or `AND` as allowing either |
| MPL-2.0 | Review covered-file source availability and notices when distributing relevant executable/source artifacts; unrelated files do not automatically become MPL-covered |
| LGPL-3.0-or-later and combined expressions | Review native/binary components, applicable source availability, combined-work/relinking and installation-information requirements before redistributing an artifact |
| CC-BY-4.0 | Retain appropriate creator credit, license link and modification information for redistributed material; do not imply endorsement |
| SIL OFL-1.1 fonts | Retain copyright/license information and respect font-specific reserved names and redistribution conditions; do not assume the UI package license covers fonts |
| Data, map tiles, logos, photos and external media | Inspect the asset/service terms independently of the renderer's npm license |

Official references: [MIT](https://opensource.org/license/mit), [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.html), [Mozilla MPL guidance](https://www.mozilla.org/en-US/MPL/2.0/FAQ/), [GNU LGPLv3](https://www.gnu.org/licenses/lgpl-3.0-standalone.html), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), and [SIL OFL](https://openfontlicense.org/).

## Open findings before release

1. **55 installed instances have no standalone notice file in the inspected package tree.** Some retain license references in README or source headers. This requires locating and retaining the correct upstream text, not assuming that package metadata alone satisfies notice obligations. Exact instances appear in the JSON inventory's review fields.
2. **80 locked instances are absent on this audit platform.** Many are optional platform binaries. Their actual archives and embedded components must be reviewed if shipped for other platforms; this audit does not inspect their contents.
3. **Sharp/libvips native components need artifact-specific review.** The installed `@img/sharp-libvips-darwin-arm64` README lists multiple embedded libraries and additional licenses beyond its top-level LGPL identifier, including MPL 1.1 and other terms. npm package metadata is not a complete inventory of that binary. The website uses unoptimized brand images, but Next's dependency tree still includes image-processing packages; do not infer their absence from an npm/server artifact without inspecting it.
4. **MPL tooling and CC-BY data are in the lockfile.** Determine whether relevant code/data is redistributed in each browser, server, CLI, native or npm artifact and preserve corresponding obligations. They are not automatically frontend-runtime dependencies simply because they are installed in this repository.
5. **Compiled/vendored dependencies require review.** The scan retains discovered nested notice files, including available Next compiled notices, but is not a source-level or binary-level audit of every embedded dependency.
6. **Copied source provenance is incomplete.** The installed shadcn CLI version is recorded, but the exact original registry revision for every historical adapted component is not reconstructable from available history. Preserve known MIT terms and establish a source/change ledger for future imports.
7. **Font binary versions are not pinned in a dedicated asset manifest.** Upstream Inter/Geist Mono family licenses are retained, but `next/font` downloads do not establish exact font revisions in this register. Capture deployed font hashes/revisions and verify the notices against those files.
8. **Review the custom attribution license and final package contents before release.** The owner selected visible attribution; verify metadata, copied notices and compatibility for actual packed artifacts. Do not describe this audit as legal sign-off.

## Distribution practice

Keep legal files with the materials they cover. Registry installs now carry `LICENSES/ankvale-ui-LICENSE.txt` and `LICENSES/ankvale-shadcn-ui-LICENSE.md`; consumers must preserve that upstream notice when redistributing the adapted source. Phosphor preview sprites retain their MIT license alongside the site assets. The MapLibre worker includes upstream license text. Future compiled packages, downloadable templates and native distributions must carry the notices and any source-availability mechanism applicable to their actual contents.

A credits page is helpful attribution, but it does not replace full required notices, bundled license texts or source obligations. Updating dependencies, minifying code, copying templates or changing package boundaries does not erase upstream terms.

## Refresh and release evidence

Run `npm run audit:dependencies` after a reproducible install. Review the JSON `review` fields, compare the lockfile hash, preserve supplemental notices and resolve relevant open findings. Then inspect actual `npm pack` outputs and deployment/native artifacts. Record scope, versions, reviewer, date and remaining limitations with the release. The planned standalone license gate must run on actual packed artifacts, not merely this repository-wide inventory.
