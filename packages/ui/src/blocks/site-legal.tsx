"use client"
import { useId, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { FloatingToc } from "@ankvale/ui/components/floating-toc"
import { BlockSection, type SectionProps } from "@ankvale/ui/blocks/shared"
import { useControllableState } from "@ankvale/ui/hooks/use-controllable-state"
import {
  useSiteSubmission,
  SubmissionFeedback,
} from "@ankvale/ui/blocks/site-shared"
export type PolicySection = { id: string; title: string; body: ReactNode }
export function PolicyLayout({
  policyTitle,
  updatedLabel,
  sections,
  ...props
}: SectionProps & {
  policyTitle: string
  updatedLabel: string
  sections: PolicySection[]
}) {
  const prefix = useId()
  return (
    <BlockSection {...props} data-slot="policy-layout">
      <header className="mb-12">
        <h2 className="text-4xl font-semibold tracking-tight">{policyTitle}</h2>
        <p className="mt-4 text-sm text-muted-foreground">{updatedLabel}</p>
      </header>
      <div className="grid gap-12 lg:grid-cols-[1fr_240px]">
        <article className="max-w-[70ch] space-y-10">
          {sections.map((section) => (
            <section
              key={section.id}
              id={`${prefix}-${section.id}`}
              className="scroll-mt-8"
            >
              <h3 className="text-xl font-semibold">{section.title}</h3>
              <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                {section.body}
              </div>
            </section>
          ))}
        </article>
        <aside>
          <FloatingToc
            headings={sections.map((section) => ({
              id: `${prefix}-${section.id}`,
              title: section.title,
            }))}
            label="In this policy"
          />
        </aside>
      </div>
    </BlockSection>
  )
}
export type ConsentCategory = {
  id: string
  name: string
  description: string
  required?: boolean
}
export type ConsentPreferencesProps = {
  categories: ConsentCategory[]
  value?: Record<string, boolean>
  defaultValue?: Record<string, boolean>
  onValueChange?: (value: Record<string, boolean>) => void
  onSave: (value: Record<string, boolean>) => void | Promise<void>
  title?: string
  description?: string
}
export function ConsentPreferences({
  categories,
  value,
  defaultValue = {},
  onValueChange,
  onSave,
  title = "Privacy preferences",
  description = "Choose which optional categories you allow.",
}: ConsentPreferencesProps) {
  const id = useId()
  const [preferences, setPreferences] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const submission = useSiteSubmission()
  const normalized = () =>
    Object.fromEntries(
      categories.map((category) => [
        category.id,
        category.required || !!preferences[category.id],
      ])
    )
  return (
    <section
      data-slot="consent-preferences"
      aria-labelledby={`${id}-title`}
      className="rounded-lg border bg-card p-6"
    >
      <h2 id={`${id}-title`} className="text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <fieldset
        disabled={submission.status === "pending"}
        className="mt-6 divide-y border-y"
      >
        {categories.map((category) => (
          <label
            key={category.id}
            htmlFor={`${id}-${category.id}`}
            className="flex items-start justify-between gap-5 py-5"
          >
            <span>
              <span className="block text-sm font-medium">
                {category.name}
                {category.required ? " (required)" : ""}
              </span>
              <span className="mt-2 block text-xs leading-6 text-muted-foreground">
                {category.description}
              </span>
            </span>
            <input
              id={`${id}-${category.id}`}
              type="checkbox"
              checked={category.required || !!preferences[category.id]}
              disabled={category.required || submission.status === "pending"}
              className="mt-1 size-4 shrink-0 accent-primary"
              onChange={(e) => {
                submission.reset()
                setPreferences({
                  ...preferences,
                  [category.id]: e.target.checked,
                })
              }}
            />
          </label>
        ))}
      </fieldset>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={submission.status === "pending"}
          onClick={() => submission.run(() => onSave(normalized()))}
        >
          {submission.status === "pending" ? "Saving…" : "Save preferences"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submission.status === "pending"}
          onClick={() => {
            const next = Object.fromEntries(
              categories.map((category) => [category.id, !!category.required])
            )
            setPreferences(next)
            submission.run(() => onSave(next))
          }}
        >
          Reject optional
        </Button>
      </div>
      <div className="mt-4">
        <SubmissionFeedback
          status={submission.status}
          success="Your preferences have been saved."
          error="Your preferences could not be saved. Try again."
        />
      </div>
    </section>
  )
}
