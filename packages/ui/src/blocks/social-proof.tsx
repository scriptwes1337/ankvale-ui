import type { ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
import {
  BlockSection,
  SectionHeading,
  surface,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"

export type Testimonial = {
  quote: string
  name: string
  role: string
  avatar?: ReactNode
}
export function LogoCloud({
  logos,
  ...props
}: SectionProps & { logos: { name: string; mark?: ReactNode }[] }) {
  return (
    <BlockSection
      {...props}
      data-slot="logo-cloud"
      className={cn("py-10 sm:py-12", props.className)}
    >
      <SectionHeading
        {...props}
        className="mx-auto mb-7 text-center [&_h2]:text-sm [&_h2]:font-medium [&_h2]:tracking-normal"
      />
      <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
        {logos.map((logo) => (
          <li
            key={logo.name}
            className="flex items-center gap-2 text-xl font-semibold tracking-tight text-muted-foreground"
          >
            {logo.mark}
            {logo.name}
          </li>
        ))}
      </ul>
    </BlockSection>
  )
}
function Quote({ item }: { item: Testimonial }) {
  return (
    <>
      <blockquote className="text-lg leading-8 tracking-[-0.02em]">
        “{item.quote}”
      </blockquote>
      <figcaption className="mt-7 flex items-center gap-3">
        {item.avatar ?? (
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground"
          >
            {item.name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")}
          </span>
        )}
        <div>
          <p className="text-sm font-medium">{item.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.role}</p>
        </div>
      </figcaption>
    </>
  )
}
export function TestimonialGrid({
  items,
  ...props
}: SectionProps & { items: Testimonial[] }) {
  return (
    <BlockSection {...props} data-slot="testimonial-grid">
      <SectionHeading {...props} />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <figure
            key={item.name}
            className={cn("rounded-2xl border p-6", surface())}
          >
            <Quote item={item} />
          </figure>
        ))}
      </div>
    </BlockSection>
  )
}
export function TestimonialSpotlight({
  item,
  visual,
  ...props
}: SectionProps & { item: Testimonial; visual?: ReactNode }) {
  return (
    <BlockSection {...props} data-slot="testimonial-spotlight">
      <SectionHeading {...props} />
      <div
        className={cn(
          "grid overflow-hidden rounded-2xl border md:grid-cols-[0.8fr_1.2fr]",
          surface()
        )}
      >
        <div className="flex min-h-64 items-center justify-center bg-muted/70 p-10">
          {visual ?? (
            <span
              aria-hidden="true"
              className="font-serif text-[140px] leading-none text-foreground/15"
            >
              “
            </span>
          )}
        </div>
        <figure className="flex flex-col justify-center p-7 sm:p-10 [&_blockquote]:text-2xl [&_blockquote]:leading-10">
          <Quote item={item} />
        </figure>
      </div>
    </BlockSection>
  )
}
