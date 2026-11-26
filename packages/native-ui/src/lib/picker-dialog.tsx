import { useState, type ReactNode } from "react"
import { Modal, View, Text, ScrollView } from "react-native"
import { Button } from "../components/button"
import { useAnkvaleTheme } from "../theme"
export function PickerDialog({
  label,
  summary,
  children,
  disabled,
}: {
  label: string
  summary?: string
  children: ReactNode
  disabled?: boolean
}) {
  const theme = useAnkvaleTheme(),
    [open, setOpen] = useState(false)
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: theme.foreground }}>{label}</Text>
      <Button
        variant="secondary"
        disabled={disabled}
        label={`${label}: ${summary || "Choose"}`}
        onPress={() => setOpen(true)}
      >
        {summary || "Choose"}
      </Button>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 20,
              paddingBottom: 32,
              maxHeight: "90%",
              gap: 16,
            }}
          >
            <Text
              accessibilityRole="header"
              style={{
                color: theme.foreground,
                fontSize: 20,
                fontWeight: "600",
              }}
            >
              {label}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            <Button onPress={() => setOpen(false)}>Done</Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}
