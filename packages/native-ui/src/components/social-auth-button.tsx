import { Text } from "react-native"
import { useAnkvaleTheme } from "../theme"
import { Button, type NativeButtonProps } from "./button"
export function SocialAuthButton({
  provider,
  variant = "secondary",
  ...props
}: Omit<NativeButtonProps, "children"> & { provider: string }) {
  const theme = useAnkvaleTheme()
  return (
    <Button variant={variant} {...props}>
      <Text
        style={{
          color:
            variant === "primary" ? theme.primaryForeground : theme.foreground,
        }}
      >
        Continue with {provider}
      </Text>
    </Button>
  )
}
