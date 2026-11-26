import { Text, View } from "react-native"
import { Button } from "./button"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export function NumberStepper({
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label = "Quantity",
  disabled,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  disabled?: boolean
}) {
  const theme = useAnkvaleTheme()
  const [number, setNumber] = useControllableState(
    value,
    Math.min(max, Math.max(min, defaultValue)),
    onValueChange
  )
  const amount = step > 0 ? step : 1
  const update = (next: number) =>
    setNumber(Math.min(max, Math.max(min, Number(next.toFixed(10)))))
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Button
        variant="secondary"
        label={`Decrease ${label}`}
        disabled={disabled || number <= min}
        onPress={() => update(number - amount)}
      >
        −
      </Button>
      <Text
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: number }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (!disabled)
            update(
              number +
                (event.nativeEvent.actionName === "increment"
                  ? amount
                  : -amount)
            )
        }}
        style={{
          minWidth: 48,
          textAlign: "center",
          fontSize: 16,
          color: theme.foreground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {number}
      </Text>
      <Button
        variant="secondary"
        label={`Increase ${label}`}
        disabled={disabled || number >= max}
        onPress={() => update(number + amount)}
      >
        +
      </Button>
    </View>
  )
}
