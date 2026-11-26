"use client"

import type { ReactNode } from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@ankvale/ui/components/tabs"
import { cn } from "@ankvale/ui/lib/utils"
import {
  BlockSection,
  SectionHeading,
  surface,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"

export type Feature = {
  title: string
  description: string
  icon?: ReactNode
  visual?: ReactNode
}
export function FeatureGrid({
  items,
  ...props
}: SectionProps & { items: Feature[] }) {
  return (
    <BlockSection {...props} data-slot="feature-grid">
      <SectionHeading {...props} />
      <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="border-t pt-6">
            {item.icon && (
              <span className="mb-5 flex size-10 items-center justify-center rounded-xl bg-muted text-foreground [&_svg]:size-5">
                {item.icon}
              </span>
            )}
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </BlockSection>
  )
}
export function FeatureBento({
  items,
  ...props
}: SectionProps & { items: Feature[] }) {
  return (
    <BlockSection {...props} data-slot="feature-bento">
      <SectionHeading {...props} />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, i) => (
          <article
            key={item.title}
            className={cn(
              "flex min-h-64 flex-col overflow-hidden rounded-xl border border-border bg-muted p-6",
              i % 4 === 0 && "md:col-span-2"
            )}
          >
            <div className="mb-6 flex min-h-24 flex-1 items-center justify-center overflow-hidden rounded-lg bg-card">
              {item.visual ?? item.icon}
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </BlockSection>
  )
}
export function FeatureSplit({
  items,
  ...props
}: SectionProps & { items: Feature[] }) {
  return (
    <BlockSection {...props} data-slot="feature-split">
      <SectionHeading {...props} />
      <div className="space-y-12">
        {items.map((item, i) => (
          <article
            key={item.title}
            className="grid items-center gap-8 md:grid-cols-2"
          >
            <div className={cn("max-w-md", i % 2 === 1 && "md:order-2")}>
              <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div
              className={cn(
                "flex min-h-64 items-center justify-center overflow-hidden rounded-xl border p-7",
                surface()
              )}
            >
              {item.visual ?? item.icon}
            </div>
          </article>
        ))}
      </div>
    </BlockSection>
  )
}
export function FeatureTabs({
  items,
  ...props
}: SectionProps & { items: Feature[] }) {
  return (
    <BlockSection {...props} data-slot="feature-tabs">
      <SectionHeading {...props} />
      {items.length > 0 && (
        <Tabs defaultValue={items[0]!.title}>
          <TabsList className="h-auto max-w-full flex-wrap">
            {items.map((item) => (
              <TabsTrigger key={item.title} value={item.title}>
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {items.map((item) => (
            <TabsContent key={item.title} value={item.title}>
              <div
                className={cn(
                  "mt-5 grid items-center gap-7 rounded-xl border p-7 md:grid-cols-[1fr_1.3fr]",
                  surface()
                )}
              >
                <div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-lg bg-card p-4">
                  {item.visual ?? item.icon}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </BlockSection>
  )
}
