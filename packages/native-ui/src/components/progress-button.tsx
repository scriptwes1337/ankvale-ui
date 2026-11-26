import { View, Text } from "react-native"
import { Button, type NativeButtonProps } from "./button"
import { useAnkvaleTheme } from "../theme"
export function ProgressButton({
  progress,
  children,
  ...props
}: NativeButtonProps & { progress: number }) {
  const theme = useAnkvaleTheme()
  const value = Math.max(0, Math.min(100, progress))
  return (
    <Button
      {...props}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: value,
        text: `${Math.round(value)}%`,
      }}
    >
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          style={{
            color: theme.primaryForeground,
            fontSize: 14,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {children} · {Math.round(value)}%
        </Text>
        <View
          style={{ height: 3, backgroundColor: "#ffffff50", borderRadius: 2 }}
        >
          <View
            style={{
              width: `${value}%`,
              height: 3,
              backgroundColor: theme.primaryForeground,
              borderRadius: 2,
            }}
          />
        </View>
      </View>
    </Button>
  )
}
