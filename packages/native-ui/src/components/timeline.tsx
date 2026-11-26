import { View, Text } from "react-native"
import type { ReactNode } from "react"
import { useAnkvaleTheme } from "../theme"
export type NativeTimelineItem = {
  id: string
  title: string
  description?: string
  date?: string
  icon?: ReactNode
  complete?: boolean
}
export function Timeline({ items }: { items: NativeTimelineItem[] }) {
  const theme = useAnkvaleTheme()
  return (
    <View>
      {items.map((item, i) => (
        <View
          key={item.id}
          style={{
            flexDirection: "row",
            gap: 12,
            paddingBottom: i === items.length - 1 ? 0 : 24,
          }}
        >
          <View style={{ width: 24, alignItems: "center" }}>
            {i < items.length - 1 && (
              <View
                style={{
                  position: "absolute",
                  top: 24,
                  bottom: -24,
                  width: 1,
                  backgroundColor: theme.border,
                }}
              />
            )}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: item.complete ? theme.primary : theme.border,
                backgroundColor: item.complete ? theme.primary : theme.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.icon ?? (
                <Text
                  style={{
                    fontSize: 12,
                    color: item.complete
                      ? theme.primaryForeground
                      : theme.muted,
                  }}
                >
                  {item.complete ? "✓" : "•"}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.foreground,
              }}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={{ fontSize: 13, lineHeight: 20, color: theme.muted }}
              >
                {item.description}
              </Text>
            )}
            {item.date && (
              <Text style={{ fontSize: 11, color: theme.muted }}>
                {item.date}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}
