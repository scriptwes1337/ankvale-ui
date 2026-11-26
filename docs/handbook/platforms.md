# Supported technologies

Ankvale's web components use React and TypeScript. A separate React Native package provides native components with its own theme and APIs.

## Framework baseline

| Technology | Current baseline | Usage |
| --- | --- | --- |
| React and React DOM | 19.3.1 | Web components and rendering |
| Next.js | 16.4.6, App Router | The documentation website and Next.js examples |
| TypeScript | 5.x | Typed source and API definitions |
| Tailwind CSS | 4.x | Styles for source-registry installations |
| shadcn | Source-registry workflow | Installing editable components and their dependencies |
| React Native | Peer range `^0.88.0`, with React `^19.3.0` | Separate native component package |

These versions describe the current development baseline. Vite and other React bundlers are targets for the forthcoming standalone package. A released compatibility matrix for that package is not available yet.

## Feature technologies

| Feature | Foundation |
| --- | --- |
| Accessible web interactions | Base UI |
| Icons | Phosphor Icons |
| Animations | CSS and Motion for React |
| Forms and validation | React Hook Form and Zod |
| Tables and virtualization | TanStack Table and Virtual |
| Web charts | Recharts |
| Rich text | Tiptap |
| Dates and scheduling | React DayPicker, date-fns and React Big Calendar |
| Maps | MapLibre GL |
| Markdown and code highlighting | Streamdown and Shiki |
| Native SVG and phone inputs | react-native-svg and libphonenumber-js |

See [dependency versions and licenses](dependencies.md) for exact package versions.

## Next.js and server rendering

Keep data fetching and secrets on the server. Add client boundaries around interactive components and pass serializable data across those boundaries. Connect event handlers and service calls in the appropriate client or server integration for your application.

Ankvale UI does not require you to use the Ankvale website's routes, authoring tools or server configuration in your own project.

## Native components

The native package uses React Native/Metro and a separate provider from `@ankvale/native-ui/theme`. Web blocks are not interchangeable with native components. Browser-based native previews help you explore the APIs; test gestures, accessibility, keyboard behavior and animations on your target iOS and Android devices before release.

Native date/time controls use their documented local-date and wall-clock formats. Apply any required time-zone conversion in your application. Expo SDK compatibility is not currently documented.

## Browsers

Use current evergreen browsers and test the features your application needs. Maps require WebGL support, and individual widgets may use browser APIs with additional requirements. Check Safari, Firefox and Chromium-based browsers against your application's support policy, including keyboard navigation, zoom and reduced motion.

## Backend services

You can use your preferred authentication, database, payment, email and hosting services. Ankvale supplies frontend interfaces and callbacks; you provide the service implementations, server validation and authorization. Collaboration, map tiles and external media can require separate service configuration or subscriptions.
