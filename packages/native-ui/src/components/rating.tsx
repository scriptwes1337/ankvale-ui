import { View, Pressable, Text } from "react-native"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  label = "Rating",
  readOnly = false,
  disabled = false,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  label?: string
  readOnly?: boolean
  disabled?: boolean
}) {
  const theme = useAnkvaleTheme()
  const [rating, setRating] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const count = Math.max(1, Math.min(10, Math.floor(max)))
  return (
    <View
      accessibilityRole={readOnly ? "image" : "radiogroup"}
      accessibilityLabel={readOnly ? `${label}: ${rating} of ${count}` : label}
      style={{ flexDirection: "row" }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Pressable
          key={i}
          accessible={!readOnly}
          aria-hidden={readOnly || undefined}
          accessibilityElementsHidden={readOnly}
          importantForAccessibility={readOnly ? "no-hide-descendants" : "auto"}
          accessibilityRole="radio"
          accessibilityLabel={`${i + 1} stars`}
          aria-checked={rating === i + 1}
          accessibilityState={{
            checked: rating === i + 1,
            disabled: disabled || readOnly,
          }}
          disabled={disabled || readOnly}
          onPress={() => setRating(i + 1)}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 26,
              color: i < rating ? theme.primary : theme.muted,
            }}
          >
            {i < rating ? "★" : "☆"}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
