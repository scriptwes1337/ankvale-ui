"use client"
import { useRef, useState } from "react"
import {
  Heading,
  Text,
  InlineCode,
  Prose,
} from "@ankvale/ui/components/typography"
import { Link } from "@ankvale/ui/components/link"
import { Container } from "@ankvale/ui/components/container"
import { Stack, Inline } from "@ankvale/ui/components/stack"
import { LayoutGrid } from "@ankvale/ui/components/layout-grid"
import { Surface } from "@ankvale/ui/components/surface"
import { Descriptions } from "@ankvale/ui/components/descriptions"
import { CircularProgress } from "@ankvale/ui/components/circular-progress"
import { Chip } from "@ankvale/ui/components/chip"
import { Indicator, Status } from "@ankvale/ui/components/indicator"
import { PreviewFrame } from "@ankvale/ui/components/preview-frame"
import { AttachedGroup } from "@ankvale/ui/components/attached-group"
import { LayeredStack } from "@ankvale/ui/components/layered-stack"
import { Masonry } from "@ankvale/ui/components/masonry"
import {
  ContentTransition,
  Swap,
} from "@ankvale/ui/components/content-transition"
import { ClientOnly } from "@ankvale/ui/components/client-only"
import { useMediaQuery } from "@ankvale/ui/hooks/use-media-query"
import {
  Form,
  FormField,
  useForm,
  useFieldArray,
} from "@ankvale/ui/components/form"
import {
  DatePicker,
  DateField,
  DateRangePicker,
} from "@ankvale/ui/components/date-picker"
import {
  TimePicker,
  TimeRangePicker,
} from "@ankvale/ui/components/time-picker"
import {
  DateTimePicker,
  DateTimeRangePicker,
} from "@ankvale/ui/components/date-time-picker"
import { PeriodPicker } from "@ankvale/ui/components/period-picker"
import { Transfer } from "@ankvale/ui/components/transfer"
import { Cascader } from "@ankvale/ui/components/cascader"
import { TreeSelect } from "@ankvale/ui/components/tree-select"
import { Mentions } from "@ankvale/ui/components/mentions"
import { Popconfirm } from "@ankvale/ui/components/popconfirm"
import { Notification } from "@ankvale/ui/components/notification"
import { Result } from "@ankvale/ui/components/result"
import { BottomNavigation } from "@ankvale/ui/components/bottom-navigation"
import { FloatingAction } from "@ankvale/ui/components/floating-action"
import { SpeedDial } from "@ankvale/ui/components/speed-dial"
import { Affix, BackToTop } from "@ankvale/ui/components/affix"
import { Image, ImageLightbox } from "@ankvale/ui/components/image"
import { ImageList } from "@ankvale/ui/components/image-list"
import { ImageCompare } from "@ankvale/ui/components/image-compare"
import { Countdown } from "@ankvale/ui/components/countdown"
import { QRCode } from "@ankvale/ui/components/qr-code"
import { Tour } from "@ankvale/ui/components/tour"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  PlusIcon,
  HouseIcon,
  FolderIcon,
  BellIcon,
} from "@phosphor-icons/react"
const blueImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#eef3fb"/><circle cx="320" cy="240" r="160" fill="#0d6efd"/><path d="M0 240h640M320 0v480" stroke="white" stroke-width="2"/><circle cx="320" cy="240" r="110" fill="none" stroke="white" stroke-width="2"/></svg>'
  )
const inkImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#f4f4f4"/><rect x="160" y="80" width="320" height="320" rx="160" fill="#191919"/><path d="M160 240h320M320 80v320" stroke="white" stroke-width="2"/></svg>'
  )
