# Ankvale UI: catalog comparison

**Historical audit snapshot:** C01–C38, E01–E21, B01–B34 and W01–W18 subsequently received public implementations; the machine audit records scope and specialist boundaries. See [current implementation contracts](../implementation/components.md). The rows below retain the original findings so the source of the backlog remains reviewable.

Audited 26 November 2026. This is a source and documentation audit, not a new browser or assistive-technology certification. Status refers to this checkout. “Missing” means no reusable public implementation was found; composing HTML manually does not count as a shipped component. “Partial” includes incomplete compositions or advanced capabilities. “Equivalent” means the role is served under another name or by native HTML/CSS. “Internal” means behavior is delegated to existing primitives. “Defer” is an intentional style/scope decision, not a recommendation to recreate every effect.

The named entries come from the official [Material UI catalog](https://mui.com/material-ui/all-components/), [daisyUI catalog](https://daisyui.com/components/), and [Ant Design catalog](https://ant.design/components/overview/). Navigation was checked as well as the body because new entries can appear in one before the other. These pages reported Material UI 9.6.0, daisyUI 5.8.3, and Ant Design 6.7.2 during the audit. The following Ankvale mappings and completion judgments are our own analysis.

MUI X and Ant Pro compositions are separated from core. MUI X includes free and commercial tiers and preview families; this report does not describe them all as free or stable. See [MUI X overview](https://mui.com/x/introduction/). Ant's overview links the six Pro compositions below; their client-rendered detailed pages were not readable through the research tool, so those rows are high-level composition comparisons, not a full Pro API audit.

## Material UI Core and Lab coverage

62 named entries reviewed. Covered means a comparable basic role exists; it does not certify identical variants, accessibility or enterprise depth.

| Catalog entry          | Assessment  | Ankvale evidence / equivalent                 | Remaining work                                                           |
| ---------------------- | ----------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| Autocomplete           | Partial     | combobox                                     | Async/free-text/virtualized recipes and integration tests                |
| Button                 | Covered     | button                                       | Release validation                                                       |
| Button Group           | Covered     | button-group                                 | Release validation                                                       |
| Checkbox               | Covered     | checkbox                                     | Release validation                                                       |
| Floating Action Button | Missing     | button can supply visual base                | Floating action composition                                              |
| Number Field           | Partial     | number-stepper                               | Locale-aware parsing and formatting; MUI documents a Base UI composition |
| Radio Group            | Covered     | radio-group                                  | Release validation                                                       |
| Rating                 | Covered     | rating                                       | Variant and accessibility validation                                     |
| Select                 | Covered     | select; native-select                        | Release validation                                                       |
| Slider                 | Covered     | slider                                       | Range recipe and validation                                              |
| Switch                 | Covered     | switch                                       | Release validation                                                       |
| Text Field             | Partial     | input; input-group; field; textarea          | Single consistent labeled/validated field API                            |
| Transfer List          | Missing     | none                                         | Dual-list transfer composition; MUI offers a composition example         |
| Toggle Button          | Covered     | toggle; toggle-group                         | Release validation                                                       |
| Avatar                 | Covered     | avatar                                       | Group overflow recipe                                                    |
| Badge                  | Partial     | badge; marker                                | Anchored count/dot badge with overflow semantics                         |
| Chip                   | Partial     | badge; combobox chips                        | Standalone interactive/removable chip                                    |
| Divider                | Covered     | separator                                    | Release validation                                                       |
| Icons                  | Partial     | Phosphor imports                             | Public icon convention and curated exports                               |
| Material Icons         | Alternative | Phosphor                                     | Keep one icon family; do not duplicate catalog                           |
| List                   | Covered     | item; list-view                              | Advanced list work tracked separately                                    |
| Table                  | Covered     | table; data-grid                             | Advanced grid work tracked separately                                    |
| Tooltip                | Covered     | tooltip                                      | Release validation                                                       |
| Typography             | Missing     | Tailwind classes                             | Semantic typography API and shared hierarchy                             |
| Alert                  | Covered     | alert                                        | Release validation                                                       |
| Backdrop               | Internal    | dialog/sheet/drawer overlays                 | Expose only if consumer use case needs it                                |
| Dialog                 | Covered     | dialog; alert-dialog                         | Release validation                                                       |
| Progress               | Partial     | progress; spinner; radial-chart              | Dedicated circular progress API                                          |
| Skeleton               | Covered     | skeleton                                     | Release validation                                                       |
| Snackbar               | Covered     | toast                                        | Release validation                                                       |
| Accordion              | Covered     | accordion; collapsible                       | Release validation                                                       |
| App Bar                | Covered     | app-layout toolbar; navigation blocks        | Shared header recipe                                                     |
| Card                   | Covered     | card; item-card; widget                      | Release validation                                                       |
| Paper                  | Equivalent  | card; semantic surface tokens                | Surface primitive can unify unframed surfaces                            |
| Bottom Navigation      | Missing     | none                                         | Mobile bottom navigation                                                 |
| Breadcrumbs            | Covered     | breadcrumb                                   | Release validation                                                       |
| Drawer                 | Covered     | drawer; sheet                                | Release validation                                                       |
| Link                   | Missing     | native anchors; framework Link               | Styled framework-neutral link                                            |
| Menu                   | Covered     | dropdown-menu; context-menu; navigation-menu | Release validation                                                       |
| Menubar                | Covered     | menubar                                      | Release validation                                                       |
| Pagination             | Covered     | pagination                                   | Release validation                                                       |
| Speed Dial             | Missing     | none                                         | Keyboard-accessible floating action menu                                 |
| Stepper                | Covered     | stepper                                      | Workflow integration belongs in blocks                                   |
| Tabs                   | Covered     | tabs; segment                                | Release validation                                                       |
| Box                    | Equivalent  | HTML plus classes                            | Optional shared layout primitive                                         |
| Container              | Missing     | repeated max-width classes                   | Public responsive container                                              |
| Grid                   | Missing     | repeated CSS grid classes                    | Public responsive layout grid                                            |
| Stack                  | Missing     | repeated flex/gap classes                    | Public stack/inline primitives                                           |
| Image List             | Missing     | none                                         | Responsive image collection                                              |
| Click-Away Listener    | Internal    | Base UI dismiss behavior                     | No need to duplicate primitive internals                                 |
| CSS Baseline           | Partial     | globals.css Tailwind preflight               | Explicit optional reset and scoped package styles                        |
| InitColorSchemeScript  | Partial     | web app next-themes provider                 | Package-level SSR-safe appearance integration                            |
| Modal                  | Internal    | dialog; Base UI                              | Use accessible dialog unless lower-level API is justified                |
| No SSR                 | Missing     | app-specific client boundaries               | Optional ClientOnly utility; no blanket SSR disabling                    |
| Popover                | Covered     | popover                                      | Release validation                                                       |
| Popper                 | Internal    | Base UI positioning                          | No need to duplicate primitive internals                                 |
| Portal                 | Internal    | Base UI portals                              | Optional public overlay/portal target contract                           |
| Textarea Autosize      | Partial     | textarea field-sizing-content                | Document browser baseline or add JS fallback                             |
| Transitions            | Partial     | motion; CSS; Web Animations                  | Presence/exit and shared layout/reorder motion                           |
| useMediaQuery          | Partial     | use-mobile                                   | General SSR-safe media/container utilities                               |
| Masonry                | Missing     | none                                         | Masonry layout preserving reading order                                  |
| Timeline               | Covered     | timeline                                     | Release validation                                                       |

## daisyUI coverage

68 named entries reviewed. Covered means a comparable basic role exists; it does not certify identical variants, accessibility or enterprise depth.

| Catalog entry      | Assessment | Ankvale evidence / equivalent                        | Remaining work                                                    |
| ------------------ | ---------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| Accordion          | Covered    | accordion                                           | Release validation                                                |
| Alert              | Covered    | alert                                               | Release validation                                                |
| Aura               | Defer      | none                                                | Decorative border light conflicts with default style              |
| Avatar             | Covered    | avatar                                              | Group recipe                                                      |
| Badge              | Covered    | badge                                               | Anchored indicators tracked separately                            |
| Breadcrumbs        | Covered    | breadcrumb                                          | Release validation                                                |
| Button             | Covered    | button                                              | Release validation                                                |
| Calendar           | Covered    | calendar; agenda                                    | Picker gaps tracked separately                                    |
| Card               | Covered    | card                                                | Release validation                                                |
| Carousel           | Covered    | carousel                                            | Release validation                                                |
| Chat bubble        | Covered    | bubble; message; chat-message                       | Release validation                                                |
| Checkbox           | Covered    | checkbox                                            | Release validation                                                |
| Collapse           | Covered    | collapsible                                         | Release validation                                                |
| Countdown          | Missing    | number-value is numeric interpolation               | Time-based countdown with pause and announcements                 |
| Diff               | Missing    | none                                                | Before/after comparison slider                                    |
| Divider            | Covered    | separator                                           | Release validation                                                |
| Dock               | Missing    | none                                                | Mobile bottom navigation                                          |
| Drawer sidebar     | Covered    | sidebar; app-layout; sheet                          | Release validation                                                |
| Dropdown           | Covered    | dropdown-menu                                       | Release validation                                                |
| FAB / Speed Dial   | Missing    | none                                                | Floating action and expandable menu                               |
| Fieldset           | Covered    | FieldSet; FieldLegend in field                      | Release validation                                                |
| File Input         | Covered    | Input type=file; drop-zone                          | Standard file-field recipe                                        |
| Filter             | Partial    | toggle-group; radio-button-group                    | Filter control with selection/reset contract                      |
| Footer             | Covered    | three footer blocks                                 | Release validation                                                |
| Hero               | Covered    | nine hero blocks                                    | Release validation                                                |
| Hover 3D Card      | Covered    | holo-card has pointer tilt and reduced-motion CSS   | Keep effect optional; no glass or gradients                       |
| Hover Gallery      | Missing    | carousel only                                       | Pointer, keyboard and touch product-preview gallery               |
| Indicator          | Partial    | marker; badge                                       | Anchored corner indicator                                         |
| Text Input         | Covered    | input                                               | Release validation                                                |
| Join (group items) | Partial    | button-group; input-group                           | Mixed-control attached group                                      |
| Kbd                | Covered    | kbd                                                 | Release validation                                                |
| Label              | Covered    | label; field                                        | Release validation                                                |
| Link               | Missing    | native anchors                                      | Styled link primitive                                             |
| List               | Covered    | item; list-view                                     | Advanced virtualization tracked separately                        |
| Loading            | Covered    | loader; spinner; chat-loader                        | Release validation                                                |
| Mask               | Defer      | aspect-ratio is not a mask                          | Optional static shape utility                                     |
| Megamenu           | Covered    | NavbarMega; navigation-menu                         | Release validation                                                |
| Menu               | Covered    | navigation-menu; dropdown-menu; sidebar             | Release validation                                                |
| Browser mockup     | Missing    | hero workspace has private window chrome            | Reusable browser frame                                            |
| Code mockup        | Covered    | code-block                                          | Optional editor-like frame                                        |
| Phone mockup       | Missing    | none                                                | Reusable phone frame                                              |
| Window mockup      | Missing    | private hero window chrome                          | Reusable window frame                                             |
| Modal              | Covered    | dialog; alert-dialog                                | Release validation                                                |
| Navbar             | Covered    | three navigation blocks                             | Release validation                                                |
| OTP                | Covered    | input-otp                                           | Release validation                                                |
| Pagination         | Covered    | pagination                                          | Release validation                                                |
| Progress           | Covered    | progress                                            | Release validation                                                |
| Radial progress    | Partial    | radial-chart                                        | Small accessible circular progress without chart engine           |
| Radio              | Covered    | radio-group                                         | Release validation                                                |
| Range slider       | Covered    | slider                                              | Release validation                                                |
| Rating             | Covered    | rating                                              | Release validation                                                |
| Select             | Covered    | select; native-select                               | Release validation                                                |
| Skeleton           | Covered    | skeleton                                            | Release validation                                                |
| Stack              | Missing    | classes only                                        | Layered card/media stack; distinct from flex Stack                |
| Stat               | Covered    | kpi; kpi-group; number-value; trend-chip            | Release validation                                                |
| Status             | Partial    | badge can display text; marker is a separator label | Dedicated status dot with text/semantic variants                  |
| Steps              | Covered    | stepper                                             | Release validation                                                |
| Swap               | Missing    | local conditional rendering                         | Accessible two-state content transition                           |
| Tabs               | Covered    | tabs; segment                                       | Release validation                                                |
| Table              | Covered    | table; data-grid                                    | Release validation                                                |
| Text Rotate        | Defer      | none                                                | Optional rotating copy with pause/reduced motion; no default loop |
| Textarea           | Covered    | textarea                                            | Release validation                                                |
| Theme Controller   | Partial    | web-only theme toggle                               | Package appearance provider/switch                                |
| Timeline           | Covered    | timeline                                            | Release validation                                                |
| Toast              | Covered    | toast                                               | Release validation                                                |
| Toggle             | Covered    | toggle; switch                                      | Release validation                                                |
| Tooltip            | Covered    | tooltip                                             | Release validation                                                |
| Validator          | Partial    | FieldError; aria-invalid                            | Shared validation/form integration                                |

## Ant Design coverage

73 named entries reviewed. Covered means a comparable basic role exists; it does not certify identical variants, accessibility or enterprise depth.

| Catalog entry     | Assessment | Ankvale evidence / equivalent              | Remaining work                                                          |
| ----------------- | ---------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| Button            | Covered    | button                                    | Release validation                                                      |
| FloatButton       | Missing    | none                                      | Floating action and back-to-top                                         |
| Icon              | Partial    | Phosphor imports                          | Curated public icon contract                                            |
| Typography        | Missing    | classes only                              | Semantic text, headings, truncation/copy/edit recipes                   |
| Divider           | Covered    | separator                                 | Release validation                                                      |
| Flex              | Equivalent | classes only                              | Optional layout primitive                                               |
| Grid              | Missing    | classes only                              | Responsive layout grid                                                  |
| Layout            | Covered    | app-layout; sidebar                       | Release validation                                                      |
| Masonry           | Missing    | none                                      | Masonry layout                                                          |
| Space             | Missing    | classes; button-group; input-group        | Shared spacing and mixed attached group                                 |
| Splitter          | Covered    | resizable                                 | Release validation                                                      |
| Anchor            | Partial    | floating-toc                              | Programmatic offsets/history/scroll-container behavior                  |
| Breadcrumb        | Covered    | breadcrumb                                | Release validation                                                      |
| Dropdown          | Covered    | dropdown-menu                             | Release validation                                                      |
| Menu              | Covered    | navigation-menu; sidebar                  | Release validation                                                      |
| Pagination        | Covered    | pagination                                | Release validation                                                      |
| Steps             | Covered    | stepper                                   | Release validation                                                      |
| Tabs              | Covered    | tabs                                      | Release validation                                                      |
| AutoComplete      | Partial    | combobox                                  | Free-text/async recipes; do not create redundant primitive              |
| Cascader          | Missing    | none                                      | Hierarchical path selection                                             |
| Checkbox          | Covered    | checkbox; checkbox-button-group           | Release validation                                                      |
| ColorPicker       | Partial    | cell-color-picker native color input      | Solid-color palette, alpha, formats and input validation                |
| DatePicker        | Partial    | calendar; Input type=date                 | Popover/date-field, ranges, presets, month/quarter/year                 |
| Form              | Missing    | field is presentation only                | Validation, field arrays, async submission and error focus              |
| Input             | Partial    | input; textarea; input-group; input-otp   | Password/search and consistent labeled field recipes                    |
| InputNumber       | Partial    | number-stepper                            | Localized numbers, currency/percentage formatting                       |
| Mentions          | Missing    | none                                      | Mention input with popup suggestions and keyboard support               |
| Radio             | Covered    | radio-group; radio-button-group           | Release validation                                                      |
| Rate              | Covered    | rating                                    | Release validation                                                      |
| Select            | Partial    | select; combobox includes chips           | Ready-to-use multi/tag/async selectors; validate inherited capabilities |
| Slider            | Covered    | slider                                    | Release validation                                                      |
| Switch            | Covered    | switch                                    | Release validation                                                      |
| TimePicker        | Missing    | Input type=time only                      | Styled time and time-range selection                                    |
| Transfer          | Missing    | none                                      | Dual-list selection                                                     |
| TreeSelect        | Missing    | file-tree is not a popup field            | Single/multi hierarchical selector                                      |
| Upload            | Partial    | drop-zone; attachment; progress           | Queue transport adapter, picture previews, paste/directory recipes      |
| Avatar            | Covered    | avatar                                    | Group overflow recipe                                                   |
| Badge             | Partial    | badge; marker                             | Anchored count/dot placement                                            |
| Calendar          | Covered    | calendar; agenda                          | Advanced scheduler features tracked separately                          |
| Card              | Covered    | card; widget                              | Release validation                                                      |
| Carousel          | Covered    | carousel                                  | Release validation                                                      |
| Collapse          | Covered    | accordion; collapsible                    | Release validation                                                      |
| Descriptions      | Missing    | handwritten label/value rows              | Responsive semantic description list                                    |
| Empty             | Covered    | empty                                     | Release validation                                                      |
| Image             | Missing    | native img only                           | Fallback/loading/preview/lightbox group                                 |
| List (deprecated) | Covered    | item; list-view                           | Use current collection API                                              |
| Listy             | Partial    | list-view; data-grid virtualizes tables   | Grouped virtual list, sticky headers, infinite loading and sorting      |
| Popover           | Covered    | popover                                   | Release validation                                                      |
| QRCode            | Missing    | none                                      | QR rendering/download and expired states                                |
| Segmented         | Covered    | segment; toggle-group                     | Release validation                                                      |
| Statistic         | Covered    | kpi; number-value; trend-chip             | Countdown is separate                                                   |
| Table             | Partial    | table; data-grid                          | Editing workflow, summaries, grouped headers and enterprise features    |
| Tag               | Partial    | badge; combobox chips                     | Standalone removable/checkable tag                                      |
| Timeline          | Covered    | timeline                                  | Release validation                                                      |
| Tooltip           | Covered    | tooltip                                   | Release validation                                                      |
| Tour              | Missing    | none                                      | Guided, focus-safe product tour                                         |
| Tree              | Partial    | file-tree                                 | Generic/checkable/async/editable/virtual tree                           |
| Alert             | Covered    | alert                                     | Release validation                                                      |
| Drawer            | Covered    | drawer; sheet                             | Release validation                                                      |
| Message           | Covered    | toast                                     | Ankvale message.tsx is a chat message, not this feedback API             |
| Modal             | Covered    | dialog; alert-dialog                      | Release validation                                                      |
| Notification      | Partial    | toast                                     | Persistent actionable notification API and inbox block                  |
| Popconfirm        | Missing    | popover plus alert-dialog pieces          | Anchored accessible confirmation                                        |
| Progress          | Partial    | progress; radial-chart                    | Dedicated circular/segmented progress                                   |
| Result            | Partial    | empty; NotFoundPage                       | Success/error/permission/result panel and pages                         |
| Skeleton          | Covered    | skeleton                                  | Release validation                                                      |
| Spin              | Covered    | spinner; loader                           | Release validation                                                      |
| Watermark         | Missing    | none                                      | Optional repeated watermark overlay                                     |
| Affix             | Missing    | ad hoc CSS sticky                         | Shared sticky/affix utility with container offsets                      |
| App               | Partial    | web app providers                         | Public provider for overlay/feedback context                            |
| BorderBeam        | Defer      | none                                      | Decorative animated border conflicts with default language              |
| ConfigProvider    | Missing    | design-system manifest plus web providers | Unified locale/direction/density/motion/theme/overlay defaults          |
| Util              | Internal   | hooks; cn; Base UI                        | Expose stable utilities only when useful                                |

## Ant Design Pro compositions coverage

6 named entries reviewed. Covered means a comparable basic role exists; it does not certify identical variants, accessibility or enterprise depth.

| Catalog entry    | Assessment | Ankvale evidence / equivalent            | Remaining work                                                      |
| ---------------- | ---------- | --------------------------------------- | ------------------------------------------------------------------- |
| ProLayout        | Partial    | app-layout                              | Workspace/account switchers, routes and permission UI recipes       |
| ProForm          | Missing    | field; questionnaire                    | Schema-informed field recipes and async form workflow               |
| ProTable         | Partial    | data-grid                               | Query/filter toolbar, saved views, server adapter, CRUD composition |
| ProDescriptions  | Missing    | none                                    | Editable record details                                             |
| ProList          | Partial    | list-view; item-card-group              | Query-driven list/card composition                                  |
| EditableProTable | Partial    | cell primitives; data-grid render cells | Coordinated editable-row state, validation and commit/cancel        |

## MUI X families coverage

6 named entries reviewed. Covered means a comparable basic role exists; it does not certify identical variants, accessibility or enterprise depth.

| Catalog entry         | Assessment | Ankvale evidence / equivalent  | Remaining work                                                           |
| --------------------- | ---------- | ----------------------------- | ------------------------------------------------------------------------ |
| Data Grid             | Partial    | data-grid                     | Enterprise depth; see enhancement backlog                                |
| Date and Time Pickers | Partial    | calendar                      | Complete typed date/time/range fields and picker compositions            |
| Charts                | Partial    | seven Recharts wrappers       | More chart families and shared interaction/export APIs                   |
| Tree View             | Partial    | file-tree                     | Generic tree, multi/check selection, editing, async data, virtualization |
| Scheduler (preview)   | Partial    | agenda                        | Recurrence/resources/timezones and complete booking/editor workflow      |
| Chat (preview)        | Covered    | chat components; ChatTemplate | Local UI coverage; no claim of preview API or backend parity             |

## Capability references used for partial assessments

- [MUI Autocomplete](https://mui.com/material-ui/react-autocomplete/): free text and suggested values.
- [MUI Number Field](https://mui.com/material-ui/react-number-field/) and [Transfer List](https://mui.com/material-ui/react-transfer-list/): documented compositions, not independent built-in parity requirements.
- [MUI Chip](https://mui.com/material-ui/react-chip/): interactive chip role differs from a passive badge.
- [MUI X grid features](https://mui.com/x/react-data-grid/features/): editing, analytical and server-side families; planned panels are not counted as delivered.
- [MUI X date/time pickers](https://mui.com/x/react-date-pickers/): typed date/time/range fields, validation and localization.
- [MUI X charts](https://mui.com/x/react-charts/): chart families and interaction infrastructure; Map is a preview and Future components is planned.
- [MUI X tree](https://mui.com/x/react-tree-view/): richer selection, editing and data management.
- [Ant Form](https://ant.design/components/form/), [DatePicker](https://ant.design/components/date-picker/), [Select](https://ant.design/components/select/), [ColorPicker](https://ant.design/components/color-picker/), [Upload](https://ant.design/components/upload/), [Table](https://ant.design/components/table/), [Listy](https://ant.design/components/listy/), [Tour](https://ant.design/components/tour/), [ConfigProvider](https://ant.design/components/config-provider/).
- [daisyUI Diff](https://daisyui.com/components/diff/): image/content comparison rather than a source-code diff editor.

## Boundaries

This comparison covers every named component in the reviewed core catalogs and the explicitly listed adjacent families. It does not audit every prop, every demo variant, commercial template source, every AntV visualization, Ant Design Mobile/Mini/Web3/X, or MUI Toolpad. The implementation backlog is a deduplicated recommendation for Ankvale, not a promise of behavioral parity with every ecosystem. Native components remain a separate product: a native time picker does not fill a web time picker gap.
