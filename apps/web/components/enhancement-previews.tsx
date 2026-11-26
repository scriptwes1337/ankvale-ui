"use client"
import { useState } from "react"
import {
  TextField,
  PasswordField,
  SearchField,
} from "@ankvale/ui/components/text-field"
import {
  SelectionField,
  type SelectionOption,
} from "@ankvale/ui/components/selection-field"
import { NumberField } from "@ankvale/ui/components/number-field"
import { ColorPicker } from "@ankvale/ui/components/color-picker"
import {
  EditableGrid,
  type EditableGridColumn,
  type GridView,
} from "@ankvale/ui/components/editable-grid"
import {
  ServerDataGrid,
  type GridDataSource,
} from "@ankvale/ui/components/server-data-grid"
import {
  CollectionList,
  type CollectionItem,
} from "@ankvale/ui/components/collection-list"
import { Tree, type TreeNode } from "@ankvale/ui/components/tree"
import {
  UploadManager,
  type UploadTransport,
} from "@ankvale/ui/components/upload-manager"
import {
  AdvancedChart,
  type AdvancedChartProps,
} from "@ankvale/ui/components/advanced-chart"
import {
  Scheduler,
  type ScheduledEvent,
} from "@ankvale/ui/components/scheduler"
import {
  AvatarCollection,
  AvatarPicker,
} from "@ankvale/ui/components/avatar-picker"
import { DataAnalysis } from "@ankvale/ui/components/data-analysis"
const people: SelectionOption[] = [
  { value: "alex", label: "Alex Lee" },
  { value: "jamie", label: "Jamie Chen" },
  { value: "sam", label: "Sam Rivera" },
]
function FieldsExample() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <TextField
        label="Project name"
        description="A short name for the team."
        maxLength={60}
        counter
        clearable
      />
      <SearchField label="Search projects" />
      <PasswordField label="Password" autoComplete="new-password" />
    </div>
  )
}
async function loadPeople(query: string, signal: AbortSignal) {
  if (signal.aborted) return []
  return people.filter((person) =>
    person.label.toLowerCase().includes(query.toLowerCase())
  )
}
function SelectionExample() {
  const [values, setValues] = useState<string[]>([])
  return (
    <div className="w-full max-w-sm space-y-5">
      <SelectionField
        label="Project members"
        multiple
        creatable
        value={values}
        onValueChange={setValues}
        options={people}
      />
      <SelectionField label="Find a member" loadOptions={loadPeople} />
      <p className="text-xs text-muted-foreground">
        Suggestions use local preview data.
      </p>
    </div>
  )
}
type RecordRow = { id: string; name: string; hours: number; team: string }
const records: RecordRow[] = [
  { id: "1", name: "Homepage", hours: 12, team: "Design" },
  { id: "2", name: "Navigation", hours: 8, team: "Engineering" },
  { id: "3", name: "Documentation", hours: 6, team: "Design" },
]
const columns: EditableGridColumn<RecordRow>[] = [
  {
    id: "name",
    header: "Task",
    accessorKey: "name",
    editable: true,
    group: "Project",
    validate: (value) =>
      String(value).trim() ? undefined : "Enter a task name.",
  },
  {
    id: "hours",
    header: "Hours",
    accessorKey: "hours",
    editable: true,
    parse: Number,
    group: "Effort",
    validate: (value) =>
      Number.isFinite(value) && Number(value) >= 0
        ? undefined
        : "Enter positive hours.",
  },
  { id: "team", header: "Team", accessorKey: "team", group: "Project" },
]
function GridExample() {
  const [rows, setRows] = useState(records)
  const [views, setViews] = useState<GridView[]>([])
  const [csv, setCsv] = useState("")
  return (
    <div className="w-full space-y-3">
      <EditableGrid
        label="Project tasks"
        data={rows}
        onDataChange={setRows}
        columns={columns}
        getRowId={(row) => row.id}
        views={views}
        onViewsChange={setViews}
        onExport={setCsv}
        renderDetails={(row) => (
          <p className="text-sm">
            {row.name} · {row.team} · {row.hours} hours
          </p>
        )}
        summary={
          <p className="text-xs">
            {rows.reduce((sum, row) => sum + row.hours, 0)} total hours
          </p>
        }
      />
      {csv && (
        <pre
          className="overflow-auto rounded border p-3 text-xs"
          aria-label="Exported CSV"
        >
          {csv}
        </pre>
      )}
    </div>
  )
}
const localSource: GridDataSource<RecordRow> = async (query) => {
  let rows = records.filter((row) =>
    row.name.toLowerCase().includes(query.search.toLowerCase())
  )
  const sort = query.sorting[0]
  if (sort)
    rows = [...rows].sort(
      (a, b) =>
        String(a[sort.id as keyof RecordRow]).localeCompare(
          String(b[sort.id as keyof RecordRow])
        ) * (sort.desc ? -1 : 1)
    )
  return {
    rows: rows.slice(
      query.pagination.pageIndex * query.pagination.pageSize,
      (query.pagination.pageIndex + 1) * query.pagination.pageSize
    ),
    rowCount: rows.length,
  }
}
function ServerGridExample() {
  return (
    <div className="w-full space-y-2">
      <ServerDataGrid
        source={localSource}
        columns={columns}
        getRowId={(row) => row.id}
        label="Remote-query pattern"
        pageSize={2}
      />
      <p className="text-xs text-muted-foreground">
        A local adapter demonstrates the server query contract.
      </p>
    </div>
  )
}
function CollectionExample() {
  const [items, setItems] = useState<CollectionItem[]>([
    {
      id: "1",
      title: "Homepage",
      description: "Ready for review",
      group: "Design",
    },
    { id: "2", title: "Brand assets", group: "Design" },
    { id: "3", title: "API connection", group: "Engineering" },
  ])
  const [selected, setSelected] = useState<string[]>([])
  return (
    <div className="w-full">
      <CollectionList
        items={items}
        label="Project collection"
        selected={selected}
        onSelectionChange={setSelected}
        onReorder={setItems}
        onAction={(id) => setSelected([id])}
      />
    </div>
  )
}
function renameTree(nodes: TreeNode[], id: string, label: string): TreeNode[] {
  return nodes.map((node) =>
    node.id === id
      ? { ...node, label }
      : {
          ...node,
          children: node.children
            ? renameTree(node.children, id, label)
            : undefined,
        }
  )
}
async function loadBranch(_id: string, signal: AbortSignal) {
  return signal.aborted ? [] : [{ id: "loaded", label: "Research notes" }]
}
function TreeExample() {
  const [nodes, setNodes] = useState<TreeNode[]>([
    {
      id: "design",
      label: "Design",
      children: [
        { id: "web", label: "Website" },
        { id: "brand", label: "Brand" },
      ],
    },
    { id: "research", label: "Research", hasChildren: true },
  ])
  return (
    <div className="w-full max-w-lg">
      <Tree
        nodes={nodes}
        label="Project tree"
        multiple
        checkable
        loadChildren={loadBranch}
        onRename={(id, label) =>
          setNodes((previous) => renameTree(previous, id, label))
        }
      />
    </div>
  )
}
const localUpload: UploadTransport = async (_file, { signal, onProgress }) => {
  if (signal.aborted) throw new Error("cancelled")
  onProgress(100)
}
function UploadExample() {
  return (
    <div className="w-full max-w-lg space-y-2">
      <UploadManager
        label="Project files"
        upload={localUpload}
        allowDirectory
      />
      <p className="text-xs text-muted-foreground">
        Files stay in your browser. This preview does not send them to a
        service.
      </p>
    </div>
  )
}
const chartData = [
  {
    name: "Research",
    value: 20,
    x: 1,
    y: 20,
    size: 10,
    row: "A",
    column: "One",
    open: 16,
    close: 20,
    low: 12,
    high: 24,
  },
  {
    name: "Design",
    value: 45,
    x: 2,
    y: 45,
    size: 20,
    row: "A",
    column: "Two",
    open: 20,
    close: 45,
    low: 18,
    high: 50,
  },
  {
    name: "Review",
    value: 65,
    x: 3,
    y: 65,
    size: 30,
    row: "B",
    column: "One",
    open: 45,
    close: 65,
    low: 40,
    high: 70,
  },
  {
    name: "Launch",
    value: 90,
    x: 4,
    y: 90,
    size: 40,
    row: "B",
    column: "Two",
    open: 65,
    close: 90,
    low: 60,
    high: 96,
  },
]
function ChartsExample() {
  const [kind, setKind] = useState<AdvancedChartProps["kind"]>("scatter")
  const [exported, setExported] = useState("")
  return (
    <div className="w-full space-y-3">
      <label className="grid max-w-xs gap-1 text-sm">
        Chart type
        <select
          value={kind}
          onChange={(e) =>
            setKind(e.target.value as AdvancedChartProps["kind"])
          }
          className="rounded border bg-card p-2"
        >
          {[
            "scatter",
            "bubble",
            "sparkline",
            "gauge",
            "heatmap",
            "funnel",
            "sankey",
            "candlestick",
            "radial-line",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <AdvancedChart
        kind={kind}
        data={chartData}
        label="Project activity"
        links={[
          { source: "Organic", target: "Trial", value: 45 },
          { source: "Referral", target: "Trial", value: 20 },
          { source: "Organic", target: "Contact", value: 15 },
          { source: "Trial", target: "Active", value: 40 },
          { source: "Contact", target: "Active", value: 10 },
        ]}
        onExport={setExported}
      />
      {exported && (
        <p role="status" className="text-xs text-muted-foreground">
          CSV prepared: {exported.split("\n").length} rows.
        </p>
      )}
    </div>
  )
}
function SchedulerExample() {
  const [events, setEvents] = useState<ScheduledEvent[]>([
    {
      id: "review",
      title: "Design review",
      start: new Date(2026, 10, 26, 9),
      end: new Date(2026, 10, 26, 10),
      resourceId: "studio",
    },
  ])
  return (
    <div className="w-full">
      <Scheduler
        events={events}
        onEventsChange={setEvents}
        timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        resources={[
          { id: "studio", name: "Studio" },
          { id: "meeting", name: "Meeting room" },
        ]}
      />
    </div>
  )
}
function AvatarExample() {
  const members = people.map((person) => ({
    id: person.value,
    name: person.label,
  }))
  return (
    <div className="space-y-5">
      <AvatarCollection people={members} max={2} />
      <AvatarPicker label="Assign people" people={members} />
    </div>
  )
}
const previews = {
  "text-field": FieldsExample,
  "selection-field": SelectionExample,
  "number-field": () => (
    <div className="w-full max-w-sm space-y-4">
      <NumberField
        label="Budget"
        locale="en-US"
        defaultValue={1250.5}
        formatOptions={{ style: "currency", currency: "USD" }}
        step={50}
        min={0}
      />
      <NumberField
        label="Conversion rate"
        defaultValue={0.125}
        formatOptions={{ style: "percent", maximumFractionDigits: 1 }}
        step={0.01}
        min={0}
        max={1}
      />
    </div>
  ),
  "color-picker": () => (
    <div className="max-w-sm">
      <ColorPicker label="Brand color" />
    </div>
  ),
  "editable-grid": GridExample,
  "server-data-grid": ServerGridExample,
  "collection-list": CollectionExample,
  tree: TreeExample,
  "upload-manager": UploadExample,
  "advanced-chart": ChartsExample,
  scheduler: SchedulerExample,
  "avatar-picker": AvatarExample,
  "data-analysis": () => (
    <div className="w-full">
      <DataAnalysis
        data={records}
        label="Task analysis"
        groupKey="team"
        columnKey="name"
        valueKey="hours"
      />
    </div>
  ),
}
export function EnhancementPreview({ name }: { name: string }) {
  const Preview = previews[name as keyof typeof previews]
  return Preview ? <Preview /> : <p>Unknown enhancement preview.</p>
}
