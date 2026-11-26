import type { ComponentProps, ReactNode } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type NotFoundPageProps = Omit<ComponentProps<"section">, "title"> & {
  title?: ReactNode
  description?: ReactNode
  homeHref?: string
  homeLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}
/** Recovery for an unknown route. Empty search results should use Empty instead. */
export function NotFoundPage({
  title = "Page not found",
  description = "This page may have moved, or the address may be incorrect.",
  homeHref = "/",
  homeLabel = "Go home",
  secondaryHref,
  secondaryLabel = "Browse components",
  className,
  ...props
}: NotFoundPageProps) {
  return (
    <section
      data-slot="not-found-page"
      className={cn(
        "flex min-h-[70svh] items-center justify-center px-6 py-20",
        className
      )}
      {...props}
    >
      <div className="max-w-xl text-center" data-slot="not-found-content">
        <svg
          aria-hidden="true"
          viewBox="0 0 160 120"
          className="mx-auto mb-8 h-28 w-40 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M52 16h40l22 22v63H52z" />
          <path d="M92 16v23h22M67 58h31M67 70h20" />
          <circle cx="47" cy="83" r="20" className="fill-background" />
          <path d="m61 97 17 15M40 78l13 10m0-10-13 10" />
        </svg>
        <p className="mb-3 text-sm text-muted-foreground tabular-nums">404</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <div className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground">
          {description}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            data-slot="button"
            href={homeHref}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {homeLabel}
          </a>
          {secondaryHref && (
            <a
              data-slot="button"
              href={secondaryHref}
              className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
