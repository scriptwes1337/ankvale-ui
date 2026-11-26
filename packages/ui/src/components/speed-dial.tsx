"use client"
import type { ReactNode } from "react"
import { PlusIcon } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@ankvale/ui/components/dropdown-menu"
import { FloatingAction } from "@ankvale/ui/components/floating-action"
export function SpeedDial({
  label,
  actions,
  disabled = false,
}: {
  label: string
  actions: {
    id: string
    label: string
    icon?: ReactNode
    onSelect: () => void
    disabled?: boolean
  }[]
  disabled?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<FloatingAction label={label} disabled={disabled} />}
      >
        <PlusIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            disabled={action.disabled}
            onClick={action.onSelect}
          >
            <span aria-hidden="true">{action.icon}</span>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
