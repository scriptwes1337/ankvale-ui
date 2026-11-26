"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ankvale/ui/components/accordion"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"

export type FaqItem = { question: string; answer: string }
function Questions({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="w-full">
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={String(i)}>
          <AccordionTrigger className="py-5 text-start text-base">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-7 text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export function FaqAccordion({
  items,
  ...props
}: SectionProps & { items: FaqItem[] }) {
  return (
    <BlockSection {...props} data-slot="faq-accordion">
      <div className="mx-auto max-w-3xl">
        <SectionHeading {...props} />
        <Questions items={items} />
      </div>
    </BlockSection>
  )
}
export function FaqSplit({
  items,
  ...props
}: SectionProps & { items: FaqItem[] }) {
  return (
    <BlockSection {...props} data-slot="faq-split">
      <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          {...props}
          className="md:sticky md:top-8 md:self-start"
        />
        <Questions items={items} />
      </div>
    </BlockSection>
  )
}
