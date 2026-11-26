"use client"
import { useState, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import {
  AuthPanel,
  PasswordRecovery,
  VerificationPanel,
  OrganizationOnboarding,
  WorkspaceSwitcher,
} from "@ankvale/ui/blocks/app-auth"
import {
  ProfileSettings,
  WorkspaceSettings,
  MembersPanel,
  PermissionsEditor,
  SecuritySettings,
  NotificationPreferences,
} from "@ankvale/ui/blocks/app-settings"
import {
  BillingOverview,
  InvoiceDetails,
} from "@ankvale/ui/blocks/app-billing"
import {
  IntegrationsPanel,
  ApiKeysPanel,
  WebhooksPanel,
} from "@ankvale/ui/blocks/app-integrations"
import {
  AuditLog,
  NotificationCenter,
  GlobalSearch,
  CollectionToolbar,
  CrudCollection,
  RecordDetail,
  type CollectionFilter,
  type CrudRecord,
} from "@ankvale/ui/blocks/app-data"
import {
  ImportExportWizard,
  FileManager,
  type ManagedFile,
} from "@ankvale/ui/blocks/app-files"
import {
  ProjectDetail,
  CommentThread,
  type ProjectTask,
  type ThreadComment,
} from "@ankvale/ui/blocks/app-projects"
import {
  BookingFlow,
  SetupChecklist,
  HelpCenter,
  FeedbackForm,
  type SetupTask,
} from "@ankvale/ui/blocks/app-support"
import {
  AppStatePage,
  DangerZone,
  UnsavedChangesDialog,
} from "@ankvale/ui/blocks/app-safety"
import {
  ProductCatalog,
  ProductDetail,
  CartPanel,
  CheckoutFlow,
  OrderManagement,
  type CatalogProduct,
  type CartItem,
} from "@ankvale/ui/blocks/app-commerce"
function PreviewStatus({
  message,
  children,
}: {
  message: string
  children: ReactNode
}) {
  return (
    <div className="w-full space-y-4">
      {children}
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
function usePreviewAction() {
  const [message, setMessage] = useState("")
  return {
    message,
    save: async () => {
      setMessage("Updated in this preview.")
    },
  }
}
const roleOptions = [
  { id: "admin", label: "Admin" },
  { id: "member", label: "Member" },
  { id: "viewer", label: "Viewer" },
]
const initialMembers = [
  {
    id: "alex",
    name: "Alex Lee",
    email: "alex@example.com",
    role: "admin",
    status: "active" as const,
  },
  {
    id: "jamie",
    name: "Jamie Chen",
    email: "jamie@example.com",
    role: "member",
    status: "active" as const,
  },
  {
    id: "sam",
    name: "Sam Rivera",
    email: "sam@example.com",
    role: "viewer",
    status: "invited" as const,
  },
]
const initialTasks: ProjectTask[] = [
  {
    id: "brief",
    title: "Write the brief",
    status: "done",
    assignee: "alex",
    due: "2026-12-01",
  },
  {
    id: "design",
    title: "Design homepage",
    status: "doing",
    assignee: "jamie",
    due: "2026-12-08",
  },
  {
    id: "review",
    title: "Review prototype",
    status: "todo",
    assignee: "alex",
    due: "2026-12-10",
  },
]
const taskStatuses = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
]
const productData: CatalogProduct[] = [
  {
    id: "notebook",
    name: "Studio notebook",
    description: "A notebook for plans and sketches.",
    category: "Stationery",
    price: 2400,
    currency: "USD",
    available: true,
    options: [{ id: "cover", label: "Cover", values: ["Blue", "Ink"] }],
  },
  {
    id: "planner",
    name: "Weekly planner",
    description: "A quiet place to plan the week.",
    category: "Stationery",
    price: 1800,
    currency: "USD",
    available: true,
  },
]
const initialCart: CartItem[] = [
  { id: "notebook", name: "Studio notebook", quantity: 1, unitPrice: 2400 },
  { id: "planner", name: "Weekly planner", quantity: 2, unitPrice: 1800 },
]
function AuthPreview() {
  const { message, save } = usePreviewAction()
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  return (
    <PreviewStatus message={message}>
      <div className="mb-4 flex gap-2">
        <Button
          variant="outline"
          aria-pressed={mode === "sign-in"}
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </Button>
        <Button
          variant="outline"
          aria-pressed={mode === "sign-up"}
          onClick={() => setMode("sign-up")}
        >
          Sign up
        </Button>
      </div>
      <AuthPanel
        key={mode}
        mode={mode}
        onSubmit={save}
        forgotPasswordHref="/blocks#app-password-recovery"
      />
    </PreviewStatus>
  )
}
function PasswordPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <PasswordRecovery onSubmit={save} />
    </PreviewStatus>
  )
}
function VerifyPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <VerificationPanel onVerify={save} onResend={save} />
    </PreviewStatus>
  )
}
function OnboardingPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <OrganizationOnboarding onComplete={save} onJoin={save} />
    </PreviewStatus>
  )
}
function WorkspacePreview() {
  const [value, setValue] = useState("studio")
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <WorkspaceSwitcher
        account={<p>Alex Lee · alex@example.com</p>}
        workspaces={[
          { id: "studio", name: "Studio" },
          { id: "research", name: "Research" },
        ]}
        value={value}
        onValueChange={setValue}
        onCreate={save}
        onJoin={save}
      />
    </PreviewStatus>
  )
}
function ProfilePreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <ProfileSettings
        profile={{
          name: "Alex Lee",
          email: "alex@example.com",
          bio: "Product designer",
        }}
        onSave={save}
      />
    </PreviewStatus>
  )
}
function WorkspaceSettingsPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <WorkspaceSettings
        workspace={{
          name: "Studio",
          email: "team@example.com",
          website: "https://example.com",
          timeZone: "Asia/Singapore",
        }}
        onSave={save}
      />
    </PreviewStatus>
  )
}
function MembersPreview() {
  const [members, setMembers] = useState(initialMembers)
  return (
    <MembersPanel
      members={members}
      roles={roleOptions}
      onInvite={async (email, role) =>
        setMembers((v) => [
          ...v,
          {
            id: crypto.randomUUID(),
            name: email,
            email,
            role,
            status: "invited",
          },
        ])
      }
      onRoleChange={async (id, role) =>
        setMembers((v) => v.map((m) => (m.id === id ? { ...m, role } : m)))
      }
      onRemove={async (id) => setMembers((v) => v.filter((m) => m.id !== id))}
      onRevoke={async (id) => setMembers((v) => v.filter((m) => m.id !== id))}
    />
  )
}
function PermissionsPreview() {
  const [grants, setGrants] = useState<Record<string, string[]>>({
    admin: ["read", "write", "invite"],
    member: ["read", "write"],
    viewer: ["read"],
  })
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <PermissionsEditor
        roles={roleOptions}
        permissions={[
          { id: "read", label: "View projects" },
          { id: "write", label: "Edit projects" },
          { id: "invite", label: "Invite members" },
        ]}
        grants={grants}
        onChange={setGrants}
        onSave={save}
      />
    </PreviewStatus>
  )
}
function SecurityPreview() {
  const { message, save } = usePreviewAction()
  const [sessions, setSessions] = useState([
    {
      id: "current",
      device: "Chrome on macOS",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "phone",
      device: "Safari on iPhone",
      lastActive: "Yesterday",
      current: false,
    },
  ])
  return (
    <PreviewStatus message={message}>
      <SecuritySettings
        sessions={sessions}
        onChangePassword={save}
        mfa={
          <div className="rounded border p-4">
            <p className="text-sm font-medium">Two-step verification</p>
            <Button variant="outline" className="mt-3" onClick={save}>
              Set up verification
            </Button>
          </div>
        }
        onRevokeSession={async (id) =>
          setSessions((v) => v.filter((s) => s.id !== id))
        }
      />
    </PreviewStatus>
  )
}
function PreferencesPreview() {
  const [value, setValue] = useState<Record<string, string[]>>({
    mentions: ["email", "in-app"],
    releases: ["email"],
  })
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <NotificationPreferences
        categories={[
          { id: "mentions", label: "Mentions" },
          { id: "releases", label: "Product updates" },
        ]}
        channels={[
          { id: "email", label: "Email" },
          { id: "in-app", label: "In app" },
        ]}
        value={value}
        onChange={setValue}
        onSave={save}
      />
    </PreviewStatus>
  )
}
function BillingPreview() {
  const [current, setCurrent] = useState("team")
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <BillingOverview
        currentPlan={current}
        plans={[
          {
            id: "starter",
            name: "Starter",
            price: "$0 / month",
            features: ["3 members", "5 projects"],
          },
          {
            id: "team",
            name: "Team",
            price: "$18 / member",
            features: ["Unlimited projects", "Team permissions"],
          },
        ]}
        usage={[
          { label: "Storage", used: 24, limit: 100 },
          { label: "Members", used: 8, limit: 20 },
        ]}
        invoices={[
          {
            id: "1042",
            date: "Nov 1, 2026",
            amount: "$144.00",
            status: "Paid",
          },
        ]}
        onChangePlan={async (id) => setCurrent(id)}
        onCancel={save}
        onInvoice={save}
      />
    </PreviewStatus>
  )
}
function InvoicePreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <InvoiceDetails
        number="1042"
        date="Nov 1, 2026"
        status="Paid"
        customer={<p>Studio · team@example.com</p>}
        items={[
          {
            id: "team",
            description: "Team plan · 8 members",
            quantity: 8,
            amount: "$144.00",
          },
        ]}
        subtotal="$144.00"
        tax="$0.00"
        total="$144.00"
        onDownload={save}
        paymentMethod={
          <p className="text-sm text-muted-foreground">
            Payment method: Demo account
          </p>
        }
      />
    </PreviewStatus>
  )
}
function IntegrationsPreview() {
  const [items, setItems] = useState([
    {
      id: "calendar",
      name: "Calendar",
      description: "Keep upcoming meetings in view.",
      category: "Productivity",
      connected: false,
      permissions: ["Read calendar events"],
    },
    {
      id: "drive",
      name: "Cloud files",
      description: "Attach files from your shared drive.",
      category: "Storage",
      connected: true,
    },
  ])
  return (
    <IntegrationsPanel
      items={items}
      onConnect={async (id) =>
        setItems((v) =>
          v.map((i) => (i.id === id ? { ...i, connected: true } : i))
        )
      }
      onDisconnect={async (id) =>
        setItems((v) =>
          v.map((i) => (i.id === id ? { ...i, connected: false } : i))
        )
      }
    />
  )
}
function KeysPreview() {
  const [keys, setKeys] = useState([
    {
      id: "development",
      name: "Development",
      prefix: "demo_",
      created: "Nov 12, 2026",
    },
  ])
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <div className="grid gap-5">
        <ApiKeysPanel
          keys={keys}
          onCreate={async (name) => {
            setKeys((v) => [
              ...v,
              {
                id: crypto.randomUUID(),
                name,
                prefix: "preview_",
                created: "Today",
              },
            ])
            return { secret: "preview_only_not_a_live_key" }
          }}
          onRevoke={async (id) => setKeys((v) => v.filter((k) => k.id !== id))}
        />
        <WebhooksPanel
          endpoints={[
            {
              id: "project",
              url: "https://example.com/hooks",
              events: ["project.updated"],
            },
          ]}
          deliveries={[
            {
              id: "delivery",
              event: "project.updated",
              time: "Nov 26, 10:30",
              status: "failed",
            },
          ]}
          onCreate={save}
          onDelete={save}
          onRetry={save}
        />
      </div>
    </PreviewStatus>
  )
}
function AuditPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <AuditLog
        entries={[
          {
            id: "1",
            actor: "Alex Lee",
            action: "updated",
            object: "Website redesign",
            time: "2026-11-26 10:30",
            detail: <p>Status changed to In progress.</p>,
          },
          {
            id: "2",
            actor: "Jamie Chen",
            action: "invited",
            object: "sam@example.com",
            time: "2026-11-25 14:20",
          },
        ]}
        onExport={save}
      />
    </PreviewStatus>
  )
}
function NotificationsPreview() {
  const [items, setItems] = useState([
    {
      id: "review",
      title: "Review requested",
      description: "Alex requested feedback on the homepage.",
      time: "10 minutes ago",
      read: false,
      group: "Projects",
    },
    {
      id: "invite",
      title: "Invitation accepted",
      description: "Jamie joined Studio.",
      time: "Yesterday",
      read: true,
      group: "Workspace",
    },
  ])
  return (
    <NotificationCenter
      items={items}
      onRead={async (id) =>
        setItems((v) => v.map((i) => (i.id === id ? { ...i, read: true } : i)))
      }
      onDismiss={async (id) => setItems((v) => v.filter((i) => i.id !== id))}
      onReadAll={async () =>
        setItems((v) => v.map((i) => ({ ...i, read: true })))
      }
    />
  )
}
async function searchPreview(query: string, signal: AbortSignal) {
  if (signal.aborted) throw new Error("Aborted")
  return [
    {
      id: "project",
      title: "Website redesign",
      description: "Project · In progress",
      group: "Projects",
      href: "/examples/dashboard",
    },
    {
      id: "notes",
      title: "Design notes",
      description: "Decisions and references",
      group: "Documents",
      href: "/guides",
    },
  ].filter((r) =>
    `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase())
  )
}
function SearchPreview() {
  return (
    <GlobalSearch
      search={searchPreview}
      recentQueries={["design", "website"]}
    />
  )
}
function FiltersPreview() {
  const [value, setValue] = useState<CollectionFilter>({ query: "", rules: [] })
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <CollectionToolbar
        value={value}
        onChange={setValue}
        fields={[
          { id: "status", label: "Status" },
          { id: "owner", label: "Owner" },
        ]}
        savedViews={[
          {
            id: "mine",
            name: "My projects",
            filter: {
              query: "",
              rules: [
                {
                  id: "owner",
                  field: "owner",
                  operator: "equals",
                  value: "Alex",
                },
              ],
            },
          },
        ]}
        onSaveView={save}
      />
      <pre className="overflow-auto rounded border p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </PreviewStatus>
  )
}
function CrudPreview() {
  const [records, setRecords] = useState<CrudRecord[]>([
    { id: "1", values: { name: "Website redesign", status: "In progress" } },
    { id: "2", values: { name: "Product launch", status: "Planned" } },
  ])
  return (
    <CrudCollection
      title="Projects"
      records={records}
      fields={[
        { name: "name", label: "Project name", required: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: "Planned", label: "Planned" },
            { value: "In progress", label: "In progress" },
            { value: "Done", label: "Done" },
          ],
        },
      ]}
      onCreate={async (values) =>
        setRecords((v) => [...v, { id: crypto.randomUUID(), values }])
      }
      onUpdate={async (id, values) =>
        setRecords((v) => v.map((r) => (r.id === id ? { ...r, values } : r)))
      }
      onDelete={async (id) => setRecords((v) => v.filter((r) => r.id !== id))}
      onBulkDelete={async (ids) =>
        setRecords((v) => v.filter((r) => !ids.includes(r.id)))
      }
    />
  )
}
function DetailPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <RecordDetail
        title="Website redesign"
        description="Refresh the public website."
        properties={[
          { id: "owner", label: "Owner", value: "Alex Lee" },
          { id: "status", label: "Status", value: "In progress" },
          { id: "due", label: "Due", value: "Dec 8, 2026" },
        ]}
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <p className="text-sm">
                Design, build, and review the new homepage.
              </p>
            ),
          },
          {
            id: "activity",
            label: "Activity",
            content: <p className="text-sm">Alex updated the project brief.</p>,
          },
        ]}
        onEdit={save}
      />
    </PreviewStatus>
  )
}
function ImportPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <ImportExportWizard
        fields={[
          { id: "name", label: "Name", required: true },
          { id: "email", label: "Email", required: true },
        ]}
        uniqueBy="email"
        onImport={async (rows) => ({ created: rows.length })}
        onExport={save}
      />
    </PreviewStatus>
  )
}
function FilesPreview() {
  const [files, setFiles] = useState<ManagedFile[]>([
    { id: "design", name: "Design", kind: "folder" },
    {
      id: "brief",
      name: "Project brief.pdf",
      kind: "file",
      size: "240 KB",
      modified: "Yesterday",
    },
    {
      id: "notes",
      name: "Research notes.md",
      kind: "file",
      parentId: "design",
      size: "12 KB",
    },
  ])
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <FileManager
        files={files}
        onUpload={async (incoming, parentId) =>
          setFiles((v) => [
            ...v,
            ...incoming.map((f) => ({
              id: crypto.randomUUID(),
              name: f.name,
              kind: "file" as const,
              parentId,
              size: `${f.size} bytes`,
            })),
          ])
        }
        onRename={async (id, name) =>
          setFiles((v) => v.map((f) => (f.id === id ? { ...f, name } : f)))
        }
        onMove={async (id, parentId) =>
          setFiles((v) => v.map((f) => (f.id === id ? { ...f, parentId } : f)))
        }
        onShare={save}
        onDelete={async (id) => setFiles((v) => v.filter((f) => f.id !== id))}
      />
    </PreviewStatus>
  )
}
function ProjectPreview() {
  const [tasks, setTasks] = useState(initialTasks)
  return (
    <ProjectDetail
      name="Website redesign"
      tasks={tasks}
      statuses={taskStatuses}
      people={[
        { id: "alex", name: "Alex Lee" },
        { id: "jamie", name: "Jamie Chen" },
      ]}
      onSaveTask={async (task) =>
        setTasks((v) => v.map((t) => (t.id === task.id ? task : t)))
      }
      onCreateTask={async (task) =>
        setTasks((v) => [...v, { ...task, id: crypto.randomUUID() }])
      }
      onTasksChange={async (next) => setTasks(next)}
    />
  )
}
function CommentsPreview() {
  const [comments, setComments] = useState<ThreadComment[]>([
    {
      id: "brief",
      author: "Alex Lee",
      body: "The brief is ready for review.",
      time: "Today",
      editable: true,
    },
    {
      id: "reply",
      author: "Jamie Chen",
      body: "I will review it this afternoon.",
      time: "Today",
      parentId: "brief",
    },
  ])
  return (
    <CommentThread
      comments={comments}
      onCreate={async (body, parentId) =>
        setComments((v) => [
          ...v,
          {
            id: crypto.randomUUID(),
            author: "You",
            body,
            time: "Just now",
            parentId,
            editable: true,
          },
        ])
      }
      onEdit={async (id, body) =>
        setComments((v) => v.map((c) => (c.id === id ? { ...c, body } : c)))
      }
      onResolve={async (id, resolved) =>
        setComments((v) => v.map((c) => (c.id === id ? { ...c, resolved } : c)))
      }
    />
  )
}
function BookingPreview() {
  return (
    <BookingFlow
      timeZone="Asia/Singapore"
      slots={[
        { id: "9", date: "2026-12-08", label: "9:00 AM", available: true },
        { id: "10", date: "2026-12-08", label: "10:00 AM", available: false },
        { id: "11", date: "2026-12-08", label: "11:00 AM", available: true },
      ]}
      onBook={async (details) => ({
        id: "PREVIEW-1042",
        timeLabel:
          details.slotId === "9" ? "Dec 8 · 9:00 AM" : "Dec 8 · 11:00 AM",
        message: "Reserved in this preview.",
      })}
      onCancel={async () => {}}
      onReschedule={async (_id, slotId) => ({
        id: "PREVIEW-1042",
        timeLabel: `Dec 8 · ${slotId}:00 AM`,
      })}
    />
  )
}
function SetupPreview() {
  const [items, setItems] = useState<SetupTask[]>([
    {
      id: "profile",
      title: "Complete your profile",
      description: "Add your name and details.",
      completed: true,
      actionLabel: "Edit profile",
    },
    {
      id: "invite",
      title: "Invite your team",
      description: "Work together in your workspace.",
      completed: false,
      actionLabel: "Invite members",
    },
    {
      id: "project",
      title: "Create your first project",
      completed: false,
      actionLabel: "Create project",
    },
  ])
  return (
    <SetupChecklist
      items={items}
      onAction={async (id) =>
        setItems((v) =>
          v.map((i) => (i.id === id ? { ...i, completed: true } : i))
        )
      }
      onSkip={async (id) =>
        setItems((v) =>
          v.map((i) => (i.id === id ? { ...i, skipped: true } : i))
        )
      }
    />
  )
}
function HelpPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <HelpCenter
        articles={[
          {
            id: "start",
            title: "Create a project",
            category: "Getting started",
            excerpt: "Organize your first project.",
            content: (
              <p>
                Choose New project, give it a name, and invite your
                collaborators.
              </p>
            ),
          },
          {
            id: "members",
            title: "Invite teammates",
            category: "Workspace",
            excerpt: "Add people to your workspace.",
            content: (
              <p>
                Open Members in workspace settings and enter their email
                address.
              </p>
            ),
          },
        ]}
        onContact={save}
      />
    </PreviewStatus>
  )
}
function FeedbackPreview() {
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <FeedbackForm
        categories={[
          { id: "bug", label: "Report a problem" },
          { id: "idea", label: "Suggest an improvement" },
        ]}
        onSubmit={save}
      />
    </PreviewStatus>
  )
}
function StatePreview() {
  const [kind, setKind] = useState<
    "forbidden" | "error" | "offline" | "expired"
  >("forbidden")
  return (
    <div className="w-full space-y-4">
      <select
        aria-label="App state"
        value={kind}
        onChange={(e) => setKind(e.target.value as typeof kind)}
        className="h-9 rounded border bg-background px-3"
      >
        <option value="forbidden">Permission denied</option>
        <option value="error">Server error</option>
        <option value="offline">Offline</option>
        <option value="expired">Session expired</option>
      </select>
      <AppStatePage
        kind={kind}
        actions={
          <Button nativeButton={false} render={<a href="/playground" />}>
            Return to components
          </Button>
        }
      />
    </div>
  )
}
function SafetyPreview() {
  const { message, save } = usePreviewAction()
  const [open, setOpen] = useState(false)
  return (
    <PreviewStatus message={message}>
      <div className="space-y-5">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Preview unsaved changes
        </Button>
        <UnsavedChangesDialog
          open={open}
          onOpenChange={setOpen}
          onDiscard={save}
          onSave={save}
        />
        <DangerZone name="Studio" onDelete={save} />
      </div>
    </PreviewStatus>
  )
}
function CatalogPreview() {
  const [selected, setSelected] = useState<string | null>(null)
  const { message, save } = usePreviewAction()
  const product = productData.find((p) => p.id === selected)
  return (
    <PreviewStatus message={message}>
      {product ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelected(null)}>
            ← Products
          </Button>
          <ProductDetail
            key={product.id}
            product={product}
            onAddToCart={save}
          />
        </div>
      ) : (
        <ProductCatalog products={productData} onView={setSelected} />
      )}
    </PreviewStatus>
  )
}
function CheckoutPreview() {
  const [items, setItems] = useState(initialCart)
  const [checkout, setCheckout] = useState(false)
  return checkout ? (
    <div className="w-full space-y-4">
      <Button variant="ghost" onClick={() => setCheckout(false)}>
        ← Cart
      </Button>
      <CheckoutFlow
        items={items}
        currency="USD"
        shippingCost={500}
        tax={0}
        payment={
          <p className="rounded border p-4 text-sm">
            Payment method · Preview account
          </p>
        }
        onPlaceOrder={async () => ({
          id: "PREVIEW-1042",
          summary: "Your order was created in this preview.",
        })}
      />
    </div>
  ) : (
    <CartPanel
      items={items}
      currency="USD"
      onQuantityChange={async (id, quantity) =>
        setItems((v) => v.map((i) => (i.id === id ? { ...i, quantity } : i)))
      }
      onRemove={async (id) => setItems((v) => v.filter((i) => i.id !== id))}
      onCheckout={() => setCheckout(true)}
    />
  )
}
function OrdersPreview() {
  const [orders, setOrders] = useState([
    {
      id: "1042",
      customer: "Alex Lee",
      date: "Nov 26, 2026",
      status: "pending",
      total: 6000,
      currency: "USD",
      items: initialCart,
      shippingAddress: "1 Example Street, Singapore",
    },
  ])
  const { message, save } = usePreviewAction()
  return (
    <PreviewStatus message={message}>
      <OrderManagement
        orders={orders}
        onFulfill={async (id) =>
          setOrders((v) =>
            v.map((o) => (o.id === id ? { ...o, status: "fulfilled" } : o))
          )
        }
        onRefundRequest={save}
      />
    </PreviewStatus>
  )
}
const previews = {
  "app-auth": AuthPreview,
  "app-password-recovery": PasswordPreview,
  "app-verification": VerifyPreview,
  "app-onboarding": OnboardingPreview,
  "app-workspace-switcher": WorkspacePreview,
  "app-profile-settings": ProfilePreview,
  "app-workspace-settings": WorkspaceSettingsPreview,
  "app-members": MembersPreview,
  "app-permissions": PermissionsPreview,
  "app-security-settings": SecurityPreview,
  "app-notification-preferences": PreferencesPreview,
  "app-billing": BillingPreview,
  "app-invoice": InvoicePreview,
  "app-integrations": IntegrationsPreview,
  "app-api-keys": KeysPreview,
  "app-audit-log": AuditPreview,
  "app-notifications": NotificationsPreview,
  "app-search": SearchPreview,
  "app-collection-toolbar": FiltersPreview,
  "app-crud": CrudPreview,
  "app-record-detail": DetailPreview,
  "app-import-export": ImportPreview,
  "app-files": FilesPreview,
  "app-project-detail": ProjectPreview,
  "app-comments": CommentsPreview,
  "app-booking": BookingPreview,
  "app-setup": SetupPreview,
  "app-help": HelpPreview,
  "app-feedback": FeedbackPreview,
  "app-state": StatePreview,
  "app-danger-zone": SafetyPreview,
  "app-catalog": CatalogPreview,
  "app-checkout": CheckoutPreview,
  "app-orders": OrdersPreview,
}
export const appBlockPreviewNames = Object.keys(previews)
export function AppBlockPreview({ name }: { name: string }) {
  const Preview = previews[name as keyof typeof previews]
  return Preview ? <Preview /> : <p>Unknown app block.</p>
}
