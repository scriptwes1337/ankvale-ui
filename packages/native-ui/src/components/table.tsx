import { useMemo, useState, type ReactNode } from "react"
import { ScrollView, View, Text, Pressable } from "react-native"
import { useAnkvaleTheme } from "../theme"
export type NativeTableColumn<T> = {
  id: string
  title: string
  accessor: (row: T) => string | number
  render?: (row: T) => ReactNode
  width?: number
  sortable?: boolean
}
export function Table<T>({
  data,
  columns,
  getRowId,
  label = "Table",
  onRowPress,
}: {
  data: T[]
  columns: NativeTableColumn<T>[]
  getRowId: (row: T) => string
  label?: string
  onRowPress?: (row: T) => void
}) {
  const theme = useAnkvaleTheme()
  const [sort, setSort] = useState<{ id: string; descending: boolean } | null>(
    null
  )
  const rows = useMemo(() => {
    const column = columns.find((item) => item.id === sort?.id)
    return column && sort
      ? [...data].sort(
          (a, b) =>
            String(column.accessor(a)).localeCompare(
              String(column.accessor(b)),
              undefined,
              { numeric: true }
            ) * (sort.descending ? -1 : 1)
        )
      : data
  }, [data, columns, sort])
  return (
    <ScrollView horizontal accessibilityLabel={label}>
      <View
        style={{
          minWidth: columns.reduce(
            (total, column) => total + (column.width ?? 140),
            0
          ),
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: theme.radius,
          backgroundColor: theme.surface,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderColor: theme.border,
          }}
        >
          {columns.map((column) => (
            <Pressable
              key={column.id}
              accessibilityRole="button"
              accessibilityLabel={`Sort ${column.title}`}
              disabled={column.sortable === false}
              onPress={() =>
                setSort({
                  id: column.id,
                  descending: sort?.id === column.id ? !sort.descending : false,
                })
              }
              style={{
                width: column.width ?? 140,
                padding: 12,
                minHeight: 44,
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: theme.muted }}
              >
                {column.title}
                {sort?.id === column.id ? (sort.descending ? " ↓" : " ↑") : ""}
              </Text>
            </Pressable>
          ))}
        </View>
        {rows.map((row) => (
          <Pressable
            key={getRowId(row)}
            accessibilityRole={onRowPress ? "button" : undefined}
            disabled={!onRowPress}
            onPress={() => onRowPress?.(row)}
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: theme.border,
            }}
          >
            {columns.map((column) => (
              <View
                key={column.id}
                style={{
                  width: column.width ?? 140,
                  padding: 12,
                  minHeight: 44,
                  justifyContent: "center",
                }}
              >
                {column.render ? (
                  column.render(row)
                ) : (
                  <Text style={{ fontSize: 13, color: theme.foreground }}>
                    {column.accessor(row)}
                  </Text>
                )}
              </View>
            ))}
          </Pressable>
        ))}
        {!rows.length && (
          <Text
            style={{ padding: 24, color: theme.muted, textAlign: "center" }}
          >
            No results.
          </Text>
        )}
      </View>
    </ScrollView>
  )
}
