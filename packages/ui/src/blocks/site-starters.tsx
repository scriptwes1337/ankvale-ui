import type { ReactNode } from "react"
import { NavbarStandard } from "@ankvale/ui/blocks/navigation"
import { FooterMinimal } from "@ankvale/ui/blocks/footers"
import {
  HeroSplit,
  HeroEditorial,
  HeroMinimal,
} from "@ankvale/ui/blocks/heroes"
import { FeatureGrid, type Feature } from "@ankvale/ui/blocks/features"
import { CtaBanner } from "@ankvale/ui/blocks/cta"
import { HowItWorks, type ProcessStep } from "@ankvale/ui/blocks/site-product"
import {
  BlogIndex,
  type EditorialPost,
} from "@ankvale/ui/blocks/site-editorial"
import {
  ContactSection,
  type ContactSectionProps,
} from "@ankvale/ui/blocks/site-contact"
import { Button } from "@ankvale/ui/components/button"
import { Image } from "@ankvale/ui/components/image"
import {
  BlockSection,
  SectionHeading,
  type NavLink,
} from "@ankvale/ui/blocks/shared"
export type SiteBrand = {
  name: string
  href?: string
  legal: string
  links: NavLink[]
}
export type StarterHero = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  visual?: ReactNode
  headingLevel?: "h1" | "h2"
}
function SiteHeader({
  brand,
  actions,
}: {
  brand: SiteBrand
  actions?: ReactNode
}) {
  return (
    <NavbarStandard
      brand={brand.name}
      brandHref={brand.href ?? "/"}
      links={brand.links}
      actions={actions}
    />
  )
}
function SiteFooter({ brand }: { brand: SiteBrand }) {
  return (
    <FooterMinimal
      brand={brand.name}
      brandHref={brand.href ?? "/"}
      legal={brand.legal}
      links={brand.links}
    />
  )
}
/** Route owners provide the main landmark and real navigation/action destinations. */
export function ProductSite({
  brand,
  hero,
  features,
  steps,
  closing,
}: {
  brand: SiteBrand
  hero: StarterHero
  features: Feature[]
  steps: ProcessStep[]
  closing: { title: string; description?: string; actions: ReactNode }
}) {
  return (
    <div data-slot="product-site" className="bg-background text-foreground">
      <SiteHeader brand={brand} />
      <HeroSplit
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
        headingLevel={hero.headingLevel ?? "h1"}
      >
        {hero.visual}
      </HeroSplit>
      <FeatureGrid title="What you can do" items={features} />
      <HowItWorks title="How it works" steps={steps} />
      <CtaBanner
        title={closing.title}
        description={closing.description}
        actions={closing.actions}
      />
      <SiteFooter brand={brand} />
    </div>
  )
}
export function BusinessSite({
  brand,
  hero,
  services,
  contact,
}: {
  brand: SiteBrand
  hero: StarterHero
  services: Feature[]
  contact: ContactSectionProps
}) {
  return (
    <div data-slot="business-site" className="bg-background text-foreground">
      <SiteHeader brand={brand} />
      <HeroMinimal
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
        headingLevel={hero.headingLevel ?? "h1"}
      >
        {hero.visual}
      </HeroMinimal>
      <FeatureGrid title="Services" items={services} />
      <ContactSection {...contact} />
      <SiteFooter brand={brand} />
    </div>
  )
}
export function PublicationSite({
  brand,
  hero,
  posts,
}: {
  brand: SiteBrand
  hero: StarterHero
  posts: EditorialPost[]
}) {
  return (
    <div data-slot="publication-site" className="bg-background text-foreground">
      <SiteHeader brand={brand} />
      <HeroEditorial
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
        headingLevel={hero.headingLevel ?? "h1"}
      >
        {hero.visual}
      </HeroEditorial>
      <BlogIndex title="Latest articles" posts={posts} />
      <SiteFooter brand={brand} />
    </div>
  )
}
export type StoreProduct = {
  id: string
  name: string
  description: string
  price: string
  href: string
  image?: { src: string; alt: string }
}
export function CommerceSite({
  brand,
  hero,
  products,
  collectionTitle = "Browse the collection",
}: {
  brand: SiteBrand
  hero: StarterHero
  products: StoreProduct[]
  collectionTitle?: string
}) {
  return (
    <div data-slot="commerce-site" className="bg-background text-foreground">
      <SiteHeader brand={brand} />
      <HeroSplit
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
        headingLevel={hero.headingLevel ?? "h1"}
      >
        {hero.visual}
      </HeroSplit>
      <BlockSection data-slot="store-collection">
        <SectionHeading title={collectionTitle} />
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <article>
                {product.image && (
                  <Image
                    {...product.image}
                    className="mb-5 aspect-square w-full rounded-lg"
                  />
                )}
                <h3 className="font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">{product.price}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<a href={product.href} />}
                  >
                    View product
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
        {!products.length && (
          <p className="text-sm text-muted-foreground">
            The collection is empty.
          </p>
        )}
      </BlockSection>
      <SiteFooter brand={brand} />
    </div>
  )
}
