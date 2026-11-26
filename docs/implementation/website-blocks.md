# Marketing and content blocks

Initial W01–W18 implementation, 26 November 2026. There are 33 public variants across 13 substantive `site-*` modules. `site-shared.tsx` contains helpers and is not an additional block variant. Definitions are in `apps/web/lib/site-block-definitions.json`; independently extractable examples are in `apps/web/components/site-block-previews.tsx`.

## Coverage

| Backlog                   | Public variants                                          | Source module      |
| ------------------------- | -------------------------------------------------------- | ------------------ |
| W01 Contact               | ContactSection                                           | site-contact       |
| W02 Company story         | AboutStory                                               | site-company       |
| W03 Team                  | TeamGrid, TeamProfile                                    | site-company       |
| W04 Careers               | CareersList, JobDetail, JobApplication                   | site-careers       |
| W05 Blog/editorial        | BlogIndex, ArticleLayout                                 | site-editorial     |
| W06 Case studies          | CaseStudyIndex, CaseStudyStory                           | site-editorial     |
| W07 How it works          | HowItWorks                                               | site-product       |
| W08 Integrations          | IntegrationDirectory, IntegrationDetail                  | site-product       |
| W09 Comparison/migration  | ProductComparison                                        | site-product       |
| W10 Updates/roadmap       | ReleaseFeed, Roadmap                                     | site-product       |
| W11 Documentation         | DocumentationShell                                       | site-documentation |
| W12 Media/video           | MediaGallery, VideoShowcase                              | site-media         |
| W13 Downloads             | DownloadSection                                          | site-download      |
| W14 Events/webinars       | EventIndex, EventDetail, EventRegistration               | site-events        |
| W15 Evidence              | EvidenceMetrics                                          | site-evidence      |
| W16 Announcements         | AnnouncementBar, ReleaseHighlights                       | site-announcement  |
| W17 Legal/privacy         | PolicyLayout, ConsentPreferences                         | site-legal         |
| W18 Complete compositions | ProductSite, BusinessSite, PublicationSite, CommerceSite | site-starters      |

## Composition and styling

Blocks use Ankvale's semantic background/card/border/text/primary tokens, whitespace, thin rules and clear headings. They do not add glass, gradients, decorative glow, stock photography dependencies, fake testimonials, or invented customer metrics. Blocks use one existing BlockSection/Motion entrance per section. Hover/focus/selection feedback remains short and reduced-motion behavior follows the installed Ankvale stylesheet and Motion wrapper. Navigation and announcement bars remain stable.

Section content generally starts at h2. Complete site compositions default to an h1 hero; pass `hero.headingLevel="h2"` when embedding them in an existing gallery/page with its own h1. Complete compositions deliberately do not add another main landmark: the route owns the page landmark. Supply real brand/navigation/footer data and destinations. W18 provides assembled product, service-business, publication and small commerce homepages; it does not implement commerce checkout services.

Use semantic headings inside article, policy, job, event and integration content. Provide stable unique IDs for records and article heading anchors. Each source module exports its data types. The supplied primitives remain customizable through SectionProps/className and explicit content/action slots rather than a second style preset.

## Interaction and service contracts

- **ContactSection** validates name, email, department and message with native controls. `onSend(ContactMessage)` is required and must resolve only when the application's operation succeeds. Department IDs are provided to that callback. Supply at least one department. Pending submissions disable controls; a mutex rejects duplicate submits. Rejection preserves entered values and announces a retry message. Success does not erase the submitted text.
- **JobApplication** provides name/email, optional portfolio URL/PDF resume and required cover letter. `onApply(JobApplicationData)` receives the actual File when supplied. The callback owns file/content validation beyond the browser accept hint, upload, transport, persistence and service-side validation. The library does not silently upload a file.
- **EventRegistration** validates required fields and awaits `onRegister`. Application/registration errors preserve input; feedback clears when a user edits after an operation.
- **Collection blocks** expose meaningful local search/category filters and empty states. CareersList, BlogIndex, CaseStudyIndex, IntegrationDirectory, ReleaseFeed and EventIndex accept `loading`, `error` and `onRetry`. Existing records may remain visible during refresh/failure; status is explicit and an initial load does not also show a false empty result. Domain fetching, paging and remote query persistence remain the consuming application's responsibility.
- **HowItWorks** changes the active process diagram/visual through keyboard-native buttons with pressed state and a polite content region. It does not auto-advance.
- **Roadmap** is read-only unless `onVote` is supplied. Its cards await the callback and report failure; `items` remains authoritative for vote counts/pressed state. The preview mutates only its own fixture data. No hidden public voting service is implied.
- **DocumentationShell** supports local page navigation/search and controlled/uncontrolled page and version values. Pages may be scoped to a version; the selected version chooses the matching body and navigation. The owner supplies route integration, version data, an API renderer or richer search backend when needed.
- **MediaGallery** uses ImageList's keyboard-accessible lightbox, gallery navigation and zoom. **VideoShowcase** opens an accessible Dialog with native playback controls, an optional caption track and transcript; it never autoplays. Supply captions/transcripts for actual media. The preview's silent two-second shape study is locally generated H.264 in an embedded data URL, with a matching description; it does not request an external video or stock asset.
- **DownloadSection** uses explicit download links, versions, requirements, filenames and release-note links. The preview downloads a real plain-text project note. Supply your actual platform binaries and signed-store links in an application.
- **EvidenceMetrics** reuses Kpi and takes caller-owned values and source labels/links. Example figures are clearly labeled fixture data, not business claims or endorsements.
- **AnnouncementBar** supports dismissal and controlled/uncontrolled visibility. The owner decides whether/how dismissal is persisted. **ReleaseHighlights** accepts real destinations and visual slots.
- **PolicyLayout** formats supplied policy content with a table of contents. It does not generate a reviewed legal policy. **ConsentPreferences** makes required categories non-editable, normalizes them to true on save, supports reject-optional, and awaits `onSave`. The owner persists the decision and actually gates optional services/cookies; no consent-management service is built into the block.

## Preview integrity

Profiles, roles, posts, stories, integrations, events and metrics in the examples are fixtures. Their links point to relevant demo blocks or existing library destinations. The embedded artwork and video are original code-generated preview assets. They are not downloaded personal photos, real customer endorsements or proof of external service connections. Form/registration demos explicitly keep their data in preview state.

## Checks

`node scripts/test-tooling.mjs tests/site-blocks.test.tsx` covers all 33 server renders and definition/source/preview alignment; contact native validity, routed payload, duplicate-submit guard and rejected submission/value retention; application/registration callback payloads; careers/blog/integration/event/release filters; process selection; docs navigation/version; roadmap callback; required consent/reject-optional; announcement dismissal; gallery navigation and video dialog/local asset.

The UI and web TypeScript checks pass for these additions. The repository ESLint configuration now covers TSX. Focused lint passes for all site block modules and the preview module after replacing a local navigation anchor with Next Link. Shared registry regeneration, generated usage examples, consuming-project checks, production build and browser/assistive-technology review are coordinated by the parent after integration. These initial implementations do not certify every responsive, locale or assistive-technology combination.
