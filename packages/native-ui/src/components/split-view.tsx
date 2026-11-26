import { useState, type ReactNode } from "react"
import { View, useWindowDimensions } from "react-native"
import { Button } from "./button"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export function SplitView({
  sidebar,
  children,
  breakpoint = 768,
  sidebarWidth = 280,
  detailOpen,
  defaultDetailOpen = false,
  onDetailOpenChange,
  backLabel = "Back",
}: {
  sidebar: ReactNode
  children: ReactNode
  breakpoint?: number
  sidebarWidth?: number
  detailOpen?: boolean
  defaultDetailOpen?: boolean
  onDetailOpenChange?: (open: boolean) => void
  backLabel?: string
}) {
  const theme = useAnkvaleTheme(),
    window = useWindowDimensions(),
    [layoutWidth, setLayoutWidth] = useState(window.width),
    [open, setOpen] = useControllableState(
      detailOpen,
      defaultDetailOpen,
      onDetailOpenChange
    )
  const wide = Math.min(layoutWidth, window.width) >= breakpoint
  return (
    <View
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      style={{
        flex: 1,
        flexDirection: wide ? "row" : "column",
        minHeight: 240,
      }}
    >
      {(wide || !open) && (
        <View
          style={{
            width: wide ? sidebarWidth : undefined,
            flex: wide ? undefined : 1,
            borderRightWidth: wide ? 1 : 0,
            borderColor: theme.border,
          }}
        >
          {sidebar}
          {!wide && (
            <Button variant="ghost" onPress={() => setOpen(true)}>
              Open details
            </Button>
          )}
        </View>
      )}
      {(wide || open) && (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          {!wide && (
            <Button variant="ghost" onPress={() => setOpen(false)}>
              {backLabel}
            </Button>
          )}
          {children}
        </View>
      )}
    </View>
  )
}
