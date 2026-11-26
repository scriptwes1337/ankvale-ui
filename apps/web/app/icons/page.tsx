import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { IconGallery } from "@/components/icon-gallery"

export const metadata: Metadata = {
  title: "Icons — Ankvale UI",
  description:
    "Browse, search and copy Phosphor icons used throughout Ankvale UI.",
}

export default function IconsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <h1 className="text-4xl font-bold tracking-tight">Icons</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Phosphor is Ankvale’s icon family. Search the collection, choose a
          weight, and copy a React example.
        </p>
        <IconGallery />
      </main>
    </>
  )
}
