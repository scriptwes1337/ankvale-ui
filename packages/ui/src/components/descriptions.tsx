import type { ReactNode, ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type DescriptionItem = { id: string; label: ReactNode; value: ReactNode }
export function Descriptions({
  items,
  columns = 2,
  className,
  ...props
}: ComponentProps<"dl"> & { items: DescriptionItem[]; columns?: 1 | 2 | 3 }) {
  return (
    <dl
      data-slot="descriptions"
      className={cn(
        "grid gap-x-8 gap-y-5",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <div key={item.id} className="min-w-0">
          <dt className="mb-1 text-sm text-muted-foreground">{item.label}</dt>
          <dd className="text-sm break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
