"use client"
import { useState } from "react"
import {
  AnimationProvider,
  Presence,
  AnimatedLayout,
  AnimatedList,
  AnimationGroup,
  ReorderList,
  type ReorderListItem,
} from "@ankvale/ui/components/animation"
import {
  AnkvaleProvider,
  useAnkvaleConfig,
} from "@ankvale/ui/components/ankvale-provider"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ankvale/ui/components/dialog"
function Preferences() {
  const config = useAnkvaleConfig()
  return (
    <div className="space-y-3 rounded-lg border bg-card p-5 text-card-foreground">
      <label className="block space-y-2 text-sm">
        <span>Project name</span>
        <Input defaultValue="Website redesign" />
      </label>
      <p className="text-xs text-muted-foreground">
        {config.locale} · {config.direction} · {config.density}
      </p>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Preview dialog
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Project preferences</DialogTitle>
          <DialogDescription>
            This overlay follows the provider’s appearance and direction.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}
function ProviderExample() {
  const [appearance, setAppearance] = useState<"light" | "dark">("light")
  const [density, setDensity] = useState<"compact" | "spacious">("spacious")
  const [rtl, setRtl] = useState(false)
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setAppearance((v) => (v === "light" ? "dark" : "light"))
          }
        >
          Switch appearance
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setDensity((v) => (v === "compact" ? "spacious" : "compact"))
          }
        >
          Switch density
        </Button>
        <Button
          variant="outline"
          aria-pressed={rtl}
          onClick={() => setRtl((v) => !v)}
        >
          Right to left
        </Button>
      </div>
      <AnkvaleProvider
        appearance={appearance}
        density={density}
        direction={rtl ? "rtl" : "ltr"}
        locale="en-SG"
        timeZone="Asia/Singapore"
      >
        <Preferences />
      </AnkvaleProvider>
    </div>
  )
}
function AnimationExample() {
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [items, setItems] = useState<ReorderListItem[]>([
    { id: "brief", label: "Write the brief" },
    { id: "design", label: "Review the design" },
    { id: "launch", label: "Prepare for launch" },
  ])
  const [disabled, setDisabled] = useState(false)
  return (
    <AnimationProvider disabled={disabled}>
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            Toggle notice
          </Button>
          <Button
            variant="outline"
            aria-pressed={disabled}
            onClick={() => setDisabled((v) => !v)}
          >
            Reduce motion
          </Button>
        </div>
        <Presence present={visible} preset="reveal">
          <div className="rounded-lg border bg-primary/5 p-4 text-sm">
            Your draft is ready for review.
          </div>
        </Presence>
        <AnimationGroup>
          <AnimatedLayout className="rounded-lg border bg-card p-4">
            <Button
              variant="ghost"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              Project details
            </Button>
            {expanded && (
              <p className="mt-3 text-sm text-muted-foreground">
                The homepage and navigation are ready. Share feedback before the
                next review.
              </p>
            )}
          </AnimatedLayout>
        </AnimationGroup>
        <ReorderList
          label="Launch checklist"
          items={items}
          onItemsChange={setItems}
        />
        <AnimatedList
          label="Checklist overview"
          className="space-y-2"
          items={items.map((item) => ({
            id: item.id,
            content: (
              <p className="text-xs text-muted-foreground">{item.label}</p>
            ),
          }))}
        />
      </div>
    </AnimationProvider>
  )
}
const previews = {
  "ankvale-provider": ProviderExample,
  animation: AnimationExample,
}
export function AnimationPreview({ name }: { name: string }) {
  const Preview = previews[name as keyof typeof previews]
  return Preview ? <Preview /> : null
}
