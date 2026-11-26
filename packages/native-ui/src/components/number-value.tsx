import { useEffect, useRef, useState } from "react"
import { Text, Animated, AccessibilityInfo, type TextProps } from "react-native"
import { useAnkvaleTheme } from "../theme"
export function NumberValue({
  value,
  format,
  locale = "en-US",
  duration = 300,
  style,
  ...props
}: TextProps & {
  value: number
  format?: Intl.NumberFormatOptions
  locale?: string
  duration?: number
}) {
  const theme = useAnkvaleTheme()
  const animated = useRef(new Animated.Value(value)).current
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    let canceled = false
    const listener = animated.addListener(({ value }) => setDisplay(value))
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (canceled) return
      if (reduced || duration <= 0) {
        animated.setValue(value)
        return
      }
      Animated.timing(animated, {
        toValue: value,
        duration,
        useNativeDriver: false,
      }).start()
    })
    return () => {
      canceled = true
      animated.stopAnimation()
      animated.removeListener(listener)
    }
  }, [animated, value, duration])
  const formatter = new Intl.NumberFormat(locale, format)
  return (
    <Text
      accessibilityLabel={formatter.format(value)}
      style={[
        {
          fontSize: 28,
          fontWeight: "600",
          color: theme.foreground,
          fontVariant: ["tabular-nums"],
        },
        style,
      ]}
      {...props}
    >
      {formatter.format(display)}
    </Text>
  )
}
