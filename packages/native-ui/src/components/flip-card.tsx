import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Animated,
  Pressable,
  View,
  Text,
  AccessibilityInfo,
} from "react-native"
import { useAnkvaleTheme } from "../theme"
export function FlipCard({
  front,
  back,
  label = "Flip card",
  height = 180,
}: {
  front: ReactNode
  back: ReactNode
  label?: string
  height?: number
}) {
  const theme = useAnkvaleTheme(),
    [flipped, setFlipped] = useState(false),
    [reduced, setReduced] = useState(false),
    rotation = useRef(new Animated.Value(0)).current
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced)
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced
    )
    return () => sub.remove()
  }, [])
  useEffect(() => {
    const animation = Animated.timing(rotation, {
      toValue: flipped ? 180 : 0,
      duration: reduced ? 0 : 280,
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [flipped, reduced, rotation])
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Shows the other side"
      aria-expanded={flipped}
      accessibilityState={{ expanded: flipped }}
      onPress={() => setFlipped(!flipped)}
      style={{ height }}
    >
      {[front, back].map((face, i) => (
        <Animated.View
          key={i}
          aria-hidden={i === 0 ? flipped : !flipped}
          accessibilityElementsHidden={i === 0 ? flipped : !flipped}
          importantForAccessibility={
            (i === 0 ? flipped : !flipped) ? "no-hide-descendants" : "auto"
          }
          style={{
            position: "absolute",
            inset: 0,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: theme.radius,
            padding: 20,
            backgroundColor: theme.surface,
            alignItems: "center",
            justifyContent: "center",
            backfaceVisibility: "hidden",
            transform: [
              { perspective: 1000 },
              {
                rotateY: rotation.interpolate({
                  inputRange: [0, 180],
                  outputRange:
                    i === 0 ? ["0deg", "180deg"] : ["180deg", "360deg"],
                }),
              },
            ],
          }}
        >
          {typeof face === "string" ? (
            <Text style={{ fontSize: 16, color: theme.foreground }}>
              {face}
            </Text>
          ) : (
            <View>{face}</View>
          )}
        </Animated.View>
      ))}
    </Pressable>
  )
}
