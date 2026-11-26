import { Loader } from "@ankvale/ui/components/loader"
export function ChatLoader({
  label = "Assistant is responding",
}: {
  label?: string
}) {
  return (
    <Loader
      data-slot="chat-loader"
      variant="dots"
      label={label}
      className="px-3 py-4 text-muted-foreground"
    />
  )
}
