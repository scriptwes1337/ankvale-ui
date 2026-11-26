import { InterfaceBuilder } from "@/components/interface-builder"
import { SiteHeader } from "@/components/site-header"
export default function BuilderPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">
          Interface builder
        </h1>
        <InterfaceBuilder />
      </main>
    </>
  )
}
