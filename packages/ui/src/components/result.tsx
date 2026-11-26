import type { ReactNode, ComponentProps } from "react"
import {
  CheckCircleIcon,
  WarningCircleIcon,
  InfoIcon,
  LockIcon,
} from "@phosphor-icons/react"
import { cn } from "@ankvale/ui/lib/utils"
export function Result({
  status = "info",
  title,
  description,
  actions,
  children,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  status?: "success" | "error" | "warning" | "info" | "permission"
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  const Icon = {
    success: CheckCircleIcon,
    error: WarningCircleIcon,
    warning: WarningCircleIcon,
    info: InfoIcon,
    permission: LockIcon,
  }[status]
  return (
    <section
      data-slot="result"
      className={cn(
        "mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mb-5 size-10",
          status === "error" ? "text-destructive" : "text-primary"
        )}
      />
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>
      )}
      {children && <div className="mt-6 w-full text-start">{children}</div>}
      {actions && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions}
        </div>
      )}
    </section>
  )
}
