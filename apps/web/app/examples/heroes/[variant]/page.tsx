import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { notFound } from "next/navigation"
import { Button } from "@ankvale/ui/components/button"
import {
  heroVariants,
  heroExamples,
  type HeroVariant,
} from "@/lib/hero-catalog"
export function generateStaticParams() {
  return Object.keys(heroVariants).map((variant) => ({ variant }))
}
export default async function HeroExample({
  params,
}: {
  params: Promise<{ variant: string }>
}) {
  const { variant } = await params
  if (!Object.hasOwn(heroVariants, variant)) notFound()
  const Hero = heroVariants[variant as HeroVariant],
    content = heroExamples[variant as HeroVariant]
  return (
    <>
      <header className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 border-b border-border/70 px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight"
        >
          <BrandMark />
          Ankvale
          <span className="text-xs font-normal text-muted-foreground">
            studio
          </span>
        </Link>
        <nav
          className="flex items-center gap-6 text-xs"
          aria-label="Preview navigation"
        >
          <Link
            href="/blocks"
            className="hidden text-muted-foreground hover:text-foreground sm:block"
          >
            Blocks
          </Link>
          <Link
            href="/templates"
            className="hidden text-muted-foreground hover:text-foreground sm:block"
          >
            Templates
          </Link>
          <Link href={`/blocks/heroes#${variant}`} className="font-medium">
            Back to heroes ↗
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <Hero
          headingLevel="h1"
          title={content.title}
          description={content.description}
          actions={
            <>
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/#install" />}
              >
                Get started <span aria-hidden="true">↗</span>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/playground" />}
              >
                Explore the library <span aria-hidden="true">→</span>
              </Button>
            </>
          }
        />
      </main>
    </>
  )
}
