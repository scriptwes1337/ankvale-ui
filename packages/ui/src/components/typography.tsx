import type { ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type HeadingProps = ComponentProps<"h2"> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: "display" | "title" | "section" | "subsection"
}
export function Heading({
  level = 2,
  size = "section",
  className,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as "h2"
  return (
    <Tag
      data-slot="heading"
      className={cn(
        "font-semibold tracking-tight text-foreground",
        {
          display: "text-4xl leading-tight sm:text-6xl",
          title: "text-3xl leading-tight",
          section: "text-2xl leading-tight",
          subsection: "text-lg leading-snug",
        }[size],
        className
      )}
      {...props}
    />
  )
}
export function Text({
  size = "md",
  muted = false,
  className,
  ...props
}: ComponentProps<"p"> & { size?: "sm" | "md" | "lg"; muted?: boolean }) {
  return (
    <p
      data-slot="text"
      className={cn(
        "leading-relaxed",
        { sm: "text-sm", md: "text-base", lg: "text-lg" }[size],
        muted && "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
export function InlineCode({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn(
        "rounded border bg-muted px-1 py-0.5 font-mono text-[.875em]",
        className
      )}
      {...props}
    />
  )
}
export function Prose({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      data-slot="prose"
      className={cn(
        "max-w-[70ch] leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ps-6 [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:ps-6",
        className
      )}
      {...props}
    />
  )
}
