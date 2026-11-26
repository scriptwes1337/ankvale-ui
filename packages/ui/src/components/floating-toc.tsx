"use client"
import { useEffect, useState } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type TocHeading = { id: string; title: string; level?: number }
export function FloatingToc({
  headings,
  label = "On this page",
  className,
  scrollContainer,
  offset = 24,
  updateHistory = true,
}: {
  headings: TocHeading[]
  label?: string
  className?: string
  scrollContainer?: HTMLElement | null
  offset?: number
  updateHistory?: boolean
}) {
  const [active, setActive] = useState(headings[0]?.id ?? "")
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { root: scrollContainer ?? null, rootMargin: `-${offset}px 0px -65% 0px` }
    )
    headings.forEach(({ id }) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [headings, scrollContainer, offset])
  return (
    <nav
      data-slot="floating-toc"
      aria-label={label}
      className={cn("sticky rounded-lg border bg-card p-4", className)}
      style={{ top: offset }}
    >
      <p className="mb-3 text-xs font-medium">{label}</p>
      <ol className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => {
                const target = document.getElementById(heading.id)
                if (!target) return
                event.preventDefault()
                setActive(heading.id)
                const top =
                  target.getBoundingClientRect().top -
                  (scrollContainer?.getBoundingClientRect().top ?? 0) +
                  (scrollContainer?.scrollTop ?? window.scrollY) -
                  offset
                if (scrollContainer)
                  scrollContainer.scrollTo({ top, behavior: "auto" })
                else window.scrollTo({ top, behavior: "auto" })
                if (updateHistory)
                  history.replaceState(
                    null,
                    "",
                    `#${encodeURIComponent(heading.id)}`
                  )
                const original = target.getAttribute("tabindex")
                if (original === null) {
                  target.setAttribute("tabindex", "-1")
                  target.addEventListener(
                    "blur",
                    () => target.removeAttribute("tabindex"),
                    { once: true }
                  )
                }
                target.focus({ preventScroll: true })
              }}
              aria-current={active === heading.id ? "location" : undefined}
              className={cn(
                "block border-s-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === heading.id
                  ? "border-primary font-medium text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              style={{
                paddingInlineStart:
                  12 + Math.max(0, (heading.level ?? 2) - 2) * 12,
              }}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
