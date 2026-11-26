import { useEffect, useState } from "react"
import { View, Text, TextInput, Pressable, FlatList } from "react-native"
import type { NativeOption } from "./toggle-button-group"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
export type AutocompleteProps = {
  options: NativeOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label: string
  placeholder?: string
  disabled?: boolean
  searchOnly?: boolean
  autoFocus?: boolean
}
export function Autocomplete({
  options,
  value,
  defaultValue = "",
  onValueChange,
  label,
  placeholder = "Search…",
  disabled,
  searchOnly = false,
  autoFocus = false,
}: AutocompleteProps) {
  const theme = useAnkvaleTheme(),
    [selected, setSelected] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    [query, setQuery] = useState(
      searchOnly
        ? ""
        : (options.find((option) => option.value === selected)?.label ?? "")
    ),
    [open, setOpen] = useState(searchOnly)
  const selectedLabel =
    options.find((option) => option.value === selected)?.label ?? ""
  useEffect(() => {
    if (!searchOnly) setQuery(selectedLabel)
  }, [selectedLabel, searchOnly])
  const filtered = options.filter((option) =>
    `${option.label} ${option.value}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, color: theme.foreground }}>{label}</Text>
      <TextInput
        autoFocus={autoFocus}
        accessibilityLabel={label}
        accessibilityRole="combobox"
        aria-expanded={open}
        accessibilityState={{ expanded: open, disabled }}
        value={query}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        onFocus={() => setOpen(true)}
        onChangeText={(text) => {
          setQuery(text)
          setOpen(true)
        }}
        style={{
          minHeight: 44,
          borderRadius: theme.radius,
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 12,
          fontSize: 14,
          color: theme.foreground,
          backgroundColor: theme.surface,
        }}
      />
      {open && !disabled && (
        <FlatList
          data={filtered}
          keyExtractor={(option) => option.value}
          initialNumToRender={12}
          windowSize={5}
          getItemLayout={(_, index) => ({
            length: 44,
            offset: 44 * index,
            index,
          })}
          keyboardShouldPersistTaps="handled"
          style={{
            maxHeight: 220,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: theme.radius,
            backgroundColor: theme.surface,
          }}
          renderItem={({ item: option }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={option.label}
              aria-pressed={selected === option.value}
              accessibilityState={{
                selected: selected === option.value,
                disabled: option.disabled,
              }}
              disabled={option.disabled}
              onPress={() => {
                setSelected(option.value)
                setQuery(searchOnly ? "" : option.label)
                setOpen(searchOnly)
              }}
              style={{
                height: 44,
                paddingHorizontal: 12,
                justifyContent: "center",
                opacity: option.disabled ? 0.4 : 1,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, color: theme.foreground }}
              >
                {option.label}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ padding: 12, fontSize: 13, color: theme.muted }}>
              No results.
            </Text>
          }
        />
      )}
    </View>
  )
}
