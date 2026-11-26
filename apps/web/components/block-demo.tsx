"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import {
  CheckIcon,
  StackIcon,
  CircleHalfIcon,
  SparkleIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { NotFoundPage } from "@ankvale/ui/blocks/error-pages"
import * as Navigation from "@ankvale/ui/blocks/navigation"
import * as Features from "@ankvale/ui/blocks/features"
import * as Social from "@ankvale/ui/blocks/social-proof"
import * as Pricing from "@ankvale/ui/blocks/pricing"
import * as Faq from "@ankvale/ui/blocks/faq"
import * as Cta from "@ankvale/ui/blocks/cta"
import * as Footers from "@ankvale/ui/blocks/footers"
import {
  blockDefinitions,
  sampleLinks,
  sampleGroups,
  sampleFeatures,
  sampleQuotes,
  samplePlans,
  sampleFaqs,
  sampleLogos,
  type BlockId,
} from "@/lib/block-catalog"

const ExtendedBlockPreview = dynamic(() =>
  import("@/components/generated-block-previews").then(
    (module) => module.ExtendedBlockPreview
  )
)
export function BlockArtwork({ kind = 0 }: { kind?: number }) {
  if (kind % 3 === 0)
    return (
      <div
        aria-hidden="true"
        className="relative flex h-40 w-full max-w-xs items-center justify-center"
      >
        <div className="absolute size-32 rounded-full bg-muted" />
        <div className="relative w-48 -rotate-6 space-y-3 rounded-xl border border-border bg-card p-5">
          <span className="block h-1.5 w-14 rounded-full bg-foreground/20" />
          {["Project brief", "Design review", "Release checklist"].map(
            (text, i) => (
              <div key={text} className="flex items-center gap-2 text-xs">
                <span className="flex size-4 items-center justify-center rounded-full bg-success-surface text-success">
                  {i === 0 ? (
                    <CheckIcon size={10} />
                  ) : (
                    <span className="size-1 rounded-full bg-current" />
                  )}
                </span>
                {text}
              </div>
            )
          )}
        </div>
      </div>
    )
  if (kind % 3 === 1)
    return (
      <div
        aria-hidden="true"
        className="relative flex h-40 w-full items-center justify-center"
      >
        <svg
          viewBox="0 0 240 150"
          className="h-40 w-60 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M60 73h44m32 0h44M120 44v58" />
          <rect
            x="12"
            y="49"
            width="48"
            height="48"
            rx="4"
            className="fill-card"
          />
          <rect
            x="96"
            y="12"
            width="48"
            height="32"
            rx="4"
            className="fill-accent"
          />
          <rect
            x="96"
            y="102"
            width="48"
            height="32"
            rx="4"
            className="fill-card"
          />
          <circle cx="120" cy="73" r="16" className="fill-card" />
          <rect
            x="180"
            y="49"
            width="48"
            height="48"
            rx="4"
            className="fill-card"
          />
          <path d="m26 73 7 7 13-15m63-37h22m-22 90h22m64-55h22m-22 10h16m-16 10h19" />
        </svg>
      </div>
    )
  return (
    <div
      aria-hidden="true"
      className="flex h-40 w-full max-w-xs items-end justify-center gap-3 px-8 pb-5"
    >
      {[35, 65, 50, 90, 72, 110].map((height, i) => (
        <div
          key={i}
          style={{ height, "--bar-opacity": 0.25 + i * 0.11 } as CSSProperties}
          className="w-6 rounded-t-lg bg-foreground opacity-(--bar-opacity)"
        />
      ))}
    </div>
  )
}
const icons = [
  <StackIcon key="stack" size={24} />,
  <CircleHalfIcon key="half" size={24} />,
  <SparkleIcon key="sparkle" size={24} />,
]
export function demoProps(
  id: BlockId,
  title: string,
  description: string
): Record<string, unknown> {
  const section = {
    title,
    description,
  }
  const footer = {
    brand: title,
    description,
    legal: "Illustrative example · Built with Ankvale UI",
    brandHref: "/",
    links: [
      { label: "Components", href: "/playground" },
      { label: "Blocks", href: "/blocks" },
    ],
  }
  switch (id) {
    case "not-found-page":
      return { title, description, homeHref: "/", secondaryHref: "/playground" }
    case "navbar-standard":
    case "navbar-floating":
      return { brand: title, brandHref: "/", links: sampleLinks }
    case "navbar-mega":
      return {
        brand: title,
        brandHref: "/",
        links: sampleLinks,
        groups: sampleGroups,
      }
    case "feature-grid":
    case "feature-bento":
    case "feature-split":
    case "feature-tabs":
      return {
        ...section,
        items:
          id === "feature-bento"
            ? [
                ...sampleFeatures,
                {
                  title: "Project history",
                  description: "Review changes and restore earlier versions.",
                },
              ]
            : sampleFeatures,
      }
    case "logo-cloud":
      return {
        ...section,
        logos: sampleLogos,
        description,
      }
    case "testimonial-grid":
      return { ...section, items: sampleQuotes }
    case "testimonial-spotlight":
      return { ...section, item: sampleQuotes[0] }
    case "pricing-cards":
      return {
        ...section,
        plans: samplePlans,
        description:
          "Illustrative prices. No purchases or accounts are created.",
      }
    case "pricing-comparison":
      return {
        ...section,
        columns: ["Personal", "Studio", "Collective"],
        rows: [
          { label: "Personal workspace", values: [true, true, true] },
          { label: "Team members", values: ["1", "10", "Unlimited"] },
          { label: "Shared spaces", values: [false, true, true] },
          { label: "Dedicated onboarding", values: [false, false, true] },
        ],
      }
    case "faq-accordion":
    case "faq-split":
      return { ...section, items: sampleFaqs }
    case "cta-banner":
      return section
    case "cta-split":
      return {
        ...section,
        visual: "Add your product image, illustration, or preview here.",
      }
    case "cta-newsletter":
      return {
        ...section,
        privacyNote:
          "Preview only. Connect your subscription service before publishing.",
      }
    case "footer-minimal":
    case "footer-editorial":
      return footer
    case "footer-columns":
      return { ...footer, groups: sampleGroups }
    default:
      return {}
  }
}
export function BlockDemo({
  id,
  title,
  description,
}: {
  id: BlockId
  title: string
  description: string
}) {
  if (
    blockDefinitions
      .find((item) => item.id === id)
      ?.module.match(/^(app|site)-/)
  )
    return (
      <div className="p-4 sm:p-6">
        <ExtendedBlockPreview name={id} />
      </div>
    )
  const base = demoProps(id, title, description)
  const actions = (
    <>
      <Button nativeButton={false} render={<a href="/examples/studio" />}>
        Explore the example
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href="/playground" />}
      >
        View components
      </Button>
    </>
  )
  const featureItems = sampleFeatures.map((item, i) => ({
    ...item,
    icon: icons[i],
    visual: <BlockArtwork kind={i} />,
  }))
  // Explicit branches preserve each block's prop contract in TypeScript.
  const section = {
    title,
    description,
  }
  const nav = { brand: title, links: sampleLinks, actions }
  const footer = {
    brand: title,
    description,
    legal: "Illustrative example · Built with Ankvale UI",
    links: [
      { label: "Components", href: "/playground" },
      { label: "Blocks", href: "/blocks" },
    ],
  }
  switch (id) {
    case "not-found-page":
      return (
        <NotFoundPage
          title={title}
          description={description}
          secondaryHref="/playground"
        />
      )
    case "navbar-standard":
      return <Navigation.NavbarStandard {...nav} />
    case "navbar-floating":
      return <Navigation.NavbarFloating {...nav} />
    case "navbar-mega":
      return <Navigation.NavbarMega {...nav} groups={sampleGroups} />
    case "feature-grid":
      return <Features.FeatureGrid {...section} items={featureItems} />
    case "feature-bento":
      return (
        <Features.FeatureBento
          {...section}
          items={[
            ...featureItems,
            {
              title: "Project history",
              description: "Review changes and restore earlier versions.",
              visual: <BlockArtwork />,
            },
          ]}
        />
      )
    case "feature-split":
      return <Features.FeatureSplit {...section} items={featureItems} />
    case "feature-tabs":
      return <Features.FeatureTabs {...section} items={featureItems} />
    case "logo-cloud":
      return (
        <Social.LogoCloud
          {...section}
          logos={sampleLogos}
          description={base.description as string}
        />
      )
    case "testimonial-grid":
      return <Social.TestimonialGrid {...section} items={sampleQuotes} />
    case "testimonial-spotlight":
      return (
        <Social.TestimonialSpotlight
          {...section}
          item={sampleQuotes[0]!}
          visual={<BlockArtwork kind={1} />}
        />
      )
    case "pricing-cards":
      return (
        <Pricing.PricingCards
          {...section}
          plans={samplePlans}
          description={base.description as string}
        />
      )
    case "pricing-comparison":
      return (
        <Pricing.PricingComparison
          {...section}
          columns={["Personal", "Studio", "Collective"]}
          rows={base.rows as { label: string; values: (boolean | string)[] }[]}
        />
      )
    case "faq-accordion":
      return <Faq.FaqAccordion {...section} items={sampleFaqs} />
    case "faq-split":
      return <Faq.FaqSplit {...section} items={sampleFaqs} actions={actions} />
    case "cta-banner":
      return <Cta.CtaBanner {...section} actions={actions} />
    case "cta-split":
      return (
        <Cta.CtaSplit
          {...section}
          actions={actions}
          visual={<BlockArtwork kind={1} />}
        />
      )
    case "cta-newsletter":
      return (
        <Cta.CtaNewsletter
          {...section}
          privacyNote={base.privacyNote as string}
        />
      )
    case "footer-minimal":
      return <Footers.FooterMinimal {...footer} />
    case "footer-columns":
      return <Footers.FooterColumns {...footer} groups={sampleGroups} />
    case "footer-editorial":
      return <Footers.FooterEditorial {...footer} />
  }
}
