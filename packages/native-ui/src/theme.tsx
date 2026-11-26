import { createContext, useContext, type ReactNode } from "react"
import { useColorScheme } from "react-native"
export const lightTheme = {
  background: "#ffffff",
  surface: "#ffffff",
  foreground: "#191919",
  muted: "#666666",
  border: "#e5e5e5",
  secondary: "#f5f5f5",
  primary: "#0d6efd",
  primaryForeground: "#ffffff",
  accent: "#e8f3ff",
  success: "#287354",
  danger: "#c43535",
  radius: 8,
}
export type NativeTheme = typeof lightTheme
export const darkTheme: NativeTheme = {
  ...lightTheme,
  background: "#171717",
  surface: "#202020",
  foreground: "#f1f1f1",
  muted: "#a3a3a3",
  border: "#363636",
  secondary: "#303030",
  accent: "#25344d",
  success: "#9bd6b4",
  danger: "#ff8c8c",
}
const ThemeContext = createContext<NativeTheme>(lightTheme)
export function AnkvaleProvider({
  children,
  mode = "system",
  theme,
}: {
  children: ReactNode
  mode?: "light" | "dark" | "system"
  theme?: Partial<NativeTheme>
}) {
  const scheme = useColorScheme()
  const selected = mode === "system" ? scheme : mode
  return (
    <ThemeContext.Provider
      value={{ ...(selected === "dark" ? darkTheme : lightTheme), ...theme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
export function useAnkvaleTheme() {
  return useContext(ThemeContext)
}
