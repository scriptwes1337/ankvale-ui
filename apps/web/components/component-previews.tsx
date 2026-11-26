"use client"

import * as React from "react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Label } from "@ankvale/ui/components/label"
import {
  FileTextIcon,
  CheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  GearIcon,
  CaretDownIcon,
} from "@phosphor-icons/react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import type { AdditionalPreviewName } from "@/lib/preview-names"
import * as AlertDialog from "@ankvale/ui/components/alert-dialog"
import * as Alert from "@ankvale/ui/components/alert"
import * as AspectRatio from "@ankvale/ui/components/aspect-ratio"
import * as Attachment from "@ankvale/ui/components/attachment"
import * as Breadcrumb from "@ankvale/ui/components/breadcrumb"
import * as Bubble from "@ankvale/ui/components/bubble"
import * as ButtonGroup from "@ankvale/ui/components/button-group"
import * as Calendar from "@ankvale/ui/components/calendar"
import * as Carousel from "@ankvale/ui/components/carousel"
import * as Chart from "@ankvale/ui/components/chart"
import * as CodeBlock from "@ankvale/ui/components/code-block"
import * as Collapsible from "@ankvale/ui/components/collapsible"
import * as Combobox from "@ankvale/ui/components/combobox"
import * as Command from "@ankvale/ui/components/command"
import * as ContextMenu from "@ankvale/ui/components/context-menu"
import * as Direction from "@ankvale/ui/components/direction"
import * as Drawer from "@ankvale/ui/components/drawer"
import * as Empty from "@ankvale/ui/components/empty"
import * as Field from "@ankvale/ui/components/field"
import * as HoverCard from "@ankvale/ui/components/hover-card"
import * as InputGroup from "@ankvale/ui/components/input-group"
import * as InputOtp from "@ankvale/ui/components/input-otp"
import * as Item from "@ankvale/ui/components/item"
import * as Kbd from "@ankvale/ui/components/kbd"
import * as Marker from "@ankvale/ui/components/marker"
import * as Menubar from "@ankvale/ui/components/menubar"
import * as MessageScroller from "@ankvale/ui/components/message-scroller"
import * as Message from "@ankvale/ui/components/message"
import * as NativeSelect from "@ankvale/ui/components/native-select"
import * as NavigationMenu from "@ankvale/ui/components/navigation-menu"
import * as Pagination from "@ankvale/ui/components/pagination"
import * as Popover from "@ankvale/ui/components/popover"
import * as Questionnaire from "@ankvale/ui/components/questionnaire"
import * as RadioGroup from "@ankvale/ui/components/radio-group"
import * as Resizable from "@ankvale/ui/components/resizable"
import * as ScrollArea from "@ankvale/ui/components/scroll-area"
import * as Select from "@ankvale/ui/components/select"
import * as Sheet from "@ankvale/ui/components/sheet"
import * as Sidebar from "@ankvale/ui/components/sidebar"
import * as Spinner from "@ankvale/ui/components/spinner"
import * as Table from "@ankvale/ui/components/table"
import * as Toast from "@ankvale/ui/components/toast"
import * as ToggleGroup from "@ankvale/ui/components/toggle-group"
import * as Trace from "@ankvale/ui/components/trace"

