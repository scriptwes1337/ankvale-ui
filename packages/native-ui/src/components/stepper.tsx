import { View, Text, Pressable } from "react-native"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export type NativeStep = {
  id: string
  title: string
  description?: string
  disabled?: boolean
}
export function Stepper({
  steps,
  value,
  defaultValue = steps[0]?.id ?? "",
  onValueChange,
  orientation = "horizontal",
  allowFuture = false,
}: {
  steps: NativeStep[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  allowFuture?: boolean
}) {
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    index = steps.findIndex((step) => step.id === selected)
  return (
    <View
      accessibilityLabel="Progress"
      style={{
        flexDirection: orientation === "horizontal" ? "row" : "column",
        gap: 12,
      }}
    >
      {steps.map((step, i) => (
        <Pressable
          key={step.id}
          accessibilityRole="button"
          accessibilityLabel={`Step ${i + 1} of ${steps.length}: ${step.title}${i < index ? ", complete" : ""}`}
          aria-selected={step.id === selected}
          accessibilityState={{
            selected: step.id === selected,
            disabled: step.disabled || (!allowFuture && i > index),
          }}
          disabled={step.disabled || (!allowFuture && i > index)}
          onPress={() => setSelected(step.id)}
          style={{
            flex: orientation === "horizontal" ? 1 : undefined,
            minHeight: 44,
            flexDirection: orientation === "vertical" ? "row" : "column",
            alignItems: orientation === "vertical" ? "center" : "flex-start",
            gap: 8,
            opacity: step.disabled ? 0.4 : 1,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: i <= index ? theme.primary : theme.secondary,
            }}
          >
            <Text
              style={{
                color: i <= index ? theme.primaryForeground : theme.muted,
              }}
            >
              {i < index ? "✓" : i + 1}
            </Text>
          </View>
          <View style={{ gap: 4, flexShrink: 1 }}>
            <Text
              style={{
                color: theme.foreground,
                fontWeight: step.id === selected ? "600" : "400",
              }}
            >
              {step.title}
            </Text>
            {step.description && (
              <Text style={{ color: theme.muted, fontSize: 12 }}>
                {step.description}
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  )
}
