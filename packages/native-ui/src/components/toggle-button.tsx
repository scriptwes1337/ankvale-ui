import { Button, type NativeButtonProps } from "./button"
import { useControllableState } from "../use-controllable-state"
export type ToggleButtonProps = NativeButtonProps & {
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
}
export function ToggleButton({
  selected,
  defaultSelected = false,
  onSelectedChange,
  onPress,
  ...props
}: ToggleButtonProps) {
  const [active, setActive] = useControllableState(
    selected,
    defaultSelected,
    onSelectedChange
  )
  return (
    <Button
      {...props}
      variant={active ? "primary" : "secondary"}
      accessibilityRole="checkbox"
      aria-checked={active}
      accessibilityState={{ checked: active, disabled: !!props.disabled }}
      onPress={(event) => {
        setActive(!active)
        onPress?.(event)
      }}
    />
  )
}
