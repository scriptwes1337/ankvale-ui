import type { ReactNode } from "react"
import { Spinner } from "@ankvale/ui/components/spinner"
import { cn } from "@ankvale/ui/lib/utils"
export type ToolStatus = "pending" | "running" | "complete" | "error"
export function ChatTool({
  name,
  status = "pending",
  input,
  output,
  error,
  children,
  className,
}: {
  name: string
  status?: ToolStatus
  input?: unknown
  output?: unknown
  error?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <details
      data-slot="chat-tool"
      className={cn("rounded-lg border bg-card text-sm", className)}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3">
        <span className="font-mono text-xs">{name}</span>
        <span
          className={cn(
            "ms-auto flex items-center gap-2 text-xs",
            status === "error" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {status === "running" && <Spinner />}
          {status}
        </span>
      </summary>
      <div className="space-y-3 border-t p-4">
        {input !== undefined && (
          <div>
            <p className="mb-1 text-xs font-medium">Input</p>
            <pre className="overflow-auto text-xs">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        )}
        {output !== undefined && (
          <div>
            <p className="mb-1 text-xs font-medium">Output</p>
            <pre className="overflow-auto text-xs">
              {typeof output === "string"
                ? output
                : JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        {children}
      </div>
    </details>
  )
}
