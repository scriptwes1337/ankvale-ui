"use client"
import queryPreviewNames from "@/lib/query-preview-names.json"
import assetPreviewNames from "@/lib/asset-preview-names.json"
import enhancementPreviewNames from "@/lib/enhancement-preview-names.json"
import { blockDefinitions } from "@/lib/block-catalog"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { systemPreviewNames } from "@/lib/system-preview-names"
import { expansionPreviewNames } from "@/lib/expansion-preview-names"
import { additionalPreviewNames } from "@/lib/preview-names"
import {
  SquaresFourIcon,
  PaletteIcon,
  CodeIcon,
  MagnifyingGlassIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  DotsThreeIcon,
  BellIcon,
  StarIcon,
  BookOpenIcon,
  CaretRightIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Badge } from "@ankvale/ui/components/badge"
import { Input } from "@ankvale/ui/components/input"
import { Label } from "@ankvale/ui/components/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@ankvale/ui/components/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@ankvale/ui/components/dialog"
import { Switch } from "@ankvale/ui/components/switch"
import { Checkbox } from "@ankvale/ui/components/checkbox"
import { Slider } from "@ankvale/ui/components/slider"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@ankvale/ui/components/tabs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@ankvale/ui/components/dropdown-menu"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ankvale/ui/components/accordion"
import { Avatar, AvatarFallback } from "@ankvale/ui/components/avatar"
import { Progress } from "@ankvale/ui/components/progress"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@ankvale/ui/components/tooltip"
import { Textarea } from "@ankvale/ui/components/textarea"
import { Separator } from "@ankvale/ui/components/separator"
import { Skeleton } from "@ankvale/ui/components/skeleton"
import { Toggle } from "@ankvale/ui/components/toggle"
import { cn } from "@ankvale/ui/lib/utils"

export type ComponentSource = { name: string; title: string; source: string }
type View = "components" | "foundations" | "installation"

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string
  label?: string
}) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "error">(
    "idle"
  )
  React.useEffect(() => {
    if (status === "idle") return
    const timer = setTimeout(() => setStatus("idle"), 2000)
    return () => clearTimeout(timer)
  }, [status])
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        navigator.clipboard
          .writeText(value)
          .then(() => setStatus("copied"))
          .catch(() => setStatus("error"))
      }
    >
      {status === "copied" ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite">
        {status === "copied"
          ? "Copied"
          : status === "error"
            ? "Copy failed"
            : label}
      </span>
    </Button>
  )
}

function ProjectDialog() {
  const [name, setName] = React.useState("")
  const [projects, setProjects] = React.useState<string[]>([])
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" />}>
          <PlusIcon /> New project
        </DialogTrigger>
        <DialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim()) return
              setProjects([...projects, name.trim()])
              setName("")
              setOpen(false)
            }}
            className="grid gap-6"
          >
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>
                Create a project to keep your work together.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Website redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={!name.trim()}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {projects.length
          ? `Created “${projects.at(-1)}”`
          : "No projects created."}
      </p>
    </div>
  )
}

