"use client"
import { useState, useRef } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { cn } from "@ankvale/ui/lib/utils"
export type ApprovalQuestion = {
  id: string
  title: string
  description?: string
  options?: { id: string; label: string; description?: string }[]
  multiple?: boolean
  allowCustom?: boolean
  required?: boolean
}
export type ApprovalAnswer = {
  selected: string[]
  custom?: string
  skipped?: boolean
}
export type ApprovalCardProps = {
  questions: ApprovalQuestion[]
  onComplete: (answers: Record<string, ApprovalAnswer>) => void | Promise<void>
  onDismiss?: () => void
  className?: string
  disabled?: boolean
}
export function ApprovalCard({
  questions,
  onComplete,
  onDismiss,
  className,
  disabled,
}: ApprovalCardProps) {
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Record<string, ApprovalAnswer>>({}),
    [pending, setPending] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("")
  const lock = useRef(false)
  const question = questions[index]
  const answer = question
    ? (answers[question.id] ?? { selected: [] })
    : { selected: [] }
  function update(next: ApprovalAnswer) {
    if (question) setAnswers({ ...answers, [question.id]: next })
  }
  async function next(skip = false) {
    if (!question || lock.current || disabled) return
    const all = {
      ...answers,
      [question.id]: skip ? { selected: [], skipped: true } : answer,
    }
    setAnswers(all)
    if (index < questions.length - 1) {
      setIndex(index + 1)
      return
    }
    lock.current = true
    setPending(true)
    setError("")
    try {
      await onComplete(all)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit answers.")
    } finally {
      lock.current = false
      setPending(false)
    }
  }
  if (!question || done)
    return (
      <div
        data-slot="approval-card"
        role="status"
        className={cn("rounded-lg border p-4 text-sm", className)}
      >
        {done ? "Answers submitted." : "No questions."}
      </div>
    )
  const canContinue =
    !question.options?.length ||
    answer.selected.length > 0 ||
    !!answer.custom?.trim()
  return (
    <section
      data-slot="approval-card"
      className={cn("rounded-lg border bg-card p-4", className)}
      aria-busy={pending}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{question.title}</h3>
          {question.description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {question.description}
            </p>
          )}
        </div>
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            disabled={pending || disabled}
          >
            Dismiss
          </Button>
        )}
      </header>
      <fieldset disabled={pending || disabled} className="space-y-2">
        <legend className="sr-only">{question.title}</legend>
        {question.options?.map((option) => (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-md border p-3",
              answer.selected.includes(option.id) && "border-primary bg-accent"
            )}
          >
            <input
              type={question.multiple ? "checkbox" : "radio"}
              name={`approval-${question.id}`}
              value={option.id}
              checked={answer.selected.includes(option.id)}
              className="mt-0.5 accent-primary"
              onChange={(e) =>
                update({
                  ...answer,
                  selected: question.multiple
                    ? e.target.checked
                      ? [...answer.selected, option.id]
                      : answer.selected.filter((id) => id !== option.id)
                    : [option.id],
                })
              }
            />
            <span>
              <span className="block text-sm">{option.label}</span>
              {option.description && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
        {question.allowCustom && (
          <Input
            aria-label="Custom answer"
            placeholder="Write an answer…"
            value={answer.custom ?? ""}
            onChange={(e) => update({ ...answer, custom: e.target.value })}
          />
        )}
      </fieldset>
      {error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      )}
      <footer className="mt-4 flex flex-wrap items-center gap-2">
        <span className="me-auto text-xs text-muted-foreground">
          {index + 1} / {questions.length}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending || disabled || index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </Button>
        {!question.required && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || disabled}
            onClick={() => void next(true)}
          >
            Skip
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          disabled={pending || disabled || !canContinue}
          onClick={() => void next()}
        >
          {pending
            ? "Submitting…"
            : index === questions.length - 1
              ? "Submit"
              : "Continue"}
        </Button>
      </footer>
    </section>
  )
}
