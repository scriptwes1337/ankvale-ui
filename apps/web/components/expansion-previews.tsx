"use client"
import { Motion } from "@ankvale/ui/components/motion"
import { useState } from "react"
import type { StyleSpecification } from "maplibre-gl"
import { AreaChart } from "@ankvale/ui/components/area-chart"
import { BarChart } from "@ankvale/ui/components/bar-chart"
import { LineChart } from "@ankvale/ui/components/line-chart"
import { ComposedChart } from "@ankvale/ui/components/composed-chart"
import { PieChart } from "@ankvale/ui/components/pie-chart"
import { RadarChart } from "@ankvale/ui/components/radar-chart"
import { RadialChart } from "@ankvale/ui/components/radial-chart"
import { ApprovalCard } from "@ankvale/ui/components/approval-card"
import { ChainOfThought } from "@ankvale/ui/components/chain-of-thought"
import { ChatConversation } from "@ankvale/ui/components/chat-conversation"
import { ChatListView } from "@ankvale/ui/components/chat-list-view"
import { ChatLoader } from "@ankvale/ui/components/chat-loader"
import { ChatMessage } from "@ankvale/ui/components/chat-message"
import { ChatMessageActions } from "@ankvale/ui/components/chat-message-actions"
import { ChatSource } from "@ankvale/ui/components/chat-source"
import { ChatTool } from "@ankvale/ui/components/chat-tool"
import { Loader } from "@ankvale/ui/components/loader"
import { Markdown } from "@ankvale/ui/components/markdown"
import { ModelSelector } from "@ankvale/ui/components/model-selector"
import { PromptInput } from "@ankvale/ui/components/prompt-input"
import { PromptSuggestion } from "@ankvale/ui/components/prompt-suggestion"
import { Reasoning } from "@ankvale/ui/components/reasoning"
import { TextShimmer } from "@ankvale/ui/components/text-shimmer"
import { Kanban, type KanbanColumn } from "@ankvale/ui/components/kanban"
import { Agenda, type AgendaEvent } from "@ankvale/ui/components/agenda"
import { RichTextEditor } from "@ankvale/ui/components/rich-text-editor"
import { EmojiPicker } from "@ankvale/ui/components/emoji-picker"
import { HoloCard } from "@ankvale/ui/components/holo-card"
import { Map } from "@ankvale/ui/components/map"

import type { ExpansionPreviewName } from "@/lib/expansion-preview-names"
import { Button } from "@ankvale/ui/components/button"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"
import {
  AppLayout,
  AppLayoutSidebarToggle,
  AppLayoutAsideToggle,
} from "@ankvale/ui/components/app-layout"
import { ActionBar } from "@ankvale/ui/components/action-bar"
import { FileTree } from "@ankvale/ui/components/file-tree"
import { FloatingToc } from "@ankvale/ui/components/floating-toc"
import { ItemCard } from "@ankvale/ui/components/item-card"
import { ItemCardGroup } from "@ankvale/ui/components/item-card-group"
import { Kpi } from "@ankvale/ui/components/kpi"
import { KpiGroup } from "@ankvale/ui/components/kpi-group"
import { ListView } from "@ankvale/ui/components/list-view"
import { Timeline } from "@ankvale/ui/components/timeline"
import { Widget } from "@ankvale/ui/components/widget"
import { EmojiReactionButton } from "@ankvale/ui/components/emoji-reaction-button"
import { NumberValue } from "@ankvale/ui/components/number-value"
import { PressableFeedback } from "@ankvale/ui/components/pressable-feedback"
import { Rating } from "@ankvale/ui/components/rating"
import { TrendChip } from "@ankvale/ui/components/trend-chip"
import { CellColorPicker } from "@ankvale/ui/components/cell-color-picker"
import { CellSelect } from "@ankvale/ui/components/cell-select"
import { CellSlider } from "@ankvale/ui/components/cell-slider"
import { CellSwitch } from "@ankvale/ui/components/cell-switch"
import { CheckboxButtonGroup } from "@ankvale/ui/components/checkbox-button-group"
import { DropZone } from "@ankvale/ui/components/drop-zone"
import { InlineSelect } from "@ankvale/ui/components/inline-select"
import { NumberStepper } from "@ankvale/ui/components/number-stepper"
import { RadioButtonGroup } from "@ankvale/ui/components/radio-button-group"
import { Segment } from "@ankvale/ui/components/segment"
import { Stepper } from "@ankvale/ui/components/stepper"