function AlertDialogDemo() {
  const [archived, setArchived] = React.useState(false)
  return (
    <div className="grid justify-items-center gap-4">
      <AlertDialog.AlertDialog>
        <AlertDialog.AlertDialogTrigger render={<Button variant="outline" />}>
          Archive project
        </AlertDialog.AlertDialogTrigger>
        <AlertDialog.AlertDialogContent>
          <AlertDialog.AlertDialogHeader>
            <AlertDialog.AlertDialogTitle>
              Archive this project?
            </AlertDialog.AlertDialogTitle>
            <AlertDialog.AlertDialogDescription>
              You can restore it from the archive at any time.
            </AlertDialog.AlertDialogDescription>
          </AlertDialog.AlertDialogHeader>
          <AlertDialog.AlertDialogFooter>
            <AlertDialog.AlertDialogCancel>
              Cancel
            </AlertDialog.AlertDialogCancel>
            <AlertDialog.AlertDialogAction onClick={() => setArchived(true)}>
              Archive
            </AlertDialog.AlertDialogAction>
          </AlertDialog.AlertDialogFooter>
        </AlertDialog.AlertDialogContent>
      </AlertDialog.AlertDialog>
      <p role="status" className="text-sm text-muted-foreground">
        {archived
          ? "Project archived."
          : "Confirm an action before continuing."}
      </p>
    </div>
  )
}
function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 10, 26)
  )
  return (
    <Calendar.Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 10)}
      className="rounded-xl border"
    />
  )
}
function CarouselDemo() {
  return (
    <Carousel.Carousel className="mx-10 w-full max-w-xs">
      <Carousel.CarouselContent>
        {["Make space.", "Find your focus.", "Build something good."].map(
          (text, index) => (
            <Carousel.CarouselItem key={text}>
              <div className="flex aspect-square flex-col items-center justify-center gap-4 rounded-xl bg-muted">
                <span className="font-mono text-sm text-muted-foreground">
                  {index + 1} / 3
                </span>
                <p className="text-xl font-medium">{text}</p>
              </div>
            </Carousel.CarouselItem>
          )
        )}
      </Carousel.CarouselContent>
      <Carousel.CarouselPrevious />
      <Carousel.CarouselNext />
    </Carousel.Carousel>
  )
}
function ChartDemo() {
  return (
    <Chart.ChartContainer
      className="h-64 w-full max-w-lg"
      config={{ work: { label: "Completed tasks", color: "var(--chart-1)" } }}
    >
      <BarChart
        accessibilityLayer
        data={[
          { day: "Mon", work: 12 },
          { day: "Tue", work: 19 },
          { day: "Wed", work: 15 },
          { day: "Thu", work: 24 },
          { day: "Fri", work: 18 },
        ]}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
        <Chart.ChartTooltip content={<Chart.ChartTooltipContent />} />
        <Bar dataKey="work" fill="var(--color-work)" radius={5} />
      </BarChart>
    </Chart.ChartContainer>
  )
}
function ComboboxDemo() {
  const items = ["Notion", "Figma", "Linear", "Ankvale"]
  return (
    <div className="w-full max-w-xs">
      <Combobox.Combobox items={items}>
        <Combobox.ComboboxInput
          aria-label="Choose a workspace"
          placeholder="Find a workspace…"
        />
        <Combobox.ComboboxContent>
          <Combobox.ComboboxEmpty>No workspace found.</Combobox.ComboboxEmpty>
          <Combobox.ComboboxList>
            {(item: string) => (
              <Combobox.ComboboxItem key={item} value={item}>
                {item}
              </Combobox.ComboboxItem>
            )}
          </Combobox.ComboboxList>
        </Combobox.ComboboxContent>
      </Combobox.Combobox>
    </div>
  )
}
function CommandDemo() {
  const [action, setAction] = React.useState("Choose an action.")
  return (
    <div className="w-full max-w-sm space-y-3">
      <Command.Command className="rounded-xl border">
        <Command.CommandInput placeholder="Type a command…" />
        <Command.CommandList>
          <Command.CommandEmpty>No results.</Command.CommandEmpty>
          <Command.CommandGroup heading="Workspace">
            <Command.CommandItem
              onSelect={() => setAction("New project selected.")}
            >
              <PlusIcon />
              New project
            </Command.CommandItem>
            <Command.CommandItem onSelect={() => setAction("Search selected.")}>
              <MagnifyingGlassIcon />
              Search workspace
            </Command.CommandItem>
          </Command.CommandGroup>
        </Command.CommandList>
      </Command.Command>
      <p role="status" className="text-sm text-muted-foreground">
        {action}
      </p>
    </div>
  )
}
function ContextMenuDemo() {
  const [action, setAction] = React.useState("Right-click this surface.")
  return (
    <ContextMenu.ContextMenu>
      <ContextMenu.ContextMenuTrigger className="flex h-40 w-full max-w-sm items-center justify-center rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
        {action}
      </ContextMenu.ContextMenuTrigger>
      <ContextMenu.ContextMenuContent>
        <ContextMenu.ContextMenuItem
          onClick={() => setAction("Project duplicated.")}
        >
          Duplicate
        </ContextMenu.ContextMenuItem>
        <ContextMenu.ContextMenuItem
          onClick={() => setAction("Added to favorites.")}
        >
          Add to favorites
        </ContextMenu.ContextMenuItem>
      </ContextMenu.ContextMenuContent>
    </ContextMenu.ContextMenu>
  )
}
function DrawerDemo() {
  return (
    <Drawer.Drawer>
      <Drawer.DrawerTrigger render={<Button variant="outline" />}>
        Open drawer
      </Drawer.DrawerTrigger>
      <Drawer.DrawerContent>
        <div className="mx-auto w-full max-w-sm p-6">
          <Drawer.DrawerHeader>
            <Drawer.DrawerTitle>Project details</Drawer.DrawerTitle>
            <Drawer.DrawerDescription>
              Swipe or use the close button to return.
            </Drawer.DrawerDescription>
          </Drawer.DrawerHeader>
          <p className="py-8 text-sm text-muted-foreground">
            A comfortable space for a focused task.
          </p>
          <Drawer.DrawerFooter>
            <Drawer.DrawerClose render={<Button />}>Done</Drawer.DrawerClose>
          </Drawer.DrawerFooter>
        </div>
      </Drawer.DrawerContent>
    </Drawer.Drawer>
  )
}
function InputOtpDemo() {
  const [code, setCode] = React.useState("")
  return (
    <div className="space-y-4">
      <Label htmlFor="demo-otp">Verification code</Label>
      <InputOtp.InputOTP
        id="demo-otp"
        maxLength={6}
        value={code}
        onChange={setCode}
      >
        <InputOtp.InputOTPGroup>
          {[0, 1, 2].map((index) => (
            <InputOtp.InputOTPSlot key={index} index={index} />
          ))}
        </InputOtp.InputOTPGroup>
        <InputOtp.InputOTPSeparator />
        <InputOtp.InputOTPGroup>
          {[3, 4, 5].map((index) => (
            <InputOtp.InputOTPSlot key={index} index={index} />
          ))}
        </InputOtp.InputOTPGroup>
      </InputOtp.InputOTP>
      <p className="text-sm text-muted-foreground" role="status">
        {code.length === 6
          ? "Code entered. This is a preview; no code is sent."
          : "Enter any six characters to try it."}
      </p>
    </div>
  )
}
function MenubarDemo() {
  const [action, setAction] = React.useState("")
  return (
    <div className="w-full max-w-sm">
      <Menubar.Menubar>
        <Menubar.MenubarMenu>
          <Menubar.MenubarTrigger>File</Menubar.MenubarTrigger>
          <Menubar.MenubarContent>
            <Menubar.MenubarItem onClick={() => setAction("New file created.")}>
              New file
            </Menubar.MenubarItem>
            <Menubar.MenubarItem onClick={() => setAction("File saved.")}>
              Save
            </Menubar.MenubarItem>
          </Menubar.MenubarContent>
        </Menubar.MenubarMenu>
        <Menubar.MenubarMenu>
          <Menubar.MenubarTrigger>Edit</Menubar.MenubarTrigger>
          <Menubar.MenubarContent>
            <Menubar.MenubarItem onClick={() => setAction("Undo selected.")}>
              Undo
            </Menubar.MenubarItem>
            <Menubar.MenubarItem onClick={() => setAction("Redo selected.")}>
              Redo
            </Menubar.MenubarItem>
          </Menubar.MenubarContent>
        </Menubar.MenubarMenu>
        <Menubar.MenubarMenu>
          <Menubar.MenubarTrigger>View</Menubar.MenubarTrigger>
          <Menubar.MenubarContent>
            <Menubar.MenubarItem
              onClick={() => setAction("Zoom reset to 100%.")}
            >
              Reset zoom
            </Menubar.MenubarItem>
            <Menubar.MenubarItem
              onClick={() => setAction("Full screen selected.")}
            >
              Full screen
            </Menubar.MenubarItem>
          </Menubar.MenubarContent>
        </Menubar.MenubarMenu>
      </Menubar.Menubar>
      <p className="mt-3 min-h-5 text-xs text-muted-foreground" role="status">
        {action}
      </p>
    </div>
  )
}
function MessageDemo() {
  return (
    <Message.Message className="w-full max-w-sm">
      <Message.MessageAvatar>
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm text-accent-foreground">
          AL
        </span>
      </Message.MessageAvatar>
      <Message.MessageContent>
        <Message.MessageHeader>
          <span className="font-medium">Alex Lee</span>
          <span className="text-muted-foreground">Just now</span>
        </Message.MessageHeader>
        <p className="text-sm leading-6">
          Review the project brief and add your comments.
        </p>
        <Message.MessageFooter>Design team</Message.MessageFooter>
      </Message.MessageContent>
    </Message.Message>
  )
}
function MessageScrollerDemo() {
  const [count, setCount] = React.useState(8)
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="h-64 overflow-hidden rounded-xl border">
        <MessageScroller.MessageScrollerProvider>
          <MessageScroller.MessageScroller>
            <MessageScroller.MessageScrollerViewport>
              <MessageScroller.MessageScrollerContent className="p-4">
                {Array.from({ length: count }, (_, index) => (
                  <MessageScroller.MessageScrollerItem key={index}>
                    <div className="rounded-lg border bg-card px-3 py-2 text-sm">
                      Message {index + 1}: Project update.
                    </div>
                  </MessageScroller.MessageScrollerItem>
                ))}
              </MessageScroller.MessageScrollerContent>
            </MessageScroller.MessageScrollerViewport>
            <MessageScroller.MessageScrollerButton />
          </MessageScroller.MessageScroller>
        </MessageScroller.MessageScrollerProvider>
      </div>
      <Button variant="outline" onClick={() => setCount(count + 1)}>
        Add message
      </Button>
    </div>
  )
}
function PaginationDemo() {
  const [page, setPage] = React.useState(1)
  return (
    <div className="space-y-4">
      <Pagination.Pagination>
        <Pagination.PaginationContent>
          <Pagination.PaginationItem>
            <Pagination.PaginationPrevious
              href="#"
              aria-disabled={page === 1}
              onClick={(event) => {
                event.preventDefault()
                setPage(Math.max(1, page - 1))
              }}
            />
          </Pagination.PaginationItem>
          {[1, 2, 3].map((n) => (
            <Pagination.PaginationItem key={n}>
              <Pagination.PaginationLink
                href="#"
                isActive={page === n}
                onClick={(event) => {
                  event.preventDefault()
                  setPage(n)
                }}
              >
                {n}
              </Pagination.PaginationLink>
            </Pagination.PaginationItem>
          ))}
          <Pagination.PaginationItem>
            <Pagination.PaginationNext
              href="#"
              aria-disabled={page === 3}
              onClick={(event) => {
                event.preventDefault()
                setPage(Math.min(3, page + 1))
              }}
            />
          </Pagination.PaginationItem>
        </Pagination.PaginationContent>
      </Pagination.Pagination>
      <p role="status" className="text-center text-sm text-muted-foreground">
        Page {page} of 3
      </p>
    </div>
  )
}
function QuestionnaireDemo() {
  const [done, setDone] = React.useState(false)
  return (
    <div className="w-full max-w-sm">
      {done ? (
        <div className="space-y-4">
          <p role="status">
            Thanks. Your preferences are saved for this preview.
          </p>
          <Button variant="outline" onClick={() => setDone(false)}>
            Start again
          </Button>
        </div>
      ) : (
        <Questionnaire.Questionnaire
          onSubmit={(event) => {
            event.preventDefault()
            setDone(true)
          }}
        >
          <Questionnaire.QuestionnaireItem name="purpose" required>
            <Questionnaire.QuestionnaireTitle>
              What are you working on?
            </Questionnaire.QuestionnaireTitle>
            <Questionnaire.QuestionnaireDescription>
              Choose a starting point.
            </Questionnaire.QuestionnaireDescription>
            <Questionnaire.QuestionnaireChoices>
              <Questionnaire.QuestionnaireChoice value="personal">
                A personal project
              </Questionnaire.QuestionnaireChoice>
              <Questionnaire.QuestionnaireChoice value="team">
                A team workspace
              </Questionnaire.QuestionnaireChoice>
            </Questionnaire.QuestionnaireChoices>
          </Questionnaire.QuestionnaireItem>
          <Questionnaire.QuestionnaireActions>
            <Questionnaire.QuestionnaireSubmit>
              Save preference
            </Questionnaire.QuestionnaireSubmit>
          </Questionnaire.QuestionnaireActions>
        </Questionnaire.Questionnaire>
      )}
    </div>
  )
}
function SelectDemo() {
  return (
    <Select.Select defaultValue="personal">
      <Select.SelectTrigger className="w-64" aria-label="Workspace">
        <Select.SelectValue />
      </Select.SelectTrigger>
      <Select.SelectContent>
        <Select.SelectItem value="personal">
          Personal workspace
        </Select.SelectItem>
        <Select.SelectItem value="team">Team workspace</Select.SelectItem>
        <Select.SelectItem value="archive">Archive</Select.SelectItem>
      </Select.SelectContent>
    </Select.Select>
  )
}
function SheetDemo() {
  return (
    <Sheet.Sheet>
      <Sheet.SheetTrigger render={<Button variant="outline" />}>
        Open settings
      </Sheet.SheetTrigger>
      <Sheet.SheetContent>
        <Sheet.SheetHeader>
          <Sheet.SheetTitle>Workspace settings</Sheet.SheetTitle>
          <Sheet.SheetDescription>
            Select an item to view its details.
          </Sheet.SheetDescription>
        </Sheet.SheetHeader>
        <div className="grid gap-3 p-6">
          <Label htmlFor="sheet-name">Workspace name</Label>
          <Input id="sheet-name" defaultValue="My workspace" />
          <Sheet.SheetClose render={<Button />}>Done</Sheet.SheetClose>
        </div>
      </Sheet.SheetContent>
    </Sheet.Sheet>
  )
}
function SidebarDemo() {
  const [active, setActive] = React.useState("Overview")
  const pages = [
    { name: "Overview", icon: SquaresFourIcon },
    { name: "Documents", icon: FileTextIcon },
    { name: "Settings", icon: GearIcon },
  ]
  return (
    <Sidebar.SidebarProvider
      className="h-80 min-h-0 w-full max-w-3xl overflow-hidden rounded-lg border"
      style={
        { "--sidebar-width": "clamp(8rem, 30%, 12rem)" } as React.CSSProperties
      }
    >
      <Sidebar.Sidebar collapsible="none" className="h-full shrink-0 border-e">
        <Sidebar.SidebarHeader className="border-b p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 shrink-0 items-center justify-center rounded border">
              <SquaresFourIcon size={16} />
            </span>
            <span className="truncate">Workspace</span>
            <CaretDownIcon className="ms-auto size-3 shrink-0 text-muted-foreground" />
          </div>
        </Sidebar.SidebarHeader>
        <Sidebar.SidebarContent>
          <Sidebar.SidebarGroup>
            <Sidebar.SidebarGroupLabel>Workspace</Sidebar.SidebarGroupLabel>
            <Sidebar.SidebarMenu>
              {pages.map(({ name, icon: Icon }) => (
                <Sidebar.SidebarMenuItem key={name}>
                  <Sidebar.SidebarMenuButton
                    isActive={active === name}
                    aria-current={active === name ? "page" : undefined}
                    onClick={() => setActive(name)}
                  >
                    <Icon />
                    <span>{name}</span>
                  </Sidebar.SidebarMenuButton>
                </Sidebar.SidebarMenuItem>
              ))}
            </Sidebar.SidebarMenu>
          </Sidebar.SidebarGroup>
        </Sidebar.SidebarContent>
        <Sidebar.SidebarFooter className="border-t p-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex size-6 items-center justify-center rounded-full bg-secondary">
              AL
            </span>
            Alex Lee
          </div>
        </Sidebar.SidebarFooter>
      </Sidebar.Sidebar>
      <div className="min-w-0 flex-1">
        <div className="flex h-[53px] items-center border-b px-5 text-xs text-muted-foreground">
          Workspace / {active}
        </div>
        <div className="p-5" role="status">
          <h3 className="mb-5 text-lg font-semibold">{active}</h3>
          {active === "Settings" ? (
            <div className="grid gap-2">
              <Label htmlFor="sidebar-workspace-name">Workspace name</Label>
              <Input id="sidebar-workspace-name" defaultValue="Design team" />
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {(active === "Documents"
                ? ["Project brief", "Meeting notes", "Design guidelines"]
                : ["Website redesign", "Product launch", "Team planning"]
              ).map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-3 text-xs"
                >
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar.SidebarProvider>
  )
}

function ToastDemo() {
  return (
    <Toast.Toaster>
      <Button
        variant="outline"
        onClick={() =>
          Toast.toast.add({
            title: "Changes saved",
            description: "Everything is right where you left it.",
            type: "success",
          })
        }
      >
        Show toast
      </Button>
    </Toast.Toaster>
  )
}
function ToggleGroupDemo() {
  const [value, setValue] = React.useState(["comfortable"])
  return (
    <ToggleGroup.ToggleGroup
      value={value}
      onValueChange={setValue}
      variant="outline"
      aria-label="Display density"
    >
      <ToggleGroup.ToggleGroupItem value="compact">
        Compact
      </ToggleGroup.ToggleGroupItem>
      <ToggleGroup.ToggleGroupItem value="comfortable">
        Comfortable
      </ToggleGroup.ToggleGroupItem>
      <ToggleGroup.ToggleGroupItem value="spacious">
        Spacious
      </ToggleGroup.ToggleGroupItem>
    </ToggleGroup.ToggleGroup>
  )
}
const previews = {
  "alert-dialog": AlertDialogDemo,
  alert: () => (
    <Alert.Alert className="max-w-md">
      <CheckIcon />
      <Alert.AlertTitle>You're all set.</Alert.AlertTitle>
      <Alert.AlertDescription>
        Your changes have been saved to this workspace.
      </Alert.AlertDescription>
    </Alert.Alert>
  ),
  "aspect-ratio": () => (
    <div className="w-full max-w-md">
      <AspectRatio.AspectRatio
        ratio={16 / 9}
        className="flex items-center justify-center rounded-xl bg-muted"
      >
        <span className="text-sm text-muted-foreground">16 : 9</span>
      </AspectRatio.AspectRatio>
    </div>
  ),
  attachment: () => (
    <Attachment.Attachment className="w-full max-w-sm">
      <Attachment.AttachmentMedia>
        <FileTextIcon />
      </Attachment.AttachmentMedia>
      <Attachment.AttachmentContent>
        <Attachment.AttachmentTitle>
          Brand guidelines.pdf
        </Attachment.AttachmentTitle>
        <Attachment.AttachmentDescription>
          PDF document · 2.4 MB
        </Attachment.AttachmentDescription>
      </Attachment.AttachmentContent>
    </Attachment.Attachment>
  ),
  breadcrumb: () => (
    <Breadcrumb.Breadcrumb>
      <Breadcrumb.BreadcrumbList>
        <Breadcrumb.BreadcrumbItem>
          <Breadcrumb.BreadcrumbLink href="#main-content">
            Workspace
          </Breadcrumb.BreadcrumbLink>
        </Breadcrumb.BreadcrumbItem>
        <Breadcrumb.BreadcrumbSeparator />
        <Breadcrumb.BreadcrumbItem>
          <Breadcrumb.BreadcrumbPage>Design system</Breadcrumb.BreadcrumbPage>
        </Breadcrumb.BreadcrumbItem>
      </Breadcrumb.BreadcrumbList>
    </Breadcrumb.Breadcrumb>
  ),
  bubble: () => (
    <Bubble.BubbleGroup className="w-full max-w-sm">
      <Bubble.Bubble>
        <Bubble.BubbleContent>Project notes</Bubble.BubbleContent>
      </Bubble.Bubble>
      <Bubble.Bubble>
        <Bubble.BubbleContent>Add a comment.</Bubble.BubbleContent>
      </Bubble.Bubble>
    </Bubble.BubbleGroup>
  ),
  "button-group": () => (
    <ButtonGroup.ButtonGroup aria-label="Document actions">
      <Button variant="outline">Edit</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="outline">Share</Button>
    </ButtonGroup.ButtonGroup>
  ),
  calendar: CalendarDemo,
  carousel: CarouselDemo,
  chart: ChartDemo,
  "code-block": () => (
    <CodeBlock.CodeBlock className="w-full max-w-md">
      <CodeBlock.CodeBlockHeader>
        <CodeBlock.CodeBlockTitle>hello.tsx</CodeBlock.CodeBlockTitle>
        <CodeBlock.CodeBlockActions>
          <CodeBlock.CodeBlockCopyButton
            value={"<Button>A fresh start</Button>"}
          />
        </CodeBlock.CodeBlockActions>
      </CodeBlock.CodeBlockHeader>
      <CodeBlock.CodeBlockContent lineNumbers>
        {
          'import { Button } from "@/components/ui/button"\n\n<Button>A fresh start</Button>'
        }
      </CodeBlock.CodeBlockContent>
    </CodeBlock.CodeBlock>
  ),
  collapsible: () => (
    <Collapsible.Collapsible className="w-full max-w-sm space-y-4">
      <Collapsible.CollapsibleTrigger render={<Button variant="outline" />}>
        Show project details
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent>
        <div className="rounded-lg border p-4 text-sm">
          A calm workspace for your next good idea.
        </div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Collapsible>
  ),
  combobox: ComboboxDemo,
  command: CommandDemo,
  "context-menu": ContextMenuDemo,
  direction: () => (
    <Direction.DirectionProvider direction="rtl">
      <div dir="rtl" className="w-full max-w-sm space-y-4">
        <p className="text-sm">واجهة واضحة وبسيطة</p>
        <Input aria-label="اسم المشروع" placeholder="اسم المشروع" />
        <Button>إنشاء مشروع</Button>
      </div>
    </Direction.DirectionProvider>
  ),
  drawer: DrawerDemo,
  empty: () => (
    <Empty.Empty className="max-w-md">
      <Empty.EmptyHeader>
        <Empty.EmptyMedia variant="icon">
          <FileTextIcon />
        </Empty.EmptyMedia>
        <Empty.EmptyTitle>No documents yet</Empty.EmptyTitle>
        <Empty.EmptyDescription>
          Your next idea belongs here. Create a document to get started.
        </Empty.EmptyDescription>
      </Empty.EmptyHeader>
    </Empty.Empty>
  ),
  field: () => (
    <Field.Field className="max-w-sm">
      <Field.FieldLabel htmlFor="field-title">Project title</Field.FieldLabel>
      <Input id="field-title" placeholder="A fresh start" />
      <Field.FieldDescription>
        A short, memorable name for your next idea.
      </Field.FieldDescription>
    </Field.Field>
  ),
  "hover-card": () => (
    <HoverCard.HoverCard>
      <HoverCard.HoverCardTrigger render={<Button variant="link" />}>
        Meet the team
      </HoverCard.HoverCardTrigger>
      <HoverCard.HoverCardContent>
        <h3 className="font-medium">The Ankvale team</h3>
        <p className="mt-2 text-sm text-muted-foreground">Product designer</p>
      </HoverCard.HoverCardContent>
    </HoverCard.HoverCard>
  ),
  "input-group": () => (
    <InputGroup.InputGroup className="max-w-sm">
      <InputGroup.InputGroupAddon>
        <MagnifyingGlassIcon />
      </InputGroup.InputGroupAddon>
      <InputGroup.InputGroupInput
        aria-label="Search documents"
        placeholder="Search documents…"
      />
      <InputGroup.InputGroupAddon align="inline-end">
        <Kbd.Kbd>⌘ K</Kbd.Kbd>
      </InputGroup.InputGroupAddon>
    </InputGroup.InputGroup>
  ),
  "input-otp": InputOtpDemo,
  item: () => (
    <Item.Item variant="outline" className="max-w-sm">
      <Item.ItemMedia variant="icon">
        <FileTextIcon />
      </Item.ItemMedia>
      <Item.ItemContent>
        <Item.ItemTitle>Design principles</Item.ItemTitle>
        <Item.ItemDescription>
          Updated just now · Team workspace
        </Item.ItemDescription>
      </Item.ItemContent>
    </Item.Item>
  ),
  kbd: () => (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      Quick search{" "}
      <Kbd.KbdGroup>
        <Kbd.Kbd>⌘</Kbd.Kbd>
        <Kbd.Kbd>K</Kbd.Kbd>
      </Kbd.KbdGroup>
    </div>
  ),
  label: () => (
    <div className="grid w-full max-w-xs gap-2">
      <Label htmlFor="label-example">Your name</Label>
      <Input id="label-example" placeholder="Alex Lee" />
    </div>
  ),
  marker: () => (
    <Marker.Marker variant="separator" className="max-w-sm">
      <Marker.MarkerContent>Today</Marker.MarkerContent>
    </Marker.Marker>
  ),
  menubar: MenubarDemo,
  "message-scroller": MessageScrollerDemo,
  message: MessageDemo,
  "native-select": () => (
    <NativeSelect.NativeSelect
      aria-label="Default workspace"
      className="w-64"
      defaultValue="personal"
    >
      <NativeSelect.NativeSelectOption value="personal">
        Personal workspace
      </NativeSelect.NativeSelectOption>
      <NativeSelect.NativeSelectOption value="team">
        Team workspace
      </NativeSelect.NativeSelectOption>
    </NativeSelect.NativeSelect>
  ),
  "navigation-menu": () => (
    <NavigationMenu.NavigationMenu>
      <NavigationMenu.NavigationMenuList>
        <NavigationMenu.NavigationMenuItem>
          <NavigationMenu.NavigationMenuTrigger>
            Explore
          </NavigationMenu.NavigationMenuTrigger>
          <NavigationMenu.NavigationMenuContent className="w-64 p-4">
            <NavigationMenu.NavigationMenuLink href="#main-content">
              Back to the playground
            </NavigationMenu.NavigationMenuLink>
            <p className="mt-2 text-sm text-muted-foreground">
              Component library
            </p>
          </NavigationMenu.NavigationMenuContent>
        </NavigationMenu.NavigationMenuItem>
      </NavigationMenu.NavigationMenuList>
    </NavigationMenu.NavigationMenu>
  ),
  pagination: PaginationDemo,
  popover: () => (
    <Popover.Popover>
      <Popover.PopoverTrigger render={<Button variant="outline" />}>
        Project details
      </Popover.PopoverTrigger>
      <Popover.PopoverContent>
        <Popover.PopoverHeader>
          <Popover.PopoverTitle>A fresh start</Popover.PopoverTitle>
          <Popover.PopoverDescription>
            Create your first project.
          </Popover.PopoverDescription>
        </Popover.PopoverHeader>
        <Label htmlFor="popover-title">Project title</Label>
        <Input id="popover-title" defaultValue="A fresh start" />
      </Popover.PopoverContent>
    </Popover.Popover>
  ),
  questionnaire: QuestionnaireDemo,
  "radio-group": () => (
    <RadioGroup.RadioGroup
      defaultValue="comfortable"
      aria-label="Layout density"
      className="gap-4"
    >
      {["Compact", "Comfortable", "Spacious"].map((name) => (
        <div key={name} className="flex items-center gap-3">
          <RadioGroup.RadioGroupItem
            value={name.toLowerCase()}
            id={`density-${name}`}
          />
          <Label htmlFor={`density-${name}`}>{name}</Label>
        </div>
      ))}
    </RadioGroup.RadioGroup>
  ),
  resizable: () => (
    <Resizable.ResizablePanelGroup
      orientation="horizontal"
      className="h-56 max-w-lg rounded-xl border"
    >
      <Resizable.ResizablePanel defaultSize="40%" minSize="20%">
        <div className="flex h-full items-center justify-center bg-muted text-sm">
          Sidebar
        </div>
      </Resizable.ResizablePanel>
      <Resizable.ResizableHandle withHandle />
      <Resizable.ResizablePanel defaultSize="60%" minSize="20%">
        <div className="flex h-full items-center justify-center text-sm">
          Drag to make space
        </div>
      </Resizable.ResizablePanel>
    </Resizable.ResizablePanelGroup>
  ),
  "scroll-area": () => (
    <ScrollArea.ScrollArea className="h-60 w-full max-w-sm rounded-xl border">
      <div className="space-y-4 p-5">
        <h3 className="font-medium">Reading list</h3>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="border-b pb-3 text-sm text-muted-foreground">
            Note {i + 1} · Ideas worth keeping
          </p>
        ))}
      </div>
    </ScrollArea.ScrollArea>
  ),
  select: SelectDemo,
  sheet: SheetDemo,
  sidebar: SidebarDemo,
  spinner: () => (
    <div
      className="flex items-center gap-3 text-sm text-muted-foreground"
      role="status"
    >
      <Spinner.Spinner />
      Loading…
    </div>
  ),
  table: () => (
    <Table.Table className="min-w-80">
      <Table.TableCaption>Your workspace projects</Table.TableCaption>
      <Table.TableHeader>
        <Table.TableRow>
          <Table.TableHead>Project</Table.TableHead>
          <Table.TableHead>Status</Table.TableHead>
          <Table.TableHead className="text-end">Tasks</Table.TableHead>
        </Table.TableRow>
      </Table.TableHeader>
      <Table.TableBody>
        {[
          ["Design system", "In progress", "24"],
          ["Website", "In review", "12"],
          ["Brand guidelines", "Complete", "8"],
        ].map(([name, status, tasks]) => (
          <Table.TableRow key={name}>
            <Table.TableCell className="font-medium">{name}</Table.TableCell>
            <Table.TableCell>{status}</Table.TableCell>
            <Table.TableCell className="text-end">{tasks}</Table.TableCell>
          </Table.TableRow>
        ))}
      </Table.TableBody>
    </Table.Table>
  ),
  toast: ToastDemo,
  "toggle-group": ToggleGroupDemo,
  trace: () => (
    <Trace.Trace className="w-full max-w-sm">
      <Trace.TraceLine>
        <Trace.TraceIcon>
          <CheckIcon />
        </Trace.TraceIcon>
        <Trace.TraceTitle>Read the brief</Trace.TraceTitle>
        <Trace.TraceDescription>Complete</Trace.TraceDescription>
      </Trace.TraceLine>
      <Trace.TraceCollapsible>
        <Trace.TraceCollapsibleTrigger>
          <Trace.TraceTitle>Explore the details</Trace.TraceTitle>
        </Trace.TraceCollapsibleTrigger>
        <Trace.TraceCollapsibleContent>
          <p className="py-3 text-sm text-muted-foreground">
            Neutral surfaces, generous spacing, and controls with a little
            depth.
          </p>
        </Trace.TraceCollapsibleContent>
      </Trace.TraceCollapsible>
    </Trace.Trace>
  ),
} satisfies Record<AdditionalPreviewName, React.ComponentType>

export function ComponentPreview({ name }: { name: AdditionalPreviewName }) {
  const Preview = previews[name]
  return <Preview />
}
