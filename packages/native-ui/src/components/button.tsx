import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from "react-native"
import type { ReactNode } from "react"
import { useAnkvaleTheme } from "../theme"
export type NativeButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  loading?: boolean
  label?: string
}
export function Button({
  children,
  variant = "primary",
  loading = false,
  label,
  disabled,
  style,
  ...props
}: NativeButtonProps) {
  const theme = useAnkvaleTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || loading, busy: loading }}
      disabled={disabled || loading}
      style={(state) => [
        {
          minHeight: 44,
          minWidth: 44,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: theme.radius,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor:
            variant === "primary"
              ? theme.primary
              : variant === "secondary"
                ? theme.secondary
                : "transparent",
          opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" ? theme.primaryForeground : theme.primary
          }
        />
      )}
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color:
              variant === "primary"
                ? theme.primaryForeground
                : theme.foreground,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}
