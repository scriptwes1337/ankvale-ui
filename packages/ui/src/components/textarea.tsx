"use client"
import * as React from "react"
import { cn } from "cn"
export type TextareaProps = React.ComponentProps<"textarea"> & {
  autosize?: boolean
  minRows?: number
  maxRows?: number
}
function Textarea({
  className,
  autosize = true,
  minRows = 2,
  maxRows = 12,
  ref,
  onInput,
  style,
  ...props
}: TextareaProps) {
  const element = React.useRef<HTMLTextAreaElement | null>(null)
  const resize = React.useCallback(() => {
    const node = element.current
    if (!node || !autosize) return
    const computed = window.getComputedStyle(node)
    const line = parseFloat(computed.lineHeight) || 20
    const padding =
      (parseFloat(computed.paddingTop) || 0) +
      (parseFloat(computed.paddingBottom) || 0) +
      2
    node.style.height = "auto"
    const desired = Math.max(
      minRows * line + padding,
      Math.min(node.scrollHeight, maxRows * line + padding)
    )
    node.style.height = `${desired}px`
    node.style.overflowY =
      node.scrollHeight > maxRows * line + padding ? "auto" : "hidden"
  }, [autosize, minRows, maxRows])
  React.useLayoutEffect(resize, [resize, props.value, props.defaultValue])
  React.useEffect(() => {
    if (!autosize) return
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [autosize, resize])
  return (
    <textarea
      data-slot="textarea"
      rows={minRows}
      className={cn(
        "flex min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      style={style}
      ref={(node) => {
        element.current = node
        if (typeof ref === "function") return ref(node)
        else if (ref) ref.current = node
      }}
      onInput={(event) => {
        resize()
        onInput?.(event)
      }}
      {...props}
    />
  )
}
export { Textarea }
