import { NativePlayground } from "@/components/native-playground"
import { SiteHeader } from "@/components/site-header"
export default function NativePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">
          Native components
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          React Native components rendered with React Native Web. Device testing
          is pending.
        </p>
        <NativePlayground />
      </main>
    </>
  )
}
