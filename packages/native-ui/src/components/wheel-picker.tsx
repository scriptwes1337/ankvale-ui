import { useEffect, useRef, type ComponentRef } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import type { NativeOption } from "./toggle-button-group"
import { useControllableState } from "../use-controllable-state"
import { useAnkvaleTheme } from "../theme"
export function WheelPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  label = "Value",
  itemHeight = 40,
  visibleItems = 5,
  disabled,
}: {
  options: NativeOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: string
  itemHeight?: number
  visibleItems?: number
  disabled?: boolean
}) {
  const theme = useAnkvaleTheme()
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue ?? options.find((option) => !option.disabled)?.value ?? "",
    onValueChange
  )
  const ref = useRef<ComponentRef<typeof ScrollView>>(null)
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === selected)
  )
  const padding = Math.floor(visibleItems / 2) * itemHeight
  useEffect(
    () => ref.current?.scrollTo({ y: index * itemHeight, animated: false }),
    [index, itemHeight]
  )
  function choose(index: number) {
    const option = options[Math.max(0, Math.min(options.length - 1, index))]
    if (option && !option.disabled && !disabled) setSelected(option.value)
    else
      ref.current?.scrollTo({
        y:
          Math.max(
            0,
            options.findIndex((item) => item.value === selected)
          ) * itemHeight,
        animated: true,
      })
  }
  return (
    <View style={{ height: visibleItems * itemHeight, minWidth: 64, flex: 1 }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: padding,
          height: itemHeight,
          left: 0,
          right: 0,
          borderRadius: theme.radius,
          backgroundColor: theme.accent,
        }}
      />
      <ScrollView
        ref={ref}
        scrollEnabled={!disabled}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: padding }}
        onMomentumScrollEnd={(event) =>
          choose(Math.round(event.nativeEvent.contentOffset.y / itemHeight))
        }
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: options[index]?.label ?? "" }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        accessibilityState={{ disabled }}
        onAccessibilityAction={(event) => {
          if (disabled) return
          const direction =
            event.nativeEvent.actionName === "increment" ? 1 : -1
          let next = index + direction
          while (next >= 0 && next < options.length && options[next]?.disabled)
            next += direction
          if (next >= 0 && next < options.length) choose(next)
        }}
      >
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            aria-selected={option.value === selected}
            accessibilityState={{
              selected: option.value === selected,
              disabled: disabled || option.disabled,
            }}
            disabled={disabled || option.disabled}
            onPress={() => setSelected(option.value)}
            style={{
              height: itemHeight,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: option.value === selected ? theme.primary : theme.muted,
                opacity: option.disabled ? 0.4 : 1,
                fontWeight: option.value === selected ? "600" : "400",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
