"use client"
import type { ComponentProps } from "react"
import Link from "next/link"
import { Markdown } from "@ankvale/ui/components/markdown"
function GuideTable({ children, className }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table className={className}>{children}</table>
    </div>
  )
}
function GuideLink({ href, children, className }: ComponentProps<"a">) {
  if (!href || !/^(?:\/(?!\/)|#|https?:\/\/|mailto:)/i.test(href)) {
    return <span className={className}>{children}</span>
  }
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className} rel="noopener noreferrer">
      {children}
    </a>
  )
}
const components = { table: GuideTable, a: GuideLink }
export function GuideContent({ content }: { content: string }) {
  return (
    <Markdown
      components={components}
      className="[&_h1]:mb-6 [&_h1]:text-4xl [&_h1]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:leading-7"
    >
      {content}
    </Markdown>
  )
}
