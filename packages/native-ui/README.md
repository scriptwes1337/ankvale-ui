# Ankvale Native

Original React Native components using Ankvale's white, neutral, and Bootstrap-blue design tokens. See `/native` in the web app for browser previews and `/docs/native/<component>` for signatures and types.

Use within this monorepo through `@ankvale/native-ui/components/<name>` and wrap the application in `AnkvaleProvider` from `@ankvale/native-ui/theme`. It follows the system appearance by default; pass `mode="light"` or `mode="dark"` to override.

```tsx
import { AnkvaleProvider } from '@ankvale/native-ui/theme'
import { NumberStepper } from '@ankvale/native-ui/components/number-stepper'

export function App() {
  return <AnkvaleProvider><NumberStepper defaultValue={1} min={0} max={10} /></AnkvaleProvider>
}
```

To distribute a local source package, run `npm pack --workspace @ankvale/native-ui` from the repository root, then install the resulting tarball in a React Native project. Peer requirements are React 19.3 and React Native 0.88; react-native-svg is a runtime dependency. Rebuild native projects after adding native dependencies. The package exports TypeScript source for Metro/bundlers to compile; it is not published to npm. It type-checks without browser DOM types.

The package includes 53 catalog families plus Button and theme helpers. Charts use SVG and React Native responder gestures; they do not have HeroUI's Skia UI-thread animation engine. Calendars use local Gregorian date keys (`YYYY-MM-DD`), and date-times use local wall-clock strings (`YYYY-MM-DDTHH:mm`) without a time-zone conversion. Phone input uses libphonenumber-js metadata for all supported countries, as-you-type national formatting, international paste, E.164 output, and validity callbacks. Social authentication is a button callback, not an authentication service.

Type checks and React Native Web interaction tests run in this repository. Physical iOS/Android behavior, gesture conflicts, screen-reader behavior on devices, animations, RTL layouts, and variant fidelity still require device verification.
