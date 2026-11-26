"use client"
import { type ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
export type InlineSelectOption = {
  value: string
  label: string
  disabled?: boolean
}
export function InlineSelect({
  options,
  label,
  className,
  ...props
}: ComponentProps<"select"> & {
  options: InlineSelectOption[]
  label: string
}) {
  return (
    <select
      data-slot="inline-select"
      aria-label={label}
      className={cn(
        "max-w-full cursor-pointer rounded border border-transparent bg-transparent py-1 ps-2 pe-6 text-sm outline-none hover:border-border focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50 [&_option]:bg-popover [&_option]:text-popover-foreground",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}
