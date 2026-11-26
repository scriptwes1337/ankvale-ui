"use client"
import { useState,useCallback } from "react"
import { Text, View } from "react-native"
import * as N from "@ankvale/native-ui"
import type { NativeTheme } from "@ankvale/native-ui/theme"
const options = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
]
const rows = [
  { month: "Jan", revenue: 30, cost: 18 },
  { month: "Feb", revenue: 50, cost: 25 },
  { month: "Mar", revenue: 42, cost: 22 },
  { month: "Apr", revenue: 72, cost: 35 },
  { month: "May", revenue: 85, cost: 40 },
]
const chart = {
  data: rows,
  xKey: "month",
  series: [
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost" },
  ],
}
const distribution = [
  { label: "Product", value: 50 },
  { label: "Services", value: 30 },
  { label: "Other", value: 20 },
]
export function NativePreview({
  name,
  theme,
  mode = "light",
}: {
  name: string
  theme?: Partial<NativeTheme>
  mode?: "light" | "dark"
}) {
  return (
    <N.AnkvaleProvider mode={mode} theme={theme}>
      <Content name={name} />
    </N.AnkvaleProvider>
  )
}
function Content({ name }: { name: string }) {
  const [message, setMessage] = useState(""),
    [wheel, setWheel] = useState<Record<string, string>>({
      team: "design",
      role: "product",
    })
  let preview
  switch (name) {
    case "fab":
      preview = (
        <N.FAB label="Create item" onPress={() => setMessage("Item created")}>
          +
        </N.FAB>
      )
      break
    case "morph-button":
      preview = (
        <N.MorphButton
          icon={<Text style={{ color: "white" }}>+</Text>}
          label="Create"
        >
          Create
        </N.MorphButton>
      )
      break
    case "progress-button":
      preview = (
        <N.ProgressButton
          progress={65}
          onPress={() => setMessage("Upload requested")}
        >
          Upload
        </N.ProgressButton>
      )
      break
    case "slide-button":
      preview = <N.SlideButton onComplete={() => setMessage("Confirmed")} />
      break
    case "social-auth-button":
      preview = (
        <N.SocialAuthButton
          provider="Google"
          onPress={() => setMessage("Connect your authentication callback")}
        />
      )
      break
    case "toggle-button":
      preview = <N.ToggleButton>Favorite</N.ToggleButton>
      break
    case "toggle-button-group":
      preview = <N.ToggleButtonGroup options={options} />
      break
    case "area-chart":
      preview = <N.AreaChart {...chart} />
      break
    case "bar-chart":
      preview = <N.BarChart {...chart} />
      break
    case "composed-chart":
      preview = (
        <N.ComposedChart
          {...chart}
          series={[
            { key: "revenue", type: "bar" },
            { key: "cost", type: "line" },
          ]}
        />
      )
      break
    case "line-chart":
      preview = <N.LineChart {...chart} />
      break
    case "live-chart":
      preview = <LivePreview />
      break
    case "pie-chart":
      preview = <N.PieChart data={distribution} donut />
      break
    case "radar-chart":
      preview = <N.RadarChart {...chart} />
      break
    case "radial-chart":
      preview = <N.RadialChart data={distribution} />
      break
    case "stacked-meter":
      preview = <N.StackedMeter data={distribution} />
      break
    case "badge":
      preview = <N.Badge>Published</N.Badge>
      break
    case "carousel":
      preview = (
        <N.Carousel
          items={[
            <Text key="1">First slide</Text>,
            <Text key="2">Second slide</Text>,
            <Text key="3">Third slide</Text>,
          ]}
        />
      )
      break
    case "empty-state":
      preview = (
        <N.EmptyState
          title="No projects"
          description="Create your first project."
          action={
            <N.Button onPress={() => setMessage("Project created")}>
              New project
            </N.Button>
          }
        />
      )
      break
    case "flip-card":
      preview = <N.FlipCard front="Tap to see details" back="Project details" />
      break
    case "swipeable-row":
      preview = (
        <N.SwipeableRow
          actions={[
            { label: "Archive", onPress: () => setMessage("Archived") },
          ]}
        >
          <Text style={{ padding: 20 }}>Swipe to reveal actions</Text>
        </N.SwipeableRow>
      )
      break
    case "table":
      preview = (
        <N.Table
          data={rows}
          columns={[
            { id: "month", title: "Month", accessor: (r) => r.month },
            { id: "revenue", title: "Revenue", accessor: (r) => r.revenue },
          ]}
          getRowId={(r) => r.month}
        />
      )
      break
    case "timeline":
      preview = (
        <N.Timeline
          items={[
            {
              id: "1",
              title: "Project created",
              description: "Today at 09:00",
            },
            {
              id: "2",
              title: "Review scheduled",
              description: "Tomorrow at 10:00",
            },
          ]}
        />
      )
      break
    case "widget":
      preview = (
        <N.Widget title="Activity" footer={<Text>Updated just now</Text>}>
          <Text>12 changes this week</Text>
        </N.Widget>
      )
      break
    case "agenda":
      preview = (
        <N.Agenda
          events={[
            {
              id: "1",
              title: "Design review",
              start: new Date(2026, 10, 26, 10),
              end: new Date(2026, 10, 26, 11),
            },
          ]}
          defaultValue="2026-11-26"
        />
      )
      break
    case "calendar":
      preview = <N.Calendar defaultValue="2026-11-26" />
      break
    case "date-field":
      preview = <N.DateField defaultValue="2026-11-26" />
      break
    case "date-picker":
      preview = <N.DatePicker defaultValue="2026-11-26" />
      break
    case "date-range-picker":
      preview = (
        <N.DateRangePicker
          defaultValue={{ start: "2026-11-26", end: "2026-11-29" }}
        />
      )
      break
    case "date-time-picker":
      preview = <N.DateTimePicker defaultValue="2026-11-26T09:30" />
      break
    case "range-calendar":
      preview = (
        <N.RangeCalendar
          defaultValue={{ start: "2026-11-26", end: "2026-11-29" }}
        />
      )
      break
    case "time-picker":
      preview = <N.TimePicker defaultValue="09:30" hourCycle={12} />
      break
    case "wheel-time-picker":
      preview = <N.WheelTimePicker defaultValue="09:30" hourCycle={12} />
      break
    case "wheel-date-time-picker":
      preview = (
        <N.WheelDateTimePicker
          defaultValue="2026-11-26T09:30"
          min="2020-01-01T00:00"
          max="2030-12-31T23:59"
        />
      )
      break
    case "number-value":
      preview = <N.NumberValue value={12580} />
      break
    case "progress-bar":
      preview = <N.ProgressBar value={65} />
      break
    case "progress-circle":
      preview = <N.ProgressCircle value={65} />
      break
    case "rating":
      preview = <N.Rating defaultValue={3} />
      break
    case "trend-chip":
      preview = <N.TrendChip value={12.4} />
      break
    case "autocomplete":
      preview = <N.Autocomplete label="Team" options={options} />
      break
    case "combo-box":
      preview = <N.ComboBox label="Team" options={options} />
      break
    case "number-field":
      preview = (
        <N.NumberField label="Quantity" defaultValue={4} min={0} max={20} />
      )
      break
    case "number-pad":
      preview = (
        <N.NumberPad onSubmit={(value) => setMessage(`Entered ${value}`)} />
      )
      break
    case "number-stepper":
      preview = <N.NumberStepper defaultValue={4} min={0} max={10} />
      break
    case "phone-number-field":
      preview = <N.PhoneNumberField />
      break
    case "radio-button-group":
      preview = <N.RadioButtonGroup options={options} />
      break
    case "wheel-picker":
      preview = <N.WheelPicker options={options} label="Team" />
      break
    case "wheel-picker-group":
      preview = (
        <N.WheelPickerGroup
          columns={[
            { id: "team", label: "Team", options },
            { id: "role", label: "Role", options },
          ]}
          value={wheel}
          onValueChange={setWheel}
        />
      )
      break
    case "morph-tabs":
      preview = <N.MorphTabs tabs={options} />
      break
    case "segment":
      preview = <N.Segment options={options} />
      break
    case "stepper":
      preview = (
        <N.Stepper
          steps={[
            { id: "1", title: "Details" },
            { id: "2", title: "Review" },
            { id: "3", title: "Publish" },
          ]}
          allowFuture
        />
      )
      break
    case "split-view":
      preview = (
        <N.SplitView
          sidebar={<Text style={{ padding: 16 }}>Project list</Text>}
        >
          <Text>Project details</Text>
        </N.SplitView>
      )
      break
    case "swipeable-tabs":
      preview = (
        <N.SwipeableTabs
          tabs={options.map((o) => ({
            ...o,
            content: <Text style={{ padding: 20 }}>{o.label} projects</Text>,
          }))}
        />
      )
      break
    default:
      throw new Error(`Missing native preview: ${name}`)
  }
  return (
    <View style={{ gap: 16 }}>
      {preview}
      {!!message && <Text accessibilityLiveRegion="polite">{message}</Text>}
    </View>
  )
}

function LivePreview(){const subscribe=useCallback((push:(row:Record<string,string|number>)=>void)=>{let tick=0;const timer=setInterval(()=>{tick++;push({month:`${tick}s`,revenue:55+Math.sin(tick*.6)*25,cost:20+Math.cos(tick*.4)*10})},1000);return ()=>clearInterval(timer)},[]);return <N.LiveChart {...chart} subscribe={subscribe} maxPoints={12}/>}
