"use client"
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  Reorder,
  useDragControls,
  useIsPresent,
} from "motion/react"
import { useId, useState, type ReactNode } from "react"
import { DotsSixVerticalIcon } from "@phosphor-icons/react"
import { useReducedMotion } from "@ankvale/ui/hooks/use-reduced-motion"
import { AnkvaleMotionContext } from "@ankvale/ui/lib/ankvale-config"
import { Button } from "@ankvale/ui/components/button"
import { cn } from "@ankvale/ui/lib/utils"
export const animationTimings = {
  fast: 120,
  state: 180,
  enter: 280,
  exit: 160,
} as const
const ease = [0.2, 0, 0, 1] as const
export type AnimationPreset = "fade" | "reveal" | "scale"
function hidden(preset: AnimationPreset) {
  return preset === "reveal"
    ? { opacity: 0, y: 8 }
    : preset === "scale"
      ? { opacity: 0, scale: 0.98 }
      : { opacity: 0 }
}
function seconds(value: number, fallback: number) {
  return (Number.isFinite(value) ? Math.max(0, Math.min(600, value)) : fallback) / 1000
}
export function AnimationProvider({
  children,
  disabled = false,
  nonce,
}: {
  children: ReactNode
  disabled?: boolean
  nonce?: string
}) {
  const reduced = useReducedMotion()
  return (
    <div
      data-slot="animation-provider"
      data-motion={disabled || reduced ? "none" : undefined}
      className="contents"
    >
      <AnkvaleMotionContext.Provider
        value={disabled || reduced ? "none" : "system"}
      >
        <MotionConfig
          reducedMotion={disabled || reduced ? "always" : "user"}
          transition={{
            duration: disabled || reduced ? 0 : animationTimings.state / 1000,
            ease,
          }}
          nonce={nonce}
        >
          {children}
        </MotionConfig>
      </AnkvaleMotionContext.Provider>
    </div>
  )
}
function PresencePanel({
  children,
  preset,
  duration,
  disabled,
  className,
}: {
  children: ReactNode
  preset: AnimationPreset
  duration: number
  disabled: boolean
  className?: string
}) {
  const present = useIsPresent()
  const reduced = useReducedMotion() || disabled
  return (
    <motion.div
      data-slot="presence"
      inert={!present}
      aria-hidden={!present ? true : undefined}
      className={className}
      initial={reduced ? false : hidden(preset)}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 1 } : hidden(preset)}
      transition={{ duration: reduced ? 0 : seconds(duration, 180), ease }}
    >
      {children}
    </motion.div>
  )
}
/** Place outside the conditional. Exiting content is inert immediately. Durations are milliseconds. */
export function Presence({
  present,
  children,
  preset = "fade",
  duration = 180,
  disabled = false,
  className,
  onExitComplete,
}: {
  present: boolean
  children: ReactNode
  preset?: AnimationPreset
  duration?: number
  disabled?: boolean
  className?: string
  onExitComplete?: () => void
}) {
  return (
    <AnimatePresence initial={false} onExitComplete={onExitComplete}>
      {present && (
        <PresencePanel
          key="content"
          preset={preset}
          duration={duration}
          disabled={disabled}
          className={className}
        >
          {children}
        </PresencePanel>
      )}
    </AnimatePresence>
  )
}
export function AnimationGroup({
  children,
  id,
}: {
  children: ReactNode
  id?: string
}) {
  const generated = useId()
  return <LayoutGroup id={id ?? generated}>{children}</LayoutGroup>
}
export function AnimatedLayout({
  children,
  layoutId,
  disabled = false,
  className,
}: {
  children: ReactNode
  layoutId?: string
  disabled?: boolean
  className?: string
}) {
  const reduced = useReducedMotion() || disabled
  return (
    <motion.div
      data-slot="animated-layout"
      layout={reduced ? false : "position"}
      layoutId={reduced ? undefined : layoutId}
      transition={{
        duration: reduced ? 0 : animationTimings.state / 1000,
        ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
function AnimatedListItem({
  children,
  reduced,
}: {
  children: ReactNode
  reduced: boolean
}) {
  const present = useIsPresent()
  return (
    <motion.li
      layout={reduced ? false : "position"}
      inert={!present}
      aria-hidden={!present ? true : undefined}
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: reduced ? 1 : 0 }}
      transition={{
        duration: reduced ? 0 : animationTimings.state / 1000,
        ease,
      }}
    >
      {children}
    </motion.li>
  )
}
export function AnimatedList({
  items,
  label,
  disabled = false,
  className,
}: {
  items: { id: string; content: ReactNode }[]
  label: string
  disabled?: boolean
  className?: string
}) {
  const reduced = useReducedMotion() || disabled
  return (
    <ul data-slot="animated-list" aria-label={label} className={className}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <AnimatedListItem key={item.id} reduced={reduced}>
            {item.content}
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </ul>
  )
}
export type ReorderListItem = { id: string; label: string; content?: ReactNode }
function ReorderRow({
  item,
  index,
  count,
  move,
  reduced,
}: {
  item: ReorderListItem
  index: number
  count: number
  move: (from: number, to: number) => void
  reduced: boolean
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      drag={reduced ? false : "y"}
      layout="position"
      className="relative flex items-center gap-3 rounded-lg border bg-card p-3"
      transition={{ duration: reduced ? 0 : 0.18, ease }}
    >
      <button
        type="button"
        disabled={reduced}
        aria-label={`Drag ${item.label}; use move buttons to reorder with keyboard`}
        className="touch-none rounded p-2 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        onPointerDown={(event) => controls.start(event)}
      >
        <DotsSixVerticalIcon aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1 text-sm">{item.content ?? item.label}</div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Move ${item.label} up`}
          disabled={index === 0}
          onClick={(event) => {
            const button = event.currentTarget
            move(index, index - 1)
            requestAnimationFrame(
              () =>
                button.isConnected &&
                (button.disabled
                  ? button.parentElement
                      ?.querySelector<HTMLButtonElement>(
                        "button:not(:disabled)"
                      )
                      ?.focus()
                  : button.focus())
            )
          }}
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Move ${item.label} down`}
          disabled={index === count - 1}
          onClick={(event) => {
            const button = event.currentTarget
            move(index, index + 1)
            requestAnimationFrame(
              () =>
                button.isConnected &&
                (button.disabled
                  ? button.parentElement
                      ?.querySelector<HTMLButtonElement>(
                        "button:not(:disabled)"
                      )
                      ?.focus()
                  : button.focus())
            )
          }}
        >
          ↓
        </Button>
      </div>
    </Reorder.Item>
  )
}
/** Single-axis drag with explicit keyboard actions; the caller owns the ordered array. */
export function ReorderList({
  items,
  onItemsChange,
  label,
  className,
}: {
  items: ReorderListItem[]
  onItemsChange: (items: ReorderListItem[]) => void
  label: string
  className?: string
}) {
  const reduced = useReducedMotion()
  const [announcement, setAnnouncement] = useState("")
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const item = next.splice(from, 1)[0]!
    next.splice(to, 0, item)
    onItemsChange(next)
    setAnnouncement(
      `${item.label} moved to position ${to + 1} of ${items.length}.`
    )
  }
  return (
    <div data-slot="reorder-list">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={(next) => {
          onItemsChange(next)
          setAnnouncement("List order updated.")
        }}
        aria-label={label}
        className={cn("space-y-2", className)}
      >
        {items.map((item, index) => (
          <ReorderRow
            key={item.id}
            item={item}
            index={index}
            count={items.length}
            move={move}
            reduced={reduced}
          />
        ))}
      </Reorder.Group>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

/** Crossfade replacement in one grid cell. Removed content becomes inert during its exit. */
export function AnimatedSwitch({
  stateKey,
  children,
  preset = "fade",
  duration = 180,
  disabled = false,
  className,
}: {
  stateKey: string | number
  children: ReactNode
  preset?: AnimationPreset
  duration?: number
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      data-slot="animated-switch"
      className={cn("grid [&>*]:col-start-1 [&>*]:row-start-1", className)}
    >
      <AnimatePresence initial={false}>
        <PresencePanel
          key={stateKey}
          preset={preset}
          duration={duration}
          disabled={disabled}
        >
          {children}
        </PresencePanel>
      </AnimatePresence>
    </div>
  )
}
