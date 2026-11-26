"use client"
import { Streamdown, type StreamdownProps } from "streamdown"
import { cn } from "@ankvale/ui/lib/utils"
export type MarkdownProps = Pick<StreamdownProps, "children" | "components"> & {
  streaming?: boolean
  className?: string
}
export function Markdown({
  children,
  streaming = false,
  className,
  components,
}: MarkdownProps) {
  return (
    <Streamdown
      data-slot="markdown"
      mode={streaming ? "streaming" : "static"}
      isAnimating={streaming}
      controls={false}
      components={components}
      className={cn(
        "min-w-0 space-y-3 text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:ps-6 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:p-3 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:list-disc [&_ul]:ps-6",
        className
      )}
    >
      {children}
    </Streamdown>
  )
}
