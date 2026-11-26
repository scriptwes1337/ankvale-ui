import { useState } from "react"
import { View, Text, Modal, Pressable } from "react-native"
import { Button } from "./button"
import { Autocomplete, type AutocompleteProps } from "./autocomplete"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export function ComboBox({
  options,
  value,
  defaultValue = "",
  onValueChange,
  label,
  placeholder = "Select…",
  disabled,
  displayValue,
}: AutocompleteProps & { displayValue?: string }) {
  const theme = useAnkvaleTheme()
  const [selected, setSelected] = useControllableState(
    value,
    defaultValue,
    onValueChange
  )
  const [open, setOpen] = useState(false)
  return (
    <View>
      <Button
        variant="secondary"
        label={`${label}: ${displayValue ?? options.find((option) => option.value === selected)?.label ?? placeholder}`}
        aria-expanded={open}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        {displayValue ??
          options.find((option) => option.value === selected)?.label ??
          placeholder}
      </Button>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#00000040",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: theme.surface,
              borderRadius: theme.radius,
              padding: 20,
              gap: 16,
            }}
          >
            <Text
              accessibilityRole="header"
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: theme.foreground,
              }}
            >
              {label}
            </Text>
            {open && (
              <Autocomplete
                searchOnly
                autoFocus
                label={`Search ${label}`}
                options={options}
                value={selected}
                onValueChange={(value) => {
                  setSelected(value)
                  setOpen(false)
                }}
              />
            )}
            <Button variant="ghost" onPress={() => setOpen(false)}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  )
}