function ButtonsDemo() {
  return (
    <div className="flex max-w-sm flex-wrap items-center justify-center gap-3">
      <Button>Get started</Button>
      <Button variant="outline">Learn more</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}
function InputsDemo() {
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Label htmlFor="demo-email">Email address</Label>
      <Input id="demo-email" type="email" placeholder="you@example.com" />
      <Input
        aria-label="Disabled input example"
        placeholder="Your name"
        disabled
      />
    </div>
  )
}
function CardDemo() {
  const [saved, setSaved] = React.useState(false)
  return (
    <Card className="w-full max-w-xs" size="sm">
      <CardHeader>
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <BookOpenIcon size={20} />
        </div>
        <CardTitle>A place for your ideas</CardTitle>
        <CardDescription>Project overview</CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Your workspace</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={saved ? "Unsave card" : "Save card"}
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        >
          <StarIcon weight={saved ? "fill" : "regular"} />
        </Button>
      </CardFooter>
    </Card>
  )
}
function BadgesDemo() {
  return (
    <div className="flex max-w-xs flex-wrap justify-center gap-3">
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="info">In progress</Badge>
      <Badge variant="success">
        <CheckIcon /> Completed
      </Badge>
      <Badge variant="warning">In review</Badge>
      <Badge variant="outline">Archived</Badge>
      <Badge variant="destructive">Needs attention</Badge>
    </div>
  )
}
function ControlsDemo() {
  const [volume, setVolume] = React.useState<number | readonly number[]>(64)
  return (
    <div className="grid w-full max-w-xs gap-6">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="notifications">Notifications</Label>
        <Switch id="notifications" defaultChecked />
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="keep-focus" defaultChecked />
        <Label htmlFor="keep-focus">Keep things focused</Label>
      </div>
      <div className="grid gap-3">
        <div className="flex justify-between text-sm">
          <Label id="volume-label">Volume</Label>
          <span className="text-muted-foreground">{volume}%</span>
        </div>
        <Slider
          aria-labelledby="volume-label"
          value={volume}
          onValueChange={setVolume}
        />
      </div>
    </div>
  )
}
function TabsDemo() {
  return (
    <Tabs defaultValue="design" className="w-full max-w-xs">
      <TabsList className="w-full">
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="develop">Develop</TabsTrigger>
        <TabsTrigger value="ship">Ship</TabsTrigger>
      </TabsList>
      <TabsContent
        value="design"
        className="pt-4 text-center text-muted-foreground"
      >
        Design files and specifications.
      </TabsContent>
      <TabsContent
        value="develop"
        className="pt-4 text-center text-muted-foreground"
      >
        Development tasks and pull requests.
      </TabsContent>
      <TabsContent
        value="ship"
        className="pt-4 text-center text-muted-foreground"
      >
        Release checklist and deployment status.
      </TabsContent>
    </Tabs>
  )
}
function MenuDemo() {
  const [choice, setChoice] = React.useState("Choose an action.")
  return (
    <div className="grid justify-items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Project actions <DotsThreeIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setChoice("Project duplicated.")}>
            <CopyIcon /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setChoice("Project added to favorites.")}
          >
            <StarIcon /> Add to favorites
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setChoice("Project archived.")}>
            Archive project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {choice}
      </p>
    </div>
  )
}
function AccordionDemo() {
  return (
    <Accordion className="w-full max-w-sm">
      <AccordionItem value="one">
        <AccordionTrigger>What is ankvale-ui?</AccordionTrigger>
        <AccordionContent>
          A shadcn component library built on Base UI.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Can I make it my own?</AccordionTrigger>
        <AccordionContent>
          Yes. Edit the component source in your project.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
function PeopleDemo() {
  return (
    <div className="flex items-center -space-x-2">
      {["AL", "JK", "MN", "+3"].map((name, i) => (
        <Avatar key={name} className="size-11 border-3 border-card">
          <AvatarFallback
            className={cn(
              "text-sm font-medium",
              i === 0
                ? "bg-accent text-accent-foreground"
                : i === 1
                  ? "bg-success-surface text-success"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {name}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}
function ProgressDemo() {
  const [value, setValue] = React.useState(68)
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="flex justify-between text-sm">
        <span>Making progress</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} aria-label="Project progress" />
      <Button
        variant="ghost"
        size="sm"
        className="justify-self-end"
        onClick={() => setValue(value >= 100 ? 0 : Math.min(value + 16, 100))}
      >
        {value >= 100 ? "Start again" : "Complete a task"}
      </Button>
    </div>
  )
}
function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Notification settings"
          />
        }
      >
        <BellIcon />
      </TooltipTrigger>
      <TooltipContent>Notification settings</TooltipContent>
    </Tooltip>
  )
}
const AdditionalPreview = dynamic(
  () =>
    import("./component-previews").then((module) => module.ComponentPreview),
  {
    loading: () => (
      <p role="status" className="text-sm text-muted-foreground">
        Loading preview…
      </p>
    ),
  }
)

const ExpansionPreview = dynamic(
  () =>
    import("@/components/generated-previews").then(
      (module) => module.ExpansionPreview
    ),
  {
    loading: () => (
      <p className="text-sm text-muted-foreground">Loading preview…</p>
    ),
  }
)

const SystemPreview = dynamic(() =>
  import("@/components/generated-previews").then(
    (module) => module.ComponentPreview
  )
)
const demos: Record<string, () => React.ReactNode> = {
  ...Object.fromEntries(
    expansionPreviewNames.map((name) => [
      name,
      () => <ExpansionPreview name={name} />,
    ])
  ),
  ...Object.fromEntries(
    additionalPreviewNames.map((name) => [
      name,
      () => <AdditionalPreview name={name} />,
    ])
  ),
  ...Object.fromEntries(
    [
      ...systemPreviewNames,
      ...enhancementPreviewNames,
      ...assetPreviewNames,
      ...queryPreviewNames,
    ].map((name) => [name, () => <SystemPreview name={name} />])
  ),
  button: ButtonsDemo,
  input: InputsDemo,
  card: CardDemo,
  badge: BadgesDemo,
  dialog: ProjectDialog,
  switch: ControlsDemo,
  checkbox: ControlsDemo,
  slider: ControlsDemo,
  tabs: TabsDemo,
  "dropdown-menu": MenuDemo,
  accordion: AccordionDemo,
  avatar: PeopleDemo,
  progress: ProgressDemo,
  tooltip: TooltipDemo,
  textarea: () => (
    <Textarea
      aria-label="Your thoughts"
      placeholder="Write a note…"
      className="max-w-xs"
    />
  ),
  separator: () => (
    <div className="grid w-full max-w-xs gap-4 text-sm">
      <span>Project</span>
      <Separator />
      <span className="text-muted-foreground">Details</span>
    </div>
  ),
  skeleton: () => (
    <div
      className="flex w-full max-w-xs items-center gap-4"
      aria-label="Loading example"
    >
      <Skeleton className="size-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
  toggle: () => (
    <Toggle aria-label="Favorite" variant="outline">
      <StarIcon /> Favorite
    </Toggle>
  ),
}

function DemoTile({
  name,
  title,
  onSelect,
}: {
  name: string
  title: string
  onSelect: (name: string) => void
}) {
  const Demo = demos[name]
  const previewRef = React.useRef<HTMLDivElement>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  React.useEffect(() => {
    const target = previewRef.current
    if (!target) return
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setShowPreview(true))
      return () => cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShowPreview(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])
  return (
    <article
      aria-label={`${title} component`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-xs"
    >
      <div
        ref={previewRef}
        tabIndex={0}
        role="region"
        aria-label={`${title} preview`}
        className="h-80 overflow-auto p-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <div className="flex min-h-full min-w-0 items-center justify-center">
          {showPreview && Demo ? (
            <Demo />
          ) : (
            <span className="text-sm text-muted-foreground">
              {showPreview ? "Open component to explore" : "Loading preview…"}
            </span>
          )}
        </div>
      </div>
      <button
        className="flex items-center justify-between gap-3 border-t px-5 py-4 text-start transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => onSelect(name)}
      >
        <h2 className="text-sm font-semibold">{title}</h2>
        <CodeIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </article>
  )
}

function FoundationView() {
  const swatches = [
    ["Canvas", "bg-background", "background"],
    ["Surface", "bg-card", "card"],
    ["Ink", "bg-foreground", "foreground"],
    ["Quiet", "bg-muted", "muted"],
    ["Accent", "bg-accent", "accent"],
    ["Focus", "bg-ring", "ring"],
  ]
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Foundations</h1>
      </div>
      <section className="rounded-xl border bg-card p-7">
        <h2 className="text-lg font-semibold">Colors</h2>
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {swatches.map(([name, color, token]) => (
            <div key={name}>
              <div className={cn("h-24 rounded-lg border", color)} />
              <p className="mt-3 text-sm font-medium">{name}</p>
              <code className="text-xs text-muted-foreground">--{token}</code>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-xl border bg-card p-7">
          <h2 className="text-lg font-semibold">Typography</h2>
          <p className="text-4xl font-semibold tracking-tight">Heading</p>
          <p className="text-xl font-medium tracking-tight">Subheading</p>
          <p className="text-base leading-7 text-muted-foreground">
            Inter · Body 16px · Controls 14px · Detail 12px.
          </p>
          <code className="text-sm">Geist Mono · Code</code>
        </section>
        <section className="space-y-5 rounded-xl border bg-card p-7">
          <h2 className="text-lg font-semibold">Space & shape</h2>
          <p className="text-base leading-7 text-muted-foreground">
            Spacing uses multiples of 4px.
          </p>
          <div className="flex flex-wrap items-end gap-5">
            {[4, 8, 12, 16, 24, 32].map((n) => (
              <div key={n} className="text-center">
                <div
                  className="mx-auto rounded-sm bg-foreground"
                  style={{ width: n, height: n }}
                />
                <span className="mt-2 block font-mono text-xs text-muted-foreground">
                  {n}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Controls 10px · Cards 17px · Dialogs 22px
          </p>
        </section>
      </div>
      <section className="rounded-xl border bg-card p-7">
        <h2 className="text-lg font-semibold">Clarity, throughout</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Solid surfaces, fine borders, and generous spacing. Visible focus
          rings, clear contrast, and reduced-motion support keep the interface
          usable.
        </p>
      </section>
    </div>
  )
}

function InstallationView() {
  const [origin, setOrigin] = React.useState("http://localhost:3000")
  React.useEffect(() => setOrigin(window.location.origin), [])
  const command = `npx shadcn@latest add ${origin}/r/ankvale-ui.json`
  return (
    <div className="max-w-3xl space-y-9">
      <div>
        <Badge variant="secondary">Base UI · Tailwind v4</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          Installation
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Add Ankvale to an existing shadcn project.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Add the library</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Start with a configured React + Tailwind v4 shadcn project. This
          installs the component source, dependencies, and Ankvale styles.
          Review overwrite prompts if components already exist.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <code className="min-w-0 text-sm break-all">{command}</code>
          <CopyButton value={command} />
        </div>
        <p className="text-sm text-muted-foreground">
          Keep this development server running while installing locally.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Usage</h2>
        <pre className="overflow-x-auto rounded-xl border bg-card p-5 text-sm leading-7">
          {
            'import { Button } from "@/components/ui/button"\n\nexport function Example() {\n  return <Button variant="outline">Save changes</Button>\n}'
          }
        </pre>
        <p className="text-sm leading-6 text-muted-foreground">
          Wrap your app with TooltipProvider when using tooltips. Use your own
          font or set Inter as your sans-serif font. Every component is yours to
          edit.
        </p>
      </section>
    </div>
  )
}

export function Playground({ components }: { components: ComponentSource[] }) {
  const [view, setView] = React.useState<View>("components")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [mobileNav, setMobileNav] = React.useState(false)
  const component = components.find((c) => c.name === selected)
  const searchTerms = query
    .trim()
    .toLowerCase()
    .replaceAll(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  const filtered = components.filter((c) => {
    const searchable = `${c.title} ${c.name.replaceAll("-", " ")}`.toLowerCase()
    return searchTerms.every((term) => searchable.includes(term))
  })
  const search = (value: string) => {
    setQuery(value)
    setView("components")
    setSelected(null)
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    )
  }
  React.useEffect(() => {
    const update = () => {
      const name = decodeURIComponent(window.location.hash.slice(1))
      if (components.some((component) => component.name === name)) {
        setSelected(name)
        setView("components")
      }
    }
    update()
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [components])
  const select = (name: string) => {
    setSelected(name)
    window.history.replaceState(null, "", `#${name}`)
    setView("components")
    setMobileNav(false)
    window.scrollTo({ top: 0 })
  }
  const navigate = (next: View) => {
    setView(next)
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    )
    setSelected(null)
    setMobileNav(false)
    setQuery("")
    window.scrollTo({ top: 0 })
  }
  const Demo = selected ? demos[selected] : null
  return (
    <div className="min-h-svh">
      <div className="sticky top-0 z-50 border-b bg-background">
        <SiteHeader />
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 start-0 top-18 z-40 flex w-60 flex-col border-e bg-sidebar transition-transform md:translate-x-0",
          mobileNav
            ? "visible translate-x-0"
            : "invisible -translate-x-full md:visible"
        )}
        aria-label="Library navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <span className="text-sm font-semibold">Component library</span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Close component navigation"
            onClick={() => setMobileNav(false)}
          >
            <XIcon />
          </Button>
        </div>
        <div className="px-4">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Find a component"
              placeholder="Find a component…"
              className="bg-background ps-9 text-sm shadow-none"
              value={query}
              onChange={(e) => search(e.target.value)}
            />
          </div>
        </div>
        <nav className="mt-6 grid gap-1 px-3">
          {(
            [
              ["components", SquaresFourIcon, "Components"],
              ["foundations", PaletteIcon, "Foundations"],
              ["installation", CodeIcon, "Installation"],
            ] as const
          ).map(([key, Icon, title]) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              aria-current={view === key && !selected ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                view === key && !selected
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon size={18} />
              {title}
              {key === "components" && (
                <span className="ms-auto font-mono text-xs text-muted-foreground">
                  {components.length}
                </span>
              )}
            </button>
          ))}
          <Link
            href="/blocks"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <SquaresFourIcon size={18} />
            Blocks
            <span className="ms-auto font-mono text-xs">
              {blockDefinitions.length + 9}
            </span>
          </Link>
        </nav>
        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <p className="mb-3 px-6 text-xs font-medium tracking-wide text-muted-foreground">
            THE LIBRARY
          </p>
          <nav
            className="min-h-0 overflow-y-auto px-3 pb-6"
            aria-label="Components"
          >
            {filtered.map((c) => (
              <button
                key={c.name}
                onClick={() => select(c.name)}
                aria-current={selected === c.name ? "page" : undefined}
                className={cn(
                  "block w-full rounded-md px-3 py-1.5 text-start text-sm transition-colors hover:bg-sidebar-accent",
                  selected === c.name
                    ? "bg-sidebar-accent font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {c.title}
              </button>
            ))}
            {!filtered.length && (
              <p className="px-3 text-sm text-muted-foreground">
                No matching components.
              </p>
            )}
          </nav>
        </div>
      </aside>
      {mobileNav && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 top-18 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="md:ps-60">
        <div className="sticky top-18 z-20 flex h-14 items-center gap-3 border-b bg-background px-6 text-sm lg:px-10">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open component navigation"
            aria-expanded={mobileNav}
            onClick={() => setMobileNav(true)}
          >
            <SquaresFourIcon />
          </Button>
          <span className="text-muted-foreground">Playground</span>
          <span aria-hidden="true" className="text-muted-foreground/50">
            /
          </span>
          <span className="truncate capitalize">
            {component?.title ?? view}
          </span>
        </div>
        <main
          id="main-content"
          className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10 lg:py-12"
        >
          {view === "foundations" ? (
            <FoundationView />
          ) : view === "installation" ? (
            <InstallationView />
          ) : component ? (
            <div className="space-y-7">
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => navigate("components")}
              >
                All components /
              </button>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">
                  {component.title}
                </h1>
                <Link
                  href={`/docs/${component.name}`}
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  API reference →
                </Link>
              </div>
              <Tabs defaultValue={Demo ? "preview" : "source"} key={selected}>
                <TabsList>
                  <TabsTrigger value="preview" disabled={!Demo}>
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="source">Source</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <div className="mt-5 flex min-h-80 items-center justify-center rounded-xl border bg-card p-8">
                    {Demo && <Demo />}
                  </div>
                  {selected === "button" && (
                    <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-6">
                      <Button size="xs">Extra small</Button>
                      <Button size="sm">Small</Button>
                      <Button>Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon" aria-label="Add item">
                        <PlusIcon />
                      </Button>
                      <Button variant="outline">Outline</Button>
                    </div>
                  )}
                  {selected === "input" && (
                    <div className="mt-6 grid gap-3 rounded-xl border bg-card p-6">
                      <Label htmlFor="invalid-email">Invalid state</Label>
                      <Input
                        id="invalid-email"
                        aria-invalid
                        aria-describedby="invalid-email-help"
                        defaultValue="not-an-email"
                      />
                      <p
                        id="invalid-email-help"
                        className="text-sm text-destructive"
                      >
                        Enter a valid email address.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="source">
                  <div className="mt-5 overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b px-5 py-3">
                      <code className="text-sm">{component.name}.tsx</code>
                      <CopyButton value={component.source} />
                    </div>
                    <pre
                      tabIndex={0}
                      className="max-h-[65vh] overflow-auto p-6 text-sm leading-7"
                    >
                      <code>{component.source}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <code className="min-w-0 text-sm break-all">{`import { ${component.title.replaceAll(" ", "")} } from "@ankvale/ui/components/${component.name}"`}</code>
                <CopyButton value={component.source} label="Copy source" />
              </div>{" "}
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    Components
                  </h1>
                  <p
                    className="mt-3 text-sm text-muted-foreground"
                    role="status"
                  >
                    {searchTerms.length
                      ? `${filtered.length} of ${components.length} components`
                      : `${components.length} components`}
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground"
                  />
                  <Input
                    type="search"
                    aria-label="Search all components"
                    placeholder="Search components…"
                    className="bg-background ps-9"
                    value={query}
                    onChange={(event) => search(event.target.value)}
                  />
                </div>
              </div>
              <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((c) => (
                  <DemoTile
                    key={c.name}
                    name={c.name}
                    title={c.title}
                    onSelect={select}
                  />
                ))}
              </div>
              {!filtered.length && (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground">
                    No components found. Try another name.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => search("")}
                  >
                    Clear search
                  </Button>
                </div>
              )}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground">
                <p>Built on shadcn/ui & Base UI. Crafted to be your own.</p>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => navigate("foundations")}
                >
                  Behind the details <CaretRightIcon />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
