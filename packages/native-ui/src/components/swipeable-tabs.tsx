import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react"
import { View, Animated, ScrollView, Pressable, Text } from "react-native"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export type NativeTabPage = { value: string; label: string; content: ReactNode }
export function SwipeableTabs({
  tabs,
  value,
  defaultValue = tabs[0]?.value ?? "",
  onValueChange,
  height = 300,
  label = "Views",
}: {
  tabs: NativeTabPage[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  height?: number
  label?: string
}) {
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    [width, setWidth] = useState(320),
    ref = useRef<ComponentRef<typeof ScrollView>>(null),
    offset = useRef(new Animated.Value(0)).current
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === selected)
  )
  useEffect(
    () => ref.current?.scrollTo({ x: index * width, animated: true }),
    [index, width]
  )
  return (
    <View
      onLayout={(e) => setWidth(Math.max(1, e.nativeEvent.layout.width))}
      style={{ gap: 12 }}
    >
      <View
        accessibilityRole="tablist"
        accessibilityLabel={label}
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: theme.border,
        }}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            aria-selected={tab.value === selected}
            accessibilityState={{ selected: tab.value === selected }}
            onPress={() => setSelected(tab.value)}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: tab.value === selected ? theme.primary : theme.muted,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
        <Animated.View
          accessibilityElementsHidden
          style={{
            position: "absolute",
            height: 2,
            bottom: 0,
            width: width / Math.max(1, tabs.length),
            backgroundColor: theme.primary,
            transform: [
              { translateX: Animated.divide(offset, Math.max(1, tabs.length)) },
            ],
          }}
        />
      </View>
      <Animated.ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: offset } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e) => {
          const tab =
            tabs[
              Math.max(
                0,
                Math.min(
                  tabs.length - 1,
                  Math.round(e.nativeEvent.contentOffset.x / width)
                )
              )
            ]
          if (tab) setSelected(tab.value)
        }}
        style={{ height }}
      >
        {tabs.map((tab, i) => (
          <View
            key={tab.value}
            aria-hidden={i !== index}
            accessibilityElementsHidden={i !== index}
            importantForAccessibility={
              i === index ? "auto" : "no-hide-descendants"
            }
            style={{ width, height }}
          >
            {tab.content}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  )
}
