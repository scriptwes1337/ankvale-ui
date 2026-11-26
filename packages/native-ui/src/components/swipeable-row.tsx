import { useRef, useState, type ReactNode } from "react"
import { View, Animated, PanResponder } from "react-native"
import { Button } from "./button"
import { useAnkvaleTheme } from "../theme"
export function SwipeableRow({
  children,
  actions,
  label = "Row actions",
}: {
  children: ReactNode
  actions: { label: string; onPress: () => void }[]
  label?: string
}) {
  const theme = useAnkvaleTheme()
  const [open, setOpen] = useState(false)
  const position = useRef(new Animated.Value(0)).current
  const width = Math.min(240, actions.length * 88)
  function toggle(next: boolean) {
    setOpen(next)
    Animated.spring(position, {
      toValue: next ? -width : 0,
      useNativeDriver: false,
    }).start()
  }
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponder: (_, state) =>
      Math.abs(state.dx) > 12 && Math.abs(state.dx) > Math.abs(state.dy),
    onPanResponderMove: (_, state) =>
      position.setValue(
        Math.max(-width, Math.min(0, (open ? -width : 0) + state.dx))
      ),
    onPanResponderRelease: (_, state) =>
      toggle((open ? -width : 0) + state.dx < -width / 3),
    onPanResponderTerminate: () => toggle(open),
  })
  return (
    <View
      style={{
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: theme.radius,
      }}
    >
      <View
        aria-hidden={!open}
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? "auto" : "no-hide-descendants"}
        pointerEvents={open ? "auto" : "none"}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width,
          flexDirection: "row",
        }}
      >
        {actions.map((action) => (
          <Button
            key={action.label}
            disabled={!open}
            variant="secondary"
            onPress={() => {
              action.onPress()
              toggle(false)
            }}
            style={{ width: width / actions.length, borderRadius: 0 }}
          >
            {action.label}
          </Button>
        ))}
      </View>
      <Animated.View
        {...gesture.panHandlers}
        style={{
          backgroundColor: theme.surface,
          padding: 12,
          transform: [{ translateX: position }],
        }}
      >
        {children}
        <Button variant="ghost" label={label} onPress={() => toggle(!open)}>
          {open ? "Close actions" : "Actions"}
        </Button>
      </Animated.View>
    </View>
  )
}
