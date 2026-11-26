import { Button, type NativeButtonProps } from "./button"
export function FAB({ style, ...props }: NativeButtonProps) {
  return (
    <Button
      {...props}
      style={(state) => [
        { borderRadius: 28, minWidth: 56, minHeight: 56 },
        typeof style === "function" ? style(state) : style,
      ]}
    />
  )
}
