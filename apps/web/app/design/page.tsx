import { DesignStudio } from "@/components/design-studio"
import { SiteHeader } from "@/components/site-header"
export default function DesignPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">
          Design systems
        </h1>
        <DesignStudio />
      </main>
    </>
  )
}
