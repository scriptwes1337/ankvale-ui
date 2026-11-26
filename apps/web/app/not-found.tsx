import Link from "next/link"
import { NotFoundPage } from "@ankvale/ui/blocks/error-pages"
import { BrandMark } from "@/components/brand-mark"
export const metadata = { title: "Page not found — Ankvale UI" }
export default function NotFound() {
  return (
    <main id="main-content">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark />
          Ankvale UI
        </Link>
      </header>
      <NotFoundPage secondaryHref="/playground" />
    </main>
  )
}
