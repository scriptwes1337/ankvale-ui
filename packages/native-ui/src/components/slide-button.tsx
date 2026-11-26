import { useRef, useEffect } from "react"
import {
  Animated,
  PanResponder,
  Text,
  View,
  AccessibilityInfo,
} from "react-native"
import { useControllableState } from "../use-controllable-state"
import { useAnkvaleTheme } from "../theme"
export function SlideButton({
  label = "Slide to confirm",
  onComplete,
  disabled = false,
  completed,
  defaultCompleted = false,
  onCompletedChange,
}: {
  label?: string
  onComplete: () => void
  disabled?: boolean
  completed?: boolean
  defaultCompleted?: boolean
  onCompletedChange?: (completed: boolean) => void
}) {
  const theme = useAnkvaleTheme()
  const offset = useRef(new Animated.Value(0)).current
  const width = useRef(280)
  const [complete, setComplete] = useControllableState(
    completed,
    defaultCompleted,
    onCompletedChange
  )
  const confirmed = useRef(complete)
  useEffect(() => {
    confirmed.current = complete
    offset.setValue(complete ? width.current - 52 : 0)
  }, [complete, offset])
  function finish() {
    if (disabled || confirmed.current) return
    confirmed.current = true
    setComplete(true)
    onComplete()
    AccessibilityInfo.announceForAccessibility("Confirmed")
  }
  const gesture = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled && !confirmed.current,
    onMoveShouldSetPanResponder: (_, state) => Math.abs(state.dx) > 8,
    onPanResponderMove: (_, state) =>
      offset.setValue(Math.max(0, Math.min(width.current - 52, state.dx))),
    onPanResponderRelease: (_, state) => {
      if (state.dx >= (width.current - 52) * 0.8) {
        offset.setValue(width.current - 52)
        finish()
      } else
        Animated.spring(offset, { toValue: 0, useNativeDriver: false }).start()
    },
    onPanResponderTerminate: () =>
      Animated.spring(offset, { toValue: 0, useNativeDriver: false }).start(),
  })
  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={complete ? "Confirmed" : label}
      aria-disabled={disabled || complete}
      accessibilityState={{ disabled: disabled || complete }}
      accessibilityActions={[{ name: "activate", label: "Confirm" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate") finish()
      }}
      onLayout={(event) => {
        width.current = event.nativeEvent.layout.width
      }}
      style={{
        height: 52,
        minWidth: 220,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 26,
        backgroundColor: theme.surface,
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          color: theme.muted,
          fontSize: 13,
          paddingHorizontal: 50,
        }}
      >
        {complete ? "Confirmed" : label}
      </Text>
      <Animated.View
        {...gesture.panHandlers}
        style={{
          position: "absolute",
          left: 4,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.primary,
          justifyContent: "center",
          alignItems: "center",
          transform: [{ translateX: offset }],
        }}
      >
        <Text style={{ color: theme.primaryForeground, fontSize: 20 }}>
          {complete ? "✓" : "→"}
        </Text>
      </Animated.View>
    </View>
  )
}
