import { View, Text, type ViewProps } from "react-native"
import type { ReactNode } from "react"
import { useAnkvaleTheme } from "../theme"
export function Widget({
  title,
  actions,
  footer,
  children,
  style,
  ...props
}: ViewProps & { title: string; actions?: ReactNode; footer?: ReactNode }) {
  const theme = useAnkvaleTheme()
  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: theme.radius,
          backgroundColor: theme.surface,
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: theme.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{ fontSize: 14, fontWeight: "600", color: theme.foreground }}
        >
          {title}
        </Text>
        {actions}
      </View>
      <View style={{ padding: 16 }}>{children}</View>
      {footer && (
        <View
          style={{ padding: 12, borderTopWidth: 1, borderColor: theme.border }}
        >
          {typeof footer === "string" ? (
            <Text style={{ fontSize: 12, color: theme.muted }}>{footer}</Text>
          ) : (
            footer
          )}
        </View>
      )}
    </View>
  )
}
