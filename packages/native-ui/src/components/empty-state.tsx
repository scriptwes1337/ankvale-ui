import { View, Text } from "react-native"
import type { ReactNode } from "react"
import { useAnkvaleTheme } from "../theme"
export function EmptyState({
  title = "No results",
  description,
  icon,
  action,
}: {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  const theme = useAnkvaleTheme()
  return (
    <View
      style={{
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {icon}
      <Text
        accessibilityRole="header"
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.foreground,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: theme.muted,
            textAlign: "center",
          }}
        >
          {description}
        </Text>
      )}
      {action}
    </View>
  )
}