const gallery = [
  {
    id: "blue",
    src: blueImage,
    alt: "Blue circle study",
    caption: "Circle study",
  },
  { id: "ink", src: inkImage, alt: "Ink arch study", caption: "Arch study" },
]
const folders = [
  {
    value: "studio",
    label: "Studio",
    children: [
      {
        value: "design",
        label: "Design",
        children: [
          { value: "web", label: "Web" },
          { value: "brand", label: "Brand" },
        ],
      },
      { value: "engineering", label: "Engineering" },
    ],
  },
  {
    value: "business",
    label: "Business",
    children: [
      { value: "sales", label: "Sales" },
      { value: "finance", label: "Finance" },
    ],
  },
]
function ChipExample() {
  const [selected, setSelected] = useState(false)
  const [visible, setVisible] = useState(true)
  return (
    <div className="flex flex-wrap gap-2">
      <Chip selected={selected} onSelectedChange={setSelected}>
        Design
      </Chip>
      {visible ? (
        <Chip
          onRemove={() => setVisible(false)}
          removeLabel="Remove engineering"
        >
          Engineering
        </Chip>
      ) : (
        <Button variant="ghost" onClick={() => setVisible(true)}>
          Restore chip
        </Button>
      )}
      <Chip disabled>Archived</Chip>
    </div>
  )
}
function FormExample() {
  const [saved, setSaved] = useState(false)
  const form = useForm({ defaultValues: { name: "", people: [{ email: "" }] } })
  const members = useFieldArray({ control: form.control, name: "people" })
  return (
    <Form
      form={form}
      onSubmit={async () => {
        setSaved(true)
      }}
      className="w-full max-w-sm"
    >
      <FormField
        name="name"
        label="Project name"
        rules={{ required: "Enter a project name." }}
        render={({ field, inputProps }) => <Input {...field} {...inputProps} />}
      />
      {members.fields.map((member, i) => (
        <div key={member.id} className="flex items-end gap-2">
          <FormField
            name={`people.${i}.email`}
            className="min-w-0 flex-1"
            label={`Member ${i + 1} email`}
            rules={{
              required: "Enter an email.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email.",
              },
            }}
            render={({ field, inputProps }) => (
              <Input type="email" {...field} {...inputProps} />
            )}
          />
          <Button
            type="button"
            variant="ghost"
            aria-label={`Remove member ${i + 1}`}
            onClick={() => members.remove(i)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => members.append({ email: "" })}
      >
        Add member
      </Button>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save project
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            form.reset()
            setSaved(false)
          }}
        >
          Reset
        </Button>
      </div>
      {saved && (
        <p role="status" className="text-sm">
          Project saved in this preview.
        </p>
      )}
    </Form>
  )
}
function TransferExample() {
  return (
    <div className="w-full">
      <Transfer
        label="Project access"
        items={[
          { id: "alex", label: "Alex Lee" },
          { id: "jamie", label: "Jamie Chen" },
          { id: "sam", label: "Sam Rivera" },
          { id: "taylor", label: "Taylor Brooks", disabled: true },
        ]}
        defaultValue={["sam"]}
      />
    </div>
  )
}
function TransitionExample() {
  const [active, setActive] = useState(false)
  return (
    <Stack>
      <Button
        variant="outline"
        onClick={() => setActive((v) => !v)}
        aria-pressed={active}
      >
        <Swap checked={active} active="Show overview" inactive="Show details" />
      </Button>
      <ContentTransition stateKey={String(active)}>
        <p className="text-sm">
          {active
            ? "The project is ready for review."
            : "Website redesign · In progress"}
        </p>
      </ContentTransition>
    </Stack>
  )
}
function ClientExample() {
  const wide = useMediaQuery("(min-width: 768px)")
  return (
    <ClientOnly fallback={<p>Loading display preferences…</p>}>
      <p className="text-sm">This is a {wide ? "wide" : "narrow"} viewport.</p>
    </ClientOnly>
  )
}
function PopconfirmExample() {
  const [removed, setRemoved] = useState(false)
  return removed ? (
    <Button variant="outline" onClick={() => setRemoved(false)}>
      Restore preview file
    </Button>
  ) : (
    <Popconfirm
      trigger="Delete file"
      title="Delete the draft?"
      description="This removes the draft from this preview."
      confirmLabel="Delete draft"
      onConfirm={() => setRemoved(true)}
    />
  )
}
function NotificationExample() {
  const [visible, setVisible] = useState(true)
  return visible ? (
    <Notification
      title="Review requested"
      description="Alex left a comment on the homepage."
      onDismiss={() => setVisible(false)}
      actions={
        <Button variant="outline" size="sm" onClick={() => setVisible(false)}>
          Mark read
        </Button>
      }
    />
  ) : (
    <Button variant="outline" onClick={() => setVisible(true)}>
      Show notification
    </Button>
  )
}
function NavigationExample() {
  const [selected, setSelected] = useState("home")
  return (
    <div className="w-full">
      <BottomNavigation
        current={selected}
        onNavigate={setSelected}
        items={[
          { id: "home", label: "Home", href: "#home", icon: <HouseIcon /> },
          {
            id: "projects",
            label: "Projects",
            href: "#projects",
            icon: <FolderIcon />,
          },
          {
            id: "updates",
            label: "Updates",
            href: "#updates",
            icon: <BellIcon />,
          },
        ]}
      />
      <div className="mt-3 flex gap-2">
        {["home", "projects", "updates"].map((name) => (
          <Button
            key={name}
            variant="ghost"
            size="sm"
            onClick={() => setSelected(name)}
          >
            {name}
          </Button>
        ))}
      </div>
    </div>
  )
}
function SpeedExample() {
  const [action, setAction] = useState("")
  return (
    <Stack>
      <SpeedDial
        label="Create"
        actions={[
          {
            id: "note",
            label: "New note",
            onSelect: () => setAction("Note created in this preview."),
          },
          {
            id: "project",
            label: "New project",
            onSelect: () => setAction("Project created in this preview."),
          },
        ]}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {action || "Choose an action."}
      </p>
    </Stack>
  )
}
function FloatingExample() {
  const [created, setCreated] = useState(false)
  return (
    <Stack>
      <FloatingAction label="Create project" onClick={() => setCreated(true)}>
        <PlusIcon aria-hidden="true" />
      </FloatingAction>
      {created && (
        <p role="status" className="text-sm">
          Project created in this preview.
        </p>
      )}
    </Stack>
  )
}
function CountdownExample() {
  const [deadline, setDeadline] = useState(() => Date.now() + 90000)
  const [paused, setPaused] = useState(false)
  const [expired, setExpired] = useState(false)
  return (
    <Stack>
      <Countdown
        deadline={deadline}
        label="Time remaining"
        paused={paused}
        onExpire={() => setExpired(true)}
      />
      <Inline>
        <Button variant="outline" onClick={() => setPaused((v) => !v)}>
          {paused ? "Resume" : "Pause display"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setDeadline(Date.now() + 90000)
            setExpired(false)
          }}
        >
          Reset
        </Button>
      </Inline>
      {expired && <p role="status">Time is up.</p>}
    </Stack>
  )
}
function TourExample() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const target = useRef<HTMLDivElement>(null)
  return (
    <Stack>
      <div ref={target} className="rounded-lg border p-4 text-sm">
        Your project workspace
      </div>
      <Button
        variant="outline"
        onClick={() => {
          setStep(0)
          setOpen(true)
        }}
      >
        Start tour
      </Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        step={step}
        onStepChange={setStep}
        steps={[
          {
            id: "workspace",
            title: "Your workspace",
            description: "Keep project notes and tasks together.",
            target: () => target.current,
          },
          {
            id: "ready",
            title: "You’re ready",
            description: "Create your first project when you are ready.",
          },
        ]}
      />
    </Stack>
  )
}
const previews = {
  typography: () => (
    <Stack>
      <Heading level={2}>Project overview</Heading>
      <Text muted>Notes, decisions, and upcoming work.</Text>
      <Prose>
        <p>
          Use <InlineCode>Heading</InlineCode> and <InlineCode>Text</InlineCode>{" "}
          to keep hierarchy consistent.
        </p>
      </Prose>
    </Stack>
  ),
  link: () => (
    <Inline>
      <Link href="/guides">Design guide</Link>
      <Link href="https://www.notion.com" external>
        Notion
      </Link>
    </Inline>
  ),
  container: () => (
    <Container size="sm" className="border-x border-dashed py-6">
      <Text>Consistent content widths and responsive gutters.</Text>
    </Container>
  ),
  stack: () => (
    <Stack>
      <Surface bordered className="p-4">
        Project notes
      </Surface>
      <Inline>
        <Button>New project</Button>
        <Button variant="outline">Browse</Button>
      </Inline>
    </Stack>
  ),
  "layout-grid": () => (
    <LayoutGrid minColumnWidth={150} className="w-full">
      {["Notes", "Projects", "People"].map((label) => (
        <Surface key={label} bordered className="p-5 text-sm">
          {label}
        </Surface>
      ))}
    </LayoutGrid>
  ),
  surface: () => (
    <Inline>
      <Surface bordered className="p-6">
        Default surface
      </Surface>
      <Surface elevation="raised" bordered className="p-6">
        Raised surface
      </Surface>
    </Inline>
  ),
  descriptions: () => (
    <Descriptions
      className="w-full"
      items={[
        { id: "name", label: "Project", value: "Website redesign" },
        { id: "owner", label: "Owner", value: "Alex Lee" },
        {
          id: "status",
          label: "Status",
          value: <Status status="info">In progress</Status>,
        },
        { id: "due", label: "Due date", value: "December 8" },
      ]}
    />
  ),
  "circular-progress": () => (
    <Inline>
      <CircularProgress label="Upload progress" value={64} />
      <CircularProgress label="Loading results" />
      <Text size="sm" muted>
        64% uploaded
      </Text>
    </Inline>
  ),
  chip: ChipExample,
  indicator: () => (
    <Inline gap={8}>
      <Indicator label="12 unread updates" count={12}>
        <BellIcon className="size-6" />
      </Indicator>
      <Status status="success">Connected</Status>
      <Status status="warning">Pending</Status>
    </Inline>
  ),
  "preview-frame": () => (
    <PreviewFrame title="project.ankvale" className="w-full max-w-md">
      <div className="p-8">
        <Heading level={3} size="subsection">
          Website redesign
        </Heading>
        <Text muted size="sm">
          Everything in one place.
        </Text>
      </div>
    </PreviewFrame>
  ),
  "attached-group": () => (
    <AttachedGroup label="Workspace URL">
      <Button variant="outline" disabled>
        ankvale.example/
      </Button>
      <Input aria-label="Workspace slug" defaultValue="studio" />
      <Button>Save</Button>
    </AttachedGroup>
  ),
  "layered-stack": () => (
    <LayeredStack className="m-5 w-56">
      <Surface bordered className="h-32 p-5">
        Notes
      </Surface>
      <Surface bordered className="h-32 p-5">
        Projects
      </Surface>
      <Surface bordered className="h-32 p-5">
        People
      </Surface>
    </LayeredStack>
  ),
  masonry: () => (
    <Masonry
      minColumnWidth={150}
      className="w-full"
      items={[
        {
          id: "1",
          content: (
            <Surface bordered className="p-5 text-sm">
              A project starts with a question.
            </Surface>
          ),
        },
        {
          id: "2",
          content: (
            <Image src={blueImage} alt="Circle study" className="rounded-lg" />
          ),
        },
        {
          id: "3",
          content: (
            <Surface bordered className="p-5 text-sm">
              Collect references. Share a draft. Ask for feedback.
            </Surface>
          ),
        },
      ]}
    />
  ),
  "content-transition": TransitionExample,
  "client-only": ClientExample,
  form: FormExample,
  "date-picker": () => (
    <Stack className="w-full max-w-lg">
      <DatePicker label="Due date" defaultValue="2026-12-08" />
      <DateField label="Review date" />
      <DateRangePicker label="Project dates" />
    </Stack>
  ),
  "time-picker": () => (
    <Stack className="w-full max-w-lg">
      <TimePicker label="Meeting time" defaultValue="09:30" step={900} />
      <TimeRangePicker
        label="Office hours"
        defaultValue={{ start: "09:00", end: "17:00" }}
      />
    </Stack>
  ),
  "date-time-picker": () => (
    <Stack className="w-full max-w-lg">
      <DateTimePicker label="Publish at" timeZone="Asia/Singapore" />
      <DateTimeRangePicker label="Event schedule" timeZone="Asia/Singapore" />
    </Stack>
  ),
  "period-picker": () => (
    <LayoutGrid minColumnWidth={140} className="w-full">
      <PeriodPicker
        label="Reporting month"
        kind="month"
        defaultValue="2026-11"
      />
      <PeriodPicker label="Quarter" kind="quarter" defaultValue="2026-Q4" />
      <PeriodPicker label="Year" kind="year" defaultValue="2026" />
      <PeriodPicker label="Week" kind="week" />
    </LayoutGrid>
  ),
  transfer: TransferExample,
  cascader: () => <Cascader label="Department" options={folders} />,
  "tree-select": () => (
    <div className="w-full max-w-sm">
      <TreeSelect label="Teams" multiple options={folders} />
    </div>
  ),
  mentions: () => (
    <div className="w-full max-w-md">
      <Mentions
        label="Comment"
        defaultValue=""
        options={[
          { id: "alex", label: "Alex Lee", value: "alex" },
          { id: "jamie", label: "Jamie Chen", value: "jamie" },
        ]}
      />
      <Text size="sm" muted>
        Type @ to mention someone.
      </Text>
    </div>
  ),
  popconfirm: PopconfirmExample,
  notification: NotificationExample,
  result: () => (
    <Result
      status="success"
      title="Project created"
      description="Invite your team when you are ready."
      actions={
        <Button nativeButton={false} render={<a href="/playground#form" />}>
          Create another
        </Button>
      }
    />
  ),
  "bottom-navigation": NavigationExample,
  "floating-action": FloatingExample,
  "speed-dial": SpeedExample,
  affix: () => (
    <Stack>
      <div id="affix-example-start" className="text-sm">
        Project overview
      </div>
      <Affix offset={12} className="rounded border bg-background p-3 text-sm">
        Sticky toolbar
      </Affix>
      <BackToTop targetId="affix-example-start" />
    </Stack>
  ),
  image: () => <ImageLightbox {...gallery[0]!} className="max-w-sm" />,
  "image-list": () => (
    <ImageList
      images={gallery}
      label="Form studies"
      className="md:grid-cols-2"
    />
  ),
  "image-compare": () => (
    <div className="w-full max-w-lg">
      <ImageCompare
        label="Compare studies"
        before={gallery[0]!}
        after={gallery[1]!}
      />
    </div>
  ),
  countdown: CountdownExample,
  "qr-code": () => (
    <QRCode
      value="https://ankvale.example/projects"
      label="Project link QR code"
      download
    />
  ),
  tour: TourExample,
}
export const systemPreviewNames = Object.keys(previews)
export function SystemPreview({ name }: { name: string }) {
  const Preview = previews[name as keyof typeof previews]
  return Preview ? <Preview /> : <p>Unknown component.</p>
}
