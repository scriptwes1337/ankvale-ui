import type { ReactNode } from "react"
import { Timeline } from "@ankvale/ui/components/timeline"
import { CheckIcon, XIcon } from "@phosphor-icons/react"
import { Loader } from "@ankvale/ui/components/loader"
export type ThoughtStep = {
  id: string
  title: string
  description?: ReactNode
  status: "pending" | "running" | "complete" | "error"
}
export function ChainOfThought({
  steps,
  className,
}: {
  steps: ThoughtStep[]
  className?: string
}) {
  return (
    <Timeline
      data-slot="chain-of-thought"
      aria-label="Reasoning steps"
      className={className}
      items={steps.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        status:
          step.status === "running"
            ? "current"
            : step.status === "complete"
              ? "complete"
              : "pending",
        icon:
          step.status === "running" ? (
            <Loader />
          ) : step.status === "complete" ? (
            <CheckIcon />
          ) : step.status === "error" ? (
            <XIcon className="text-destructive" />
          ) : undefined,
      }))}
    />
  )
}
