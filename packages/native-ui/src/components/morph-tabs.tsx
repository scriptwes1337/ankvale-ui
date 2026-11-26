import { useReducedMotion } from "../hooks/use-reduced-motion"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Animated, View, Text, Pressable } from "react-native"
import { useControllableState } from "../use-controllable-state"
import { useAnkvaleTheme } from "../theme"
export type NativeMorphTab = {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}
export function MorphTabs({
  tabs,
  value,
  defaultValue = tabs[0]?.value ?? "",
  onValueChange,
  label = "Navigation",
}: {
  tabs: NativeMorphTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
}) {
  const reduced = useReducedMotion()
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    [width, setWidth] = useState(0),
    position = useRef(new Animated.Value(0)).current
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === selected)
  )
  useEffect(() => {
    if (reduced) {
      position.setValue((index * width) / Math.max(1, tabs.length))
      return
    }
    const animation = Animated.spring(position, {
      toValue: (index * width) / Math.max(1, tabs.length),
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
    })
    animation.start()
    return () => animation.stop()
  }, [index, width, tabs.length, position, reduced])
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: "row",
        borderRadius: theme.radius,
        backgroundColor: theme.secondary,
        overflow: "hidden",
      }}
    >
      <Animated.View
        accessibilityElementsHidden
        style={{
          position: "absolute",
          height: "100%",
          width: width / Math.max(1, tabs.length),
          backgroundColor: theme.accent,
          borderRadius: theme.radius,
          transform: [{ translateX: position }],
        }}
      />
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          aria-selected={tab.value === selected}
          accessibilityState={{
            selected: tab.value === selected,
            disabled: tab.disabled,
          }}
          disabled={tab.disabled}
          onPress={() => setSelected(tab.value)}
          style={{
            flex: 1,
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            opacity: tab.disabled ? 0.4 : 1,
          }}
        >
          {tab.icon}
          <Text
            style={{
              color: tab.value === selected ? theme.primary : theme.muted,
              fontSize: 12,
            }}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
