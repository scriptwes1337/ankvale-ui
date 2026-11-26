"use client"
import { AnimatedSwitch } from "@ankvale/ui/components/animation"
import type { ReactNode } from "react"
/** Remounts only the replaced content; keep focused controls outside this wrapper. */
export function ContentTransition({
  stateKey,
  children,
  disabled = false,
  className,
}: {
  stateKey: string | number
  children: ReactNode
  disabled?: boolean
  className?: string
}) {
  return (
    <AnimatedSwitch
      stateKey={stateKey}
      duration={180}
      disabled={disabled}
      className={className}
    >
      {children}
    </AnimatedSwitch>
  )
}
export function Swap({
  active,
  inactive,
  checked,
  className,
}: {
  active: ReactNode
  inactive: ReactNode
  checked: boolean
  className?: string
}) {
  return (
    <span data-slot="swap" className={className}>
      {checked ? active : inactive}
    </span>
  )
}