const options = [
  {
    value: "design",
    label: "Design",
    description: "Design files and specifications",
  },
  {
    value: "engineering",
    label: "Engineering",
    description: "Development tasks and reviews",
  },
  { value: "product", label: "Product", description: "Roadmaps and research" },
]
const files = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "components",
        name: "components",
        children: [
          { id: "button", name: "button.tsx" },
          { id: "input", name: "input.tsx" },
        ],
      },
      { id: "page", name: "page.tsx" },
    ],
  },
  { id: "readme", name: "README.md" },
]
const items = [
  { id: "brief", title: "Project brief", description: "Updated today" },
  { id: "notes", title: "Meeting notes", description: "Updated yesterday" },
  {
    id: "guidelines",
    title: "Design guidelines",
    description: "Updated Nov 24",
  },
]
function ActionBarPreview() {
  const [selected, setSelected] = useState(["brief"])
  return (
    <div className="w-full max-w-lg space-y-4">
      <ListView
        items={items}
        label="Documents"
        selectionMode="multiple"
        selected={selected}
        onSelectionChange={setSelected}
      />
      <ActionBar
        open={selected.length > 0}
        count={selected.length}
        onClear={() => setSelected([])}
      >
        <Button size="sm" variant="outline" onClick={() => setSelected([])}>
          Archive
        </Button>
      </ActionBar>
    </div>
  )
}
function StepperPreview() {
  const [step, setStep] = useState("details")
  return (
    <div className="w-full max-w-2xl space-y-5">
      <Stepper
        steps={[
          {
            id: "details",
            title: "Details",
            description: "Project information",
          },
          { id: "team", title: "Team", description: "Invite members" },
          { id: "review", title: "Review", description: "Check and create" },
        ]}
        value={step}
        onValueChange={setStep}
      />
      <p role="status" className="text-sm text-muted-foreground">
        Current step: {step}
      </p>
    </div>
  )
}
function NumberPreview() {
  const [value, setValue] = useState(1240)
  return (
    <div className="space-y-4">
      <NumberValue value={value} className="block text-4xl font-semibold" />
      <Button variant="outline" onClick={() => setValue(value + 75)}>
        Add 75
      </Button>
    </div>
  )
}
function SegmentPreview() {
  const [value, setValue] = useState("monthly")
  return (
    <div className="space-y-4">
      <Segment
        label="Billing period"
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
        value={value}
        onValueChange={setValue}
      />
      <p role="status" className="text-sm">
        {value === "monthly" ? "$18 / month" : "$180 / year"}
      </p>
    </div>
  )
}
function TocPreview() {
  return (
    <div className="grid w-full max-w-xl grid-cols-[1fr_150px] items-start gap-5">
      <div className="space-y-8">
        {["Overview", "Installation", "Usage"].map((title) => (
          <section
            id={`toc-demo-${title.toLowerCase()}`}
            key={title}
            className="scroll-mt-6"
          >
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {title === "Overview"
                ? "Ankvale components are copied into your project."
                : title === "Installation"
                  ? "Use the shadcn registry command to add a component."
                  : "Import the component and pass your content."}
            </p>
          </section>
        ))}
      </div>
      <FloatingToc
        headings={["Overview", "Installation", "Usage"].map((title) => ({
          id: `toc-demo-${title.toLowerCase()}`,
          title,
        }))}
      />
    </div>
  )
}
type GridPerson = { id: string; name: string; team: string; status: string }
const people: GridPerson[] = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1),
  name: ["Alex Lee", "Jamie Chen", "Sam Rivera", "Taylor Brooks"][i % 4]!,
  team: ["Design", "Engineering", "Product"][i % 3]!,
  status: i % 3 ? "Active" : "Invited",
}))
const personColumns: DataGridColumn<GridPerson>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    pinned: "start",
    width: 180,
  },
  { id: "team", header: "Team", accessorKey: "team", width: 160 },
  { id: "status", header: "Status", accessorKey: "status", width: 120 },
]
function GridPreview() {
  const [data, setData] = useState(people)
  return (
    <DataGrid
      className="w-full max-w-4xl"
      data={data}
      columns={personColumns}
      getRowId={(row) => row.id}
      label="Team members"
      selectable
      columnFilters
      pageSize={5}
      onReorder={setData}
    />
  )
}
function LayoutPreview() {
  return (
    <AppLayout
      className="h-96 min-h-0 w-full max-w-4xl rounded-lg border"
      sidebarWidth={170}
      asideWidth={180}
      resizable
      sidebar={
        <div className="p-4">
          <p className="mb-5 text-sm font-semibold">Workspace</p>
          <ListView
            label="Navigation"
            items={items}
            selectionMode="single"
            defaultSelected={["brief"]}
          />
        </div>
      }
      navbar={
        <>
          <AppLayoutSidebarToggle />
          <span className="flex-1 text-sm font-medium">Project brief</span>
          <AppLayoutAsideToggle />
        </>
      }
      aside={
        <div className="p-4 text-sm">
          <h3 className="font-medium">Details</h3>
          <p className="mt-3 text-xs text-muted-foreground">Owner: Alex Lee</p>
        </div>
      }
    >
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">Website redesign</h2>
        <p className="text-sm text-muted-foreground">
          Review the project brief and upcoming milestones.
        </p>
        <Timeline
          items={[
            { id: "draft", title: "Draft complete", status: "complete" },
            { id: "review", title: "Team review", status: "current" },
            { id: "release", title: "Release", status: "pending" },
          ]}
        />
      </div>
    </AppLayout>
  )
}
const chartData = [
  { month: "Jan", revenue: 120, expenses: 80 },
  { month: "Feb", revenue: 180, expenses: 100 },
  { month: "Mar", revenue: 160, expenses: 110 },
  { month: "Apr", revenue: 240, expenses: 130 },
  { month: "May", revenue: 280, expenses: 150 },
]
const chartSeries = [
  { key: "revenue", label: "Revenue" },
  { key: "expenses", label: "Expenses" },
]
const models = [
  { id: "model-a", name: "Model A", provider: "Example provider" },
  { id: "model-b", name: "Model B", provider: "Example provider" },
]
function ChatPreview() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant" as "user" | "assistant",
      text: "What would you like to work on?",
    },
  ])
  return (
    <div className="w-full max-w-2xl space-y-3">
      <ChatConversation>
        {messages.map((message) => (
          <ChatMessage key={message.id} role={message.role}>
            <Markdown>{message.text}</Markdown>
          </ChatMessage>
        ))}
      </ChatConversation>
      <PromptInput
        onSubmit={({ text }) => {
          setMessages((current) => [
            ...current,
            { id: `user-${current.length}`, role: "user", text },
            {
              id: `assistant-${current.length}`,
              role: "assistant",
              text: "This is a local UI preview. Connect your own chat service to generate responses.",
            },
          ])
        }}
        toolbar={<ModelSelector models={models} />}
      />
    </div>
  )
}
function ActionsPreview() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null),
    [retries, setRetries] = useState(0)
  return (
    <div className="space-y-3">
      <ChatMessage
        role="assistant"
        actions={
          <ChatMessageActions
            text="The project is ready for review."
            feedback={feedback}
            onFeedback={setFeedback}
            onRetry={() => setRetries(retries + 1)}
          />
        }
      >
        The project is ready for review.
      </ChatMessage>
      <p role="status" className="text-xs text-muted-foreground">
        {retries
          ? `Retried ${retries} times`
          : feedback
            ? `Feedback: ${feedback}`
            : ""}
      </p>
    </div>
  )
}
function ChatListPreview() {
  const [items, setItems] = useState([
      { id: "1", title: "Website redesign", updatedAt: "Today" },
      { id: "2", title: "Project planning", updatedAt: "Yesterday" },
    ]),
    [selected, setSelected] = useState("1")
  return (
    <ChatListView
      items={items}
      value={selected}
      onValueChange={setSelected}
      onDelete={(id) => setItems(items.filter((item) => item.id !== id))}
      className="w-full max-w-sm"
    />
  )
}
function ApprovalPreview() {
  const [submitted, setSubmitted] = useState("")
  return (
    <div className="w-full max-w-md space-y-3">
      <ApprovalCard
        questions={[
          {
            id: "scope",
            title: "Which files should be included?",
            options: [
              { id: "docs", label: "Documentation" },
              { id: "all", label: "All project files" },
            ],
            allowCustom: true,
          },
          {
            id: "confirm",
            title: "Prepare the export?",
            description: "This preview does not upload or send any files.",
          },
        ]}
        onComplete={(answers) => setSubmitted(JSON.stringify(answers))}
      />
      {submitted && (
        <p role="status" className="text-xs break-all text-muted-foreground">
          {submitted}
        </p>
      )}
    </div>
  )
}
function PromptPreview() {
  const [sent, setSent] = useState("")
  return (
    <div className="w-full max-w-xl space-y-3">
      <PromptInput
        onSubmit={({ text, files }) =>
          setSent(
            `${text}${files.length ? ` · ${files.length} attachments` : ""}`
          )
        }
        toolbar={<ModelSelector models={models} />}
      />
      <p role="status" className="text-xs text-muted-foreground">
        {sent ? `Submitted locally: ${sent}` : ""}
      </p>
    </div>
  )
}
function SuggestionPreview() {
  const [selected, setSelected] = useState("")
  return (
    <div className="w-full max-w-xl space-y-3">
      <PromptSuggestion
        items={[
          { id: "summary", text: "Summarize this document" },
          { id: "tasks", text: "Extract action items" },
        ]}
        onSelect={setSelected}
      />
      {selected && (
        <p role="status" className="text-sm">
          {selected}
        </p>
      )}
    </div>
  )
}
function ReasoningPreview() {
  const [status, setStatus] = useState<"streaming" | "complete">("streaming")
  return (
    <div className="w-full max-w-md space-y-3">
      <Reasoning
        status={status}
        duration={status === "complete" ? "3s" : undefined}
      >
        <p>
          Check the project notes, identify open tasks, and group them by owner.
        </p>
      </Reasoning>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          setStatus(status === "streaming" ? "complete" : "streaming")
        }
      >
        {status === "streaming" ? "Complete" : "Restart"}
      </Button>
    </div>
  )
}
const board: KanbanColumn[] = [
  {
    id: "todo",
    title: "To do",
    cards: [
      {
        id: "brief",
        title: "Review project brief",
        description: "Confirm scope and milestones.",
      },
      { id: "research", title: "User interviews" },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    cards: [{ id: "design", title: "Homepage design" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "setup", title: "Project setup" }],
  },
]
function KanbanPreview() {
  const [columns, setColumns] = useState(board)
  return (
    <Kanban
      className="w-full max-w-4xl"
      columns={columns}
      onColumnsChange={setColumns}
    />
  )
}
function AgendaPreview() {
  const [events, setEvents] = useState<AgendaEvent[]>([
    {
      id: "standup",
      title: "Daily standup",
      start: new Date(2026, 10, 26, 9),
      end: new Date(2026, 10, 26, 9, 30),
    },
    {
      id: "review",
      title: "Design review",
      start: new Date(2026, 10, 26, 11),
      end: new Date(2026, 10, 26, 12),
    },
  ])
  const [selected, setSelected] = useState("")
  return (
    <div className="w-full max-w-5xl">
      <Agenda
        events={events}
        defaultDate={new Date(2026, 10, 26)}
        onEventChange={(updated) =>
          setEvents(
            events.map((event) => (event.id === updated.id ? updated : event))
          )
        }
        onEventCreate={(event) =>
          setEvents([...events, { ...event, id: `event-${events.length}` }])
        }
        onEventSelect={(event) => setSelected(event.title)}
      />
      <p role="status" className="mt-2 text-xs text-muted-foreground">
        {selected}
      </p>
    </div>
  )
}
function EmojiPreview() {
  const [value, setValue] = useState("")
  return (
    <div className="space-y-3">
      <EmojiPicker onSelect={setValue} />
      <p role="status" className="text-sm">
        {value ? `Selected ${value}` : ""}
      </p>
    </div>
  )
}
function EditorPreview() {
  const [html, setHtml] = useState(
    "<h2>Project brief</h2><p>Review the <strong>website redesign</strong> and add your comments.</p>"
  )
  return (
    <RichTextEditor
      className="w-full max-w-2xl"
      value={html}
      onValueChange={setHtml}
    />
  )
}
const demoMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      paint: { "raster-saturation": -1 },
    },
  ],
}
const mapMarkers = [
  { id: "sg", longitude: 103.851959, latitude: 1.29027, label: "Singapore" },
  { id: "kl", longitude: 101.6869, latitude: 3.139, label: "Kuala Lumpur" },
]
function MotionPreview() {
  const [revision, setRevision] = useState(0)
  return (
    <div className="w-full max-w-xl space-y-5">
      <Button
        variant="outline"
        onClick={() => setRevision((value) => value + 1)}
      >
        Replay entrance
      </Button>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["reveal", "fade", "scale"] as const).map((preset) => (
          <Motion
            key={`${preset}-${revision}`}
            preset={preset}
            className="rounded-lg border bg-card p-6"
          >
            <p className="font-medium capitalize">{preset}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              One quiet entrance.
            </p>
          </Motion>
        ))}
      </div>
    </div>
  )
}
const previews = {
  motion: MotionPreview,
  "area-chart": () => (
    <AreaChart
      data={chartData}
      series={chartSeries}
      xKey="month"
      label="Monthly revenue and expenses"
      className="max-w-2xl"
    />
  ),
  "bar-chart": () => (
    <BarChart
      data={chartData}
      series={chartSeries}
      xKey="month"
      label="Monthly revenue and expenses"
      className="max-w-2xl"
    />
  ),
  "line-chart": () => (
    <LineChart
      data={chartData}
      series={chartSeries}
      xKey="month"
      label="Monthly revenue and expenses"
      className="max-w-2xl"
    />
  ),
  "composed-chart": () => (
    <ComposedChart
      data={chartData}
      series={[
        { ...chartSeries[0]!, type: "bar" },
        { ...chartSeries[1]!, type: "line" },
      ]}
      xKey="month"
      label="Monthly revenue and expenses"
      className="max-w-2xl"
    />
  ),
  "pie-chart": () => (
    <PieChart
      data={[
        { name: "Design", value: 40 },
        { name: "Engineering", value: 35 },
        { name: "Product", value: 25 },
      ]}
      label="Team allocation"
      donut
      className="w-full max-w-md"
    />
  ),
  "radar-chart": () => (
    <RadarChart
      data={chartData}
      series={chartSeries}
      xKey="month"
      label="Monthly revenue comparison"
      className="max-w-xl"
    />
  ),
  "radial-chart": () => (
    <RadialChart
      data={[
        { name: "Design", value: 85 },
        { name: "Engineering", value: 65 },
        { name: "Product", value: 45 },
      ]}
      label="Team progress"
      className="w-full max-w-md"
    />
  ),
  "approval-card": ApprovalPreview,
  "chain-of-thought": () => (
    <ChainOfThought
      className="w-full max-w-md"
      steps={[
        {
          id: "search",
          title: "Search documents",
          description: "Found three project notes.",
          status: "complete",
        },
        { id: "review", title: "Review action items", status: "running" },
        { id: "summarize", title: "Write summary", status: "pending" },
      ]}
    />
  ),
  "chat-conversation": ChatPreview,
  "chat-list-view": ChatListPreview,
  "chat-loader": () => <ChatLoader />,
  "chat-message": () => (
    <div className="w-full max-w-lg space-y-3">
      <ChatMessage role="user">Can you summarize the brief?</ChatMessage>
      <ChatMessage role="assistant">
        <Markdown>
          {
            "The project includes **three milestones**: research, design, and release."
          }
        </Markdown>
      </ChatMessage>
    </div>
  ),
  "chat-message-actions": ActionsPreview,
  "chat-source": () => (
    <ChatSource
      title="Ankvale UI"
      url="https://www.notion.com/product/docs"
      description="Reference documentation"
      index={1}
    />
  ),
  "chat-tool": () => (
    <div className="w-full max-w-lg">
      <ChatTool
        name="search_documents"
        status="complete"
        input={{ query: "Project brief" }}
        output={{ matches: ["Project brief", "Meeting notes"] }}
      />
    </div>
  ),
  loader: () => (
    <div className="flex gap-8">
      <Loader />
      <Loader variant="dots" />
      <Loader variant="bars" />
    </div>
  ),
  markdown: () => (
    <Markdown className="w-full max-w-lg">
      {
        "## Project update\n\nThe **design review** is complete.\n\n- Update the navigation\n- Review accessibility\n- Prepare the release\n\n| Task | Owner |\n| --- | --- |\n| Design | Alex |\n| Review | Jamie |"
      }
    </Markdown>
  ),
  "model-selector": () => <ModelSelector models={models} />,
  "prompt-input": PromptPreview,
  "prompt-suggestion": SuggestionPreview,
  reasoning: ReasoningPreview,
  "text-shimmer": () => <TextShimmer>Searching documents…</TextShimmer>,
  kanban: KanbanPreview,
  agenda: AgendaPreview,
  "rich-text-editor": EditorPreview,
  "emoji-picker": EmojiPreview,
  "holo-card": () => (
    <HoloCard className="w-72">
      <h3 className="text-base font-semibold">Ankvale membership</h3>
      <p className="mt-8 font-mono text-xs text-muted-foreground">
        MEMBER 0042
      </p>
    </HoloCard>
  ),
  map: () => (
    <div className="w-full max-w-3xl">
      <Map
        label="Office locations"
        mapStyle={demoMapStyle}
        center={[102.5, 2.2]}
        zoom={5}
        markers={mapMarkers}
      />
    </div>
  ),
  "data-grid": GridPreview,
  "app-layout": LayoutPreview,
  "action-bar": ActionBarPreview,
  "file-tree": () => (
    <FileTree
      className="w-full max-w-sm"
      nodes={files}
      defaultExpanded={["src", "components"]}
      defaultValue="button"
    />
  ),
  "floating-toc": TocPreview,
  "item-card": () => (
    <ItemCard
      className="w-full max-w-sm"
      title="Website redesign"
      description="Design team"
      footer="Updated today"
      actions={
        <Button size="sm" variant="outline">
          Open
        </Button>
      }
    >
      <p className="mt-4 text-sm">Homepage and navigation updates.</p>
    </ItemCard>
  ),
  "item-card-group": () => (
    <ItemCardGroup className="w-full max-w-2xl">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          title={item.title}
          description={item.description}
        />
      ))}
    </ItemCardGroup>
  ),
  kpi: () => (
    <Kpi
      className="w-full max-w-sm"
      label="Revenue"
      value="$24,860"
      change={12.8}
      description="Compared with last month"
    />
  ),
  "kpi-group": () => (
    <KpiGroup className="w-full max-w-3xl xl:grid-cols-3">
      <Kpi label="Revenue" value="$24,860" change={12.8} />
      <Kpi label="Customers" value="1,284" change={4.2} />
      <Kpi label="Churn" value="1.2%" description="Monthly churn" />
    </KpiGroup>
  ),
  "list-view": () => (
    <ListView
      className="w-full max-w-md"
      items={items}
      label="Documents"
      selectionMode="multiple"
    />
  ),
  timeline: () => (
    <Timeline
      className="w-full max-w-md"
      items={[
        {
          id: "1",
          title: "Project created",
          description: "Alex created Website redesign.",
          date: "09:00",
          status: "complete",
        },
        {
          id: "2",
          title: "Design review",
          description: "Three screens ready for review.",
          date: "10:30",
          status: "current",
        },
        { id: "3", title: "Release", date: "Tomorrow", status: "pending" },
      ]}
    />
  ),
  widget: () => (
    <Widget
      className="w-full max-w-md"
      title="Recent documents"
      footer="3 documents"
    >
      <ListView label="Recent documents" items={items} />
    </Widget>
  ),
  "emoji-reaction-button": () => (
    <div className="flex gap-2">
      <EmojiReactionButton emoji="👍" count={4} />
      <EmojiReactionButton emoji="🎉" count={2} />
      <EmojiReactionButton emoji="❤️" count={1} />
    </div>
  ),
  "number-value": NumberPreview,
  "pressable-feedback": () => (
    <PressableFeedback>Press and hold</PressableFeedback>
  ),
  rating: () => <Rating defaultValue={3} />,
  "trend-chip": () => (
    <div className="flex gap-3">
      <TrendChip value={12.8} />
      <TrendChip value={-3.2} />
      <TrendChip value={0} />
    </div>
  ),
  "cell-color-picker": () => <CellColorPicker />,
  "cell-select": () => (
    <CellSelect label="Team" options={options} defaultValue="design" />
  ),
  "cell-slider": () => (
    <div className="w-56">
      <CellSlider label="Progress" defaultValue={65} />
    </div>
  ),
  "cell-switch": () => <CellSwitch label="Notifications" defaultChecked />,
  "checkbox-button-group": () => (
    <CheckboxButtonGroup
      className="w-full max-w-lg"
      label="Teams"
      options={options}
      defaultValue={["design"]}
    />
  ),
  "drop-zone": () => (
    <DropZone
      className="w-full max-w-md"
      accept=".pdf,.txt,image/*"
      description="PDF, text, or images. Up to 10 MB each."
    />
  ),
  "inline-select": () => (
    <InlineSelect options={options} label="Team" defaultValue="design" />
  ),
  "number-stepper": () => (
    <NumberStepper label="Guests" defaultValue={2} min={1} max={10} />
  ),
  "radio-button-group": () => (
    <RadioButtonGroup
      className="w-full max-w-sm"
      label="Team"
      options={options}
      defaultValue="design"
    />
  ),
  segment: SegmentPreview,
  stepper: StepperPreview,
} satisfies Record<ExpansionPreviewName, React.ComponentType>
export function ExpansionPreview({ name }: { name: ExpansionPreviewName }) {
  const Preview = previews[name]
  return <Preview />
}
