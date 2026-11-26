import { Text, View } from "react-native"
import { useAnkvaleTheme } from "../theme"
export function Badge({
  children,
  variant = "default",
}: {
  children: string | number
  variant?: "default" | "success" | "danger"
}) {
  const theme = useAnkvaleTheme()
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5,
        backgroundColor: theme.secondary,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color:
            variant === "success"
              ? theme.success
              : variant === "danger"
                ? theme.danger
                : theme.foreground,
        }}
      >
        {children}
      </Text>
    </View>
  )
}
