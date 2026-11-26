import { useEffect, useRef, useState, type ReactNode } from "react"
import { Animated, View, Text } from "react-native"
import { Button, type NativeButtonProps } from "./button"
import { useAnkvaleTheme } from "../theme"
import { useReducedMotion } from "../hooks/use-reduced-motion"
import { useControllableState } from "../use-controllable-state"
export function MorphButton({
  icon,
  children,
  onPress,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  variant = "primary",
  ...props
}: NativeButtonProps & {
  icon: ReactNode
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}) {
  const [active, setActive] = useControllableState(
      expanded,
      defaultExpanded,
      onExpandedChange
    ),
    [labelWidth, setLabelWidth] = useState(0),
    progress = useRef(new Animated.Value(active ? 1 : 0)).current
  const theme = useAnkvaleTheme(),
    reduced = useReducedMotion()
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: reduced ? 0 : 220,
      useNativeDriver: false,
    })
    animation.start()
    return () => animation.stop()
  }, [active, progress, reduced])
  const color =
    variant === "primary" ? theme.primaryForeground : theme.foreground
  return (
    <Button
      {...props}
      variant={variant}
      onPress={(event) => {
        setActive(!active)
        onPress?.(event)
      }}
      aria-expanded={active}
      accessibilityState={{ expanded: active }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text
          accessible={false}
          aria-hidden
          style={{ position: "absolute", opacity: 0, fontWeight: "600" }}
          onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}
        >
          {children}
        </Text>
        <Animated.View
          style={{
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, labelWidth + 8],
            }),
            opacity: progress,
            overflow: "hidden",
          }}
        >
          <Text
            numberOfLines={1}
            style={{ color, fontWeight: "600", marginLeft: 8 }}
          >
            {children}
          </Text>
        </Animated.View>
      </View>
    </Button>
  )
}
