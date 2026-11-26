"use client"

import { useState, type ReactNode } from "react"
import { CheckIcon, MinusIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"
import {
  BlockSection,
  SectionHeading,
  surface,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"

export type PricingPlan = {
  name: string
  description: string
  monthly: number
  yearly: number
  currency?: string
  features: string[]
  href: string
  actionLabel?: string
  featured?: boolean
}
export function PricingCards({
  plans,
  ...props
}: SectionProps & { plans: PricingPlan[] }) {
  const [annual, setAnnual] = useState(false)
  return (
    <BlockSection {...props} data-slot="pricing-cards">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading {...props} className="mb-0" />
        <div
          role="group"
          aria-label="Billing period"
          className="flex rounded-full border bg-muted p-1"
        >
          {[false, true].map((value) => (
            <button
              key={String(value)}
              aria-pressed={annual === value}
              onClick={() => setAnnual(value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                annual === value ? "bg-card shadow-sm" : "text-muted-foreground"
              )}
            >
              {value ? "Yearly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6",
              surface(),
              plan.featured && "ring-2 ring-foreground"
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.featured && (
                <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                  Featured
                </span>
              )}
            </div>
            <p className="min-h-12 text-sm leading-6 text-muted-foreground">
              {plan.description}
            </p>
            <p className="mt-6">
              <span className="text-4xl font-semibold tracking-tight">
                {plan.currency ?? "$"}
                {annual ? plan.yearly : plan.monthly}
              </span>
              <span className="ms-1 text-sm text-muted-foreground">
                /{annual ? "year" : "month"}
              </span>
            </p>
            <ul className="my-7 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.featured ? "default" : "outline"}
              nativeButton={false}
              render={<a href={plan.href} />}
            >
              {plan.actionLabel ?? `Choose ${plan.name}`}
            </Button>
          </article>
        ))}
      </div>
    </BlockSection>
  )
}
export function PricingComparison({
  columns,
  rows,
  ...props
}: SectionProps & {
  columns: string[]
  rows: { label: string; values: (boolean | string)[] }[]
}) {
  return (
    <BlockSection {...props} data-slot="pricing-comparison">
      <SectionHeading {...props} />
      <div
        className={cn("overflow-x-auto rounded-2xl border", surface())}
        tabIndex={0}
        aria-label="Scrollable plan comparison"
      >
        <table className="w-full min-w-[540px] border-collapse text-start text-sm">
          <caption className="sr-only">Plan feature comparison</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-5 text-start font-medium">
                Features
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="p-5 text-center font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <th
                  scope="row"
                  className="p-5 text-start font-normal text-muted-foreground"
                >
                  {row.label}
                </th>
                {columns.map((column, i) => (
                  <td key={column} className="p-5 text-center">
                    {typeof row.values[i] === "boolean" ? (
                      <span className="inline-flex">
                        <span className="sr-only">
                          {row.values[i] ? "Included" : "Not included"}
                        </span>
                        {row.values[i] ? (
                          <CheckIcon aria-hidden="true" size={17} />
                        ) : (
                          <MinusIcon
                            aria-hidden="true"
                            size={17}
                            className="text-muted-foreground"
                          />
                        )}
                      </span>
                    ) : (
                      (row.values[i] ?? "—")
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlockSection>
  )
}
