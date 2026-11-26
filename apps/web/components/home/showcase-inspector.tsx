"use client"

import Link from "next/link"
import { useId } from "react"
import { CodeIcon, ArrowUpRightIcon } from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"

export type ShowcasePart = { name: string; href: string; description: string }
export function ShowcaseInspector({
  title,
  parts,
  recipe,
}: {
  title: string
  parts: ShowcasePart[]
  recipe?: string
}) {
  const id = useId()
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          />
        }
      >
        <CodeIcon />
        See what this uses
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          These are the same components available in the library. This example
          keeps its changes locally.
        </DialogDescription>
        <ul className="divide-y">
          {parts.map((part, index) => (
            <li key={part.href}>
              <Link
                href={part.href}
                aria-labelledby={`${id}-${index}-name`}
                aria-describedby={`${id}-${index}-description`}
                className="group flex items-center justify-between gap-4 rounded-md py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>
                  <span
                    id={`${id}-${index}-name`}
                    className="block font-medium group-hover:text-primary"
                  >
                    {part.name}
                  </span>
                  <span
                    id={`${id}-${index}-description`}
                    className="mt-1 block text-xs leading-5 text-muted-foreground"
                  >
                    {part.description}
                  </span>
                </span>
                <ArrowUpRightIcon
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground"
                />
              </Link>
            </li>
          ))}
        </ul>
        {recipe && (
          <div className="space-y-3 rounded-lg border bg-secondary/40 p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Start with your coding agent
            </p>
            <p className="text-sm leading-6">{recipe}</p>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
              href="/guides/selection"
            >
              Open the selection guide <ArrowUpRightIcon />
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
