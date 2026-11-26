"use client"
import {
  useContext,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { MotionConfig } from "motion/react"
import { DirectionProvider } from "@ankvale/ui/components/direction"
import { TooltipProvider } from "@ankvale/ui/components/tooltip"
import { Toaster } from "@ankvale/ui/components/toast"
import { useMediaQuery } from "@ankvale/ui/hooks/use-media-query"
import {
  AnkvaleConfigContext,
  AnkvaleMotionContext,
  defaultAnkvaleConfig,
  type AnkvaleConfig,
} from "@ankvale/ui/lib/ankvale-config"
import { cn } from "@ankvale/ui/lib/utils"
export type AnkvaleProviderProps = Omit<
  ComponentProps<"div">,
  "dir" | "children"
> &
  Partial<AnkvaleConfig> & {
    children: ReactNode
    toasts?: boolean
    nonce?: string
    serverAppearance?: "light" | "dark"
  }
/** Scoped defaults, including portal styling. No storage or global document mutation. */
export function AnkvaleProvider({
  children,
  locale,
  timeZone,
  direction,
  density,
  motion,
  appearance,
  portalContainer,
  tooltipDelay,
  toasts = false,
  nonce,
  serverAppearance = "light",
  className,
  style,
  ...props
}: AnkvaleProviderProps) {
  const parent = useContext(AnkvaleConfigContext)
  const inheritedMotion = useContext(AnkvaleMotionContext)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const preference = motion ?? parent.motion
  const effectiveMotion = inheritedMotion === "none" ? "none" : preference
  const dark = useMediaQuery(
    "(prefers-color-scheme: dark)",
    serverAppearance === "dark"
  )
  const mode = appearance ?? parent.appearance
  const resolved = mode === "system" ? (dark ? "dark" : "light") : mode
  const config = useMemo<AnkvaleConfig>(
    () => ({
      ...defaultAnkvaleConfig,
      ...parent,
      locale: locale ?? parent.locale,
      timeZone: timeZone ?? parent.timeZone,
      direction: direction ?? parent.direction,
      density: density ?? parent.density,
      motion: effectiveMotion,
      appearance: mode,
      portalContainer: portalContainer ?? root ?? undefined,
      tooltipDelay: tooltipDelay ?? parent.tooltipDelay,
    }),
    [
      parent,
      root,
      locale,
      timeZone,
      direction,
      density,
      effectiveMotion,
      mode,
      portalContainer,
      tooltipDelay,
    ]
  )
  return (
    <AnkvaleConfigContext.Provider value={config}>
      <AnkvaleMotionContext.Provider value={effectiveMotion}>
        <DirectionProvider direction={config.direction}>
          <MotionConfig
            reducedMotion={effectiveMotion === "none" ? "always" : "user"}
            transition={{
              duration: effectiveMotion === "none" ? 0 : 0.18,
              ease: [0.2, 0, 0, 1],
            }}
            nonce={nonce}
          >
            <TooltipProvider delay={config.tooltipDelay}>
              <div
                {...props}
                ref={setRoot}
                data-slot="ankvale-provider"
                lang={config.locale}
                dir={config.direction}
                data-density={config.density}
                data-motion={effectiveMotion === "none" ? "none" : undefined}
                className={cn(
                  "min-w-0",
                  resolved !== "inherit" && resolved,
                  className
                )}
                style={{
                  ...(resolved !== "inherit" ? { colorScheme: resolved } : {}),
                  ...style,
                }}
              >
                {toasts ? <Toaster>{children}</Toaster> : children}
              </div>
            </TooltipProvider>
          </MotionConfig>
        </DirectionProvider>
      </AnkvaleMotionContext.Provider>
    </AnkvaleConfigContext.Provider>
  )
}
export function useAnkvaleConfig() {
  return useContext(AnkvaleConfigContext)
}
