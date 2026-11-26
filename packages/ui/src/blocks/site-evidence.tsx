import type { ReactNode } from "react"
import { Kpi } from "@ankvale/ui/components/kpi"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
export type EvidenceMetric = {
  id: string
  label: string
  value: ReactNode
  description?: string
  change?: number
  source?: { label: string; href?: string }
}
/** Provide attributable measured values; this block never supplies fabricated outcomes. */
export function EvidenceMetrics({
  metrics,
  note,
  ...props
}: SectionProps & { metrics: EvidenceMetric[]; note?: ReactNode }) {
  return (
    <BlockSection {...props} data-slot="evidence-metrics">
      <SectionHeading {...props} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Kpi
            key={metric.id}
            label={metric.label}
            value={metric.value}
            description={metric.description}
            change={metric.change}
          >
            {metric.source && (
              <p className="mt-4 text-xs text-muted-foreground">
                {metric.source.href ? (
                  <a
                    href={metric.source.href}
                    className="underline underline-offset-4"
                  >
                    {metric.source.label}
                  </a>
                ) : (
                  metric.source.label
                )}
              </p>
            )}
          </Kpi>
        ))}
      </div>
      {note && (
        <div className="mt-5 max-w-[70ch] text-xs leading-6 text-muted-foreground">
          {note}
        </div>
      )}
    </BlockSection>
  )
}
