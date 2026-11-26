import {
  useRef,
  useState,
  useEffect,
  type ComponentRef,
  type ReactNode,
} from "react"
import { View, ScrollView, Text } from "react-native"
import { Button } from "./button"
import { useAnkvaleTheme } from "../theme"
export function Carousel({
  items,
  label = "Carousel",
  height = 180,
}: {
  items: ReactNode[]
  label?: string
  height?: number
}) {
  const theme = useAnkvaleTheme()
  const ref = useRef<ComponentRef<typeof ScrollView>>(null),
    [width, setWidth] = useState(320)
  const [index, setIndex] = useState(0)
  const activeIndex = Math.max(0, Math.min(items.length - 1, index))
  useEffect(
    () => ref.current?.scrollTo({ x: activeIndex * width, animated: false }),
    [width, activeIndex]
  )
  function go(next: number) {
    const current = Math.max(0, Math.min(items.length - 1, next))
    setIndex(current)
    ref.current?.scrollTo({ x: current * width, animated: true })
  }
  return (
    <View
      accessibilityLabel={label}
      style={{ gap: 12 }}
      onLayout={(event) => {
        setWidth(Math.max(1, event.nativeEvent.layout.width))
      }}
    >
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        style={{ height }}
      >
        {items.map((item, i) => (
          <View
            key={i}
            aria-hidden={i !== activeIndex}
            accessibilityElementsHidden={i !== activeIndex}
            importantForAccessibility={
              i === activeIndex ? "auto" : "no-hide-descendants"
            }
            style={{
              width: width,
              height,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item}
          </View>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Button
          variant="secondary"
          label="Previous slide"
          disabled={activeIndex <= 0}
          onPress={() => go(activeIndex - 1)}
        >
          ←
        </Button>
        <Text style={{ fontSize: 12, color: theme.muted }}>
          {items.length ? activeIndex + 1 : 0} / {items.length}
        </Text>
        <Button
          variant="secondary"
          label="Next slide"
          disabled={activeIndex >= items.length - 1}
          onPress={() => go(activeIndex + 1)}
        >
          →
        </Button>
      </View>
    </View>
  )
}
