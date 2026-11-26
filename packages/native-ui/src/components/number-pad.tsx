import { View, Text } from "react-native"
import { Button } from "./button"
import { useControllableState } from "../use-controllable-state"
import { useAnkvaleTheme } from "../theme"
export function NumberPad({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  secure = false,
  decimal = false,
  maxLength = 12,
  label = "Number",
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  secure?: boolean
  decimal?: boolean
  maxLength?: number
  label?: string
}) {
  const theme = useAnkvaleTheme()
  const [number, setNumber] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const keys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    decimal ? "." : "",
    "0",
    "⌫",
  ]
  return (
    <View style={{ maxWidth: 300, gap: 12 }}>
      <Text
        accessibilityLabel={`${label}: ${secure ? `${number.length} digits entered` : number || "empty"}`}
        style={{
          minHeight: 36,
          fontSize: 24,
          textAlign: "center",
          color: theme.foreground,
        }}
      >
        {secure ? "•".repeat(number.length) : number}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {keys.map((key, index) => (
          <Button
            key={index}
            variant="secondary"
            style={{ width: "30%", minHeight: 48 }}
            label={key === "⌫" ? "Delete digit" : key || "Blank"}
            disabled={
              !key ||
              (key !== "⌫" &&
                (number.length >= maxLength ||
                  (key === "." && number.includes("."))))
            }
            onPress={() =>
              setNumber(key === "⌫" ? number.slice(0, -1) : number + key)
            }
          >
            {key}
          </Button>
        ))}
      </View>
      {onSubmit && (
        <Button disabled={!number} onPress={() => onSubmit(number)}>
          Continue
        </Button>
      )}
    </View>
  )
}
