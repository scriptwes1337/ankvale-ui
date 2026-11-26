"use client"

import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { StackIcon, SparkleIcon, CircleHalfIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { NavbarStandard } from "@ankvale/ui/blocks/navigation"
import { HeroProduct } from "@ankvale/ui/blocks/heroes"
import { FeatureBento, FeatureSplit } from "@ankvale/ui/blocks/features"
import { LogoCloud, TestimonialGrid } from "@ankvale/ui/blocks/social-proof"
import { PricingCards } from "@ankvale/ui/blocks/pricing"
import { FaqSplit } from "@ankvale/ui/blocks/faq"
import { CtaNewsletter, CtaBanner } from "@ankvale/ui/blocks/cta"
import { FooterColumns } from "@ankvale/ui/blocks/footers"
import { WorkspacePreview } from "@/components/workspace-preview"
import { BlockArtwork } from "@/components/block-demo"
import {
  sampleFeatures,
  sampleLogos,
  sampleQuotes,
  samplePlans,
  sampleFaqs,
} from "@/lib/block-catalog"
import { cn } from "@ankvale/ui/lib/utils"

export function StudioExample() {
  const actions = (
    <>
      <Button nativeButton={false} render={<a href="#pricing" />}>
        Find your space
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href="#features" />}
      >
        Take a closer look
      </Button>
    </>
  )
  return (
    <div className={cn("overflow-x-clip", "bg-background")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-6 py-3 text-xs">
        <Link
          href="/blocks"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <BrandMark className="w-6" />
          Ankvale UI · Example website
        </Link>
        <span className="hidden text-muted-foreground md:block">
          Forma is a concept. All brands, profiles, quotes, and prices are
          illustrative.
        </span>
      </div>
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-50 -translate-y-24 rounded bg-primary p-3 text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <NavbarStandard
        brand={
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <StackIcon size={17} />
            </span>
            forma
          </span>
        }
        brandHref="#"
        links={[
          { label: "The workspace", href: "#features" },
          { label: "Plans", href: "#pricing" },
          { label: "Questions", href: "#questions" },
        ]}
        actions={
          <Button
            nativeButton={false}
            render={<a href="#newsletter" />}
            size="sm"
            className="rounded-md"
          >
            Stay in the loop
          </Button>
        }
      />
      <main id="main-content">
        <HeroProduct
          headingLevel="h1"
          title={
            <>
              Less scattered.
              <br />
              <span>More together.</span>
            </>
          }
          description="Notes, projects, and team knowledge in one place. Turn your next idea into work everyone can build on."
          actions={actions}
          className="pt-12 sm:pt-14"
        >
          <WorkspacePreview />
        </HeroProduct>
        <LogoCloud
          title="Example customers"
          description="Example wordmarks, shown to demonstrate the logo collection block."
          logos={sampleLogos}
        />
        <FeatureBento
          id="features"
          title="Features"
          description="Notes, project tracking, and shared workspaces."
          items={[
            { ...sampleFeatures[0]!, visual: <BlockArtwork /> },
            { ...sampleFeatures[1]!, visual: <BlockArtwork kind={1} /> },
            {
              title: "At a glance",
              description:
                "Clear structure for the small steps that make a bigger picture.",
              visual: <BlockArtwork kind={2} />,
            },
            {
              ...sampleFeatures[2]!,
              visual: (
                <div className="flex items-center gap-4">
                  <CircleHalfIcon size={40} />
                  <SparkleIcon size={40} />
                </div>
              ),
            },
          ]}
        />
        <FeatureSplit
          title="Team workspace"
          items={[
            {
              title: "Keep project notes together",
              description:
                "Add notes, link documents, and share updates with your team.",
              visual: <BlockArtwork kind={1} />,
            },
          ]}
        />
        <TestimonialGrid
          title="Customer stories"
          description="These are fictional profiles and sample quotes, included to demonstrate the testimonial layout."
          items={sampleQuotes}
        />
        <PricingCards
          id="pricing"
          title="Plans"
          description="Illustrative plans and prices. This concept website does not sell subscriptions or create accounts."
          plans={samplePlans.map((plan) => ({ ...plan, href: "#questions" }))}
        />
        <FaqSplit
          id="questions"
          title="Frequently asked questions"
          description="A few things to know about this example and the blocks behind it."
          items={sampleFaqs}
        />
        <CtaNewsletter
          id="newsletter"
          title="Newsletter"
          description="A newsletter section, ready to connect to your own service."
          buttonLabel="Keep me posted"
          privacyNote="Demo form. No email is submitted or stored."
        />
        <CtaBanner
          title="Build with Ankvale"
          description="Browse the blocks used on this page."
          actions={
            <Button nativeButton={false} render={<Link href="/blocks" />}>
              Build with Ankvale
            </Button>
          }
        />
      </main>
      <FooterColumns
        brand="forma"
        brandHref="#"
        description="One place for your notes, projects, and team knowledge."
        legal="Forma is an illustrative concept website · Built with Ankvale UI"
        groups={[
          {
            title: "Explore",
            links: [
              { label: "Features", href: "#features" },
              { label: "Plans", href: "#pricing" },
              { label: "Questions", href: "#questions" },
            ],
          },
          {
            title: "Build your own",
            links: [
              { label: "Website blocks", href: "/blocks" },
              { label: "Hero layouts", href: "/blocks/heroes" },
              { label: "Components", href: "/playground" },
            ],
          },
          {
            title: "Stay close",
            links: [
              { label: "Newsletter preview", href: "#newsletter" },
              { label: "Ankvale home", href: "/" },
            ],
          },
        ]}
      />
    </div>
  )
}
