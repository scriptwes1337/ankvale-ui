import * as React from "react"
import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
  act,
  waitFor,
} from "@testing-library/react"
import { ExpansionPreview } from "../apps/web/components/expansion-previews"
import { expansionPreviewNames } from "../apps/web/lib/expansion-preview-names"
import { PromptInput } from "@ankvale/ui/components/prompt-input"
import { ApprovalCard } from "@ankvale/ui/components/approval-card"
import { Kanban, type KanbanColumn } from "@ankvale/ui/components/kanban"
import { EmojiPicker } from "@ankvale/ui/components/emoji-picker"
import { Reasoning } from "@ankvale/ui/components/reasoning"
import { ChatSource } from "@ankvale/ui/components/chat-source"
import { DashboardTemplate } from "@ankvale/ui/templates/dashboard"
import { MailTemplate } from "@ankvale/ui/templates/mail"
import { ChatTemplate } from "@ankvale/ui/templates/chat"
import { CrmTemplate } from "@ankvale/ui/templates/crm"
import { FinancesTemplate } from "@ankvale/ui/templates/finances"
import { NumberStepper } from "@ankvale/ui/components/number-stepper"
import { DropZone, fileUploadId } from "@ankvale/ui/components/drop-zone"
import { FileTree } from "@ankvale/ui/components/file-tree"
import { ListView } from "@ankvale/ui/components/list-view"
import { Rating } from "@ankvale/ui/components/rating"
import { Segment } from "@ankvale/ui/components/segment"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"

export async function run() {
  for (const name of expansionPreviewNames) {
    const html = renderToString(<ExpansionPreview name={name} />)
    assert.ok(html.length > 100, name)
    assert.ok(!html.includes("undefined"), name)
  }
  console.log(`PASS ${expansionPreviewNames.length} expansion previews render`)
  render(
    <NumberStepper label="Guests" min={1} max={3} step={0.5} defaultValue={1} />
  )
  assert.equal(
    (screen.getByLabelText("Decrease Guests") as HTMLButtonElement).disabled,
    true
  )
  fireEvent.click(screen.getByLabelText("Increase Guests"))
  assert.equal(
    (screen.getByRole("spinbutton") as HTMLInputElement).value,
    "1.5"
  )
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "99" } })
  assert.equal((screen.getByRole("spinbutton") as HTMLInputElement).value, "3")
  assert.equal(
    (screen.getByLabelText("Increase Guests") as HTMLButtonElement).disabled,
    true
  )
  cleanup()
  console.log("PASS numeric step intervals and bounds")
  render(
    <Segment
      label="Period"
      options={[
        { value: "month", label: "Month" },
        { value: "year", label: "Year" },
      ]}
    />
  )
  fireEvent.click(screen.getByLabelText("Year"))
  assert.equal(
    (screen.getByLabelText("Year") as HTMLInputElement).checked,
    true
  )
  assert.equal(
    (screen.getByLabelText("Month") as HTMLInputElement).checked,
    false
  )
  cleanup()
  render(<Rating defaultValue={2} />)
  fireEvent.click(screen.getByLabelText("4 stars"))
  assert.equal(
    (screen.getByLabelText("4 stars") as HTMLInputElement).checked,
    true
  )
  cleanup()
  console.log("PASS segmented and rating selection")
  render(
    <FileTree
      nodes={[
        {
          id: "src",
          name: "src",
          children: [{ id: "page", name: "page.tsx" }],
        },
      ]}
    />
  )
  assert.equal(screen.queryByText("page.tsx"), null)
  fireEvent.click(screen.getByText("src"))
  const file = screen.getByText("page.tsx").closest('[role="treeitem"]')!
  fireEvent.click(file)
  assert.equal(file.getAttribute("aria-selected"), "true")
  const folder = screen
    .getByText("src")
    .closest('[role="treeitem"]') as HTMLElement
  act(() => folder.focus())
  fireEvent.keyDown(folder, { key: "ArrowRight" })
  assert.equal(document.activeElement, file)
  cleanup()
  console.log("PASS file expansion, selection, and keyboard navigation")
  render(
    <ListView
      label="Files"
      selectionMode="multiple"
      items={[
        { id: "a", title: "Brief" },
        { id: "b", title: "Notes" },
      ]}
    />
  )
  fireEvent.click(screen.getByText("Brief"))
  fireEvent.click(screen.getByText("Notes"))
  assert.equal(
    screen
      .getAllByRole("checkbox")
      .filter((e) => (e as HTMLInputElement).checked).length,
    2
  )
  fireEvent.click(screen.getByText("Brief"))
  assert.equal(
    screen
      .getAllByRole("checkbox")
      .filter((e) => (e as HTMLInputElement).checked).length,
    1
  )
  cleanup()
  console.log("PASS list multiple selection")
  let rejected = 0
  render(
    <DropZone
      accept=".txt"
      maxSize={10}
      onReject={(items) => {
        rejected = items.length
      }}
    />
  )
  const input = screen.getByLabelText("Upload files")
  fireEvent.change(input, {
    target: {
      files: [
        new File(["ok"], "notes.txt", { type: "text/plain" }),
        new File(["bad"], "photo.png", { type: "image/png" }),
        new File(["x".repeat(20)], "large.txt", { type: "text/plain" }),
      ],
    },
  })
  assert.equal(rejected, 2)
  assert.ok(screen.getByText("notes.txt"))
  assert.ok(screen.getByRole("alert"))
  fireEvent.click(screen.getByLabelText("Remove notes.txt"))
  assert.equal(screen.queryByRole("list", { name: "Selected files" }), null)
  cleanup()
  console.log("PASS upload type and size validation; file removal")
  const upload = new File(["hello"], "upload.txt", { type: "text/plain" })
  let retried = false,
    canceled = false
  const uploadView = render(
    <DropZone
      defaultValue={[upload]}
      uploads={{
        [fileUploadId(upload)]: { status: "uploading", progress: 42 },
      }}
      onCancelUpload={() => (canceled = true)}
    />
  )
  assert.equal(screen.getByRole("progressbar").getAttribute("value"), "42")
  fireEvent.click(screen.getByRole("button", { name: "Cancel upload" }))
  assert(canceled)
  uploadView.rerender(
    <DropZone
      defaultValue={[upload]}
      uploads={{
        [fileUploadId(upload)]: { status: "error", error: "Connection lost" },
      }}
      onRetryUpload={() => (retried = true)}
    />
  )
  fireEvent.click(screen.getByRole("button", { name: "Retry" }))
  assert(retried)
  assert(screen.getByRole("alert").textContent?.includes("Connection lost"))
  cleanup()
  console.log("PASS upload progress, cancel and retry callbacks")

  type Person = { id: string; name: string; team: string }
  const initial: Person[] = [
    { id: "1", name: "Zoe", team: "Design" },
    { id: "2", name: "Alex", team: "Engineering" },
    { id: "3", name: "Mia", team: "Design" },
  ]
  const columns: DataGridColumn<Person>[] = [
    { id: "name", header: "Name", accessorKey: "name", pinned: "start" },
    { id: "team", header: "Team", accessorKey: "team" },
  ]
  function Grid() {
    const [data, setData] = React.useState(initial)
    return (
      <DataGrid
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        label="People"
        selectable
        pageSize={2}
        columnFilters
        onReorder={setData}
      />
    )
  }
  render(<Grid />)
  const table = screen.getByRole("table", { name: "People" })
  assert.ok(within(table).getByText("Zoe"))
  assert.equal(within(table).queryByText("Mia"), null)
  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  assert.ok(within(table).getByText("Mia"))
  fireEvent.click(screen.getByRole("button", { name: "Previous" }))
  fireEvent.click(screen.getByRole("button", { name: "Name" }))
  assert.equal(
    within(table).getAllByRole("row")[2]?.textContent?.includes("Alex"),
    true
  )
  fireEvent.change(screen.getByLabelText("Search People"), {
    target: { value: "Zoe" },
  })
  assert.ok(within(table).getByText("Zoe"))
  assert.equal(within(table).queryByText("Alex"), null)
  fireEvent.click(screen.getByLabelText("Select all rows on this page"))
  assert.ok(screen.getByText(/1 selected/))
  fireEvent.change(screen.getByLabelText("Search People"), {
    target: { value: "" },
  })
  fireEvent.change(screen.getByLabelText("Filter Team"), {
    target: { value: "Design" },
  })
  assert.equal(within(table).queryByText("Engineering"), null)
  const resize = screen.getByLabelText("Resize Name")
  fireEvent.keyDown(resize, { key: "ArrowRight" })
  assert.equal(resize.closest("th")?.style.width, "190px")
  fireEvent.click(
    screen.getByLabelText("Team", { selector: 'input[type="checkbox"]' })
  )
  assert.equal(screen.queryByLabelText("Filter Team"), null)
  cleanup()
  console.log(
    "PASS data grid sorting, searching, filtering, selection, pagination, resizing, visibility"
  )
  let sent = 0
  let release: () => void = () => {}
  render(
    <PromptInput
      onSubmit={async () => {
        sent++
        await new Promise<void>((resolve) => {
          release = resolve
        })
      }}
    />
  )
  const composer = screen.getByRole("textbox", { name: "Message" })
  fireEvent.change(composer, { target: { value: "Review this project" } })
  fireEvent.keyDown(composer, { key: "Enter" })
  fireEvent.submit(composer.closest("form")!)
  assert.equal(sent, 1)
  assert.equal(
    (
      screen.getByRole("button", {
        name: "Sending message",
      }) as HTMLButtonElement
    ).disabled,
    true
  )
  await act(async () => release())
  assert.equal((composer as HTMLTextAreaElement).value, "")
  cleanup()
  render(
    <PromptInput
      onSubmit={async () => {
        throw new Error("Service unavailable")
      }}
    />
  )
  fireEvent.change(screen.getByRole("textbox", { name: "Message" }), {
    target: { value: "Keep my message" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Send message" }))
  await waitFor(() =>
    assert.ok(
      screen.getByRole("alert").textContent?.includes("Service unavailable")
    )
  )
  assert.equal(
    (screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement)
      .value,
    "Keep my message"
  )
  cleanup()
  let stopped = false
  render(
    <PromptInput
      streaming
      onStop={() => {
        stopped = true
      }}
      onSubmit={() => {}}
    />
  )
  fireEvent.click(screen.getByLabelText("Stop response"))
  assert.equal(stopped, true)
  cleanup()
  console.log(
    "PASS prompt submission, duplicate prevention, error preservation, and stop"
  )
  let submitted: unknown
  render(
    <ApprovalCard
      questions={[
        {
          id: "team",
          title: "Choose team",
          options: [
            { id: "design", label: "Design" },
            { id: "product", label: "Product" },
          ],
          required: true,
        },
        { id: "confirm", title: "Confirm export" },
      ]}
      onComplete={(answers) => {
        submitted = answers
      }}
    />
  )
  assert.equal(
    (screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement)
      .disabled,
    true
  )
  fireEvent.click(screen.getByLabelText("Design"))
  fireEvent.click(screen.getByRole("button", { name: "Continue" }))
  assert.ok(screen.getByRole("heading", { name: "Confirm export" }))
  fireEvent.click(screen.getByRole("button", { name: "Submit" }))
  await waitFor(() => assert.ok(screen.getByText("Answers submitted.")))
  assert.deepEqual(submitted, {
    team: { selected: ["design"] },
    confirm: { selected: [] },
  })
  cleanup()
  console.log("PASS multi-step approval and required answer validation")
  const board: KanbanColumn[] = [
    {
      id: "todo",
      title: "To do",
      cards: [
        { id: "brief", title: "Review brief" },
        { id: "design", title: "Design screen" },
      ],
    },
    { id: "done", title: "Done", cards: [] },
  ]
  function Board() {
    const [columns, setColumns] = React.useState(board)
    return <Kanban columns={columns} onColumnsChange={setColumns} />
  }
  render(<Board />)
  fireEvent.change(screen.getByLabelText("Move Review brief to column"), {
    target: { value: "done" },
  })
  assert.ok(
    within(screen.getByRole("region", { name: "Done" })).getByText(
      "Review brief"
    )
  )
  fireEvent.keyDown(screen.getByLabelText("Move Review brief"), {
    key: "ArrowLeft",
  })
  assert.ok(
    within(screen.getByRole("region", { name: "To do" })).getByText(
      "Review brief"
    )
  )
  cleanup()
  console.log("PASS Kanban column moves using select and keyboard")
  let emoji = ""
  render(
    <EmojiPicker
      onSelect={(value) => {
        emoji = value
      }}
    />
  )
  fireEvent.change(screen.getByLabelText("Search emoji"), {
    target: { value: "rocket" },
  })
  fireEvent.click(screen.getByRole("button", { name: /^rocket$/i }))
  assert.equal(emoji, "🚀")
  cleanup()
  render(<ChatSource title="Unsafe" url="javascript:alert(1)" />)
  assert.equal(
    screen.getByText("Unsafe").closest("a")?.hasAttribute("href"),
    false
  )
  cleanup()
  const reasoning = render(<Reasoning status="streaming">Working</Reasoning>)
  assert.equal(document.querySelector("details")?.open, true)
  reasoning.rerender(<Reasoning status="complete">Finished</Reasoning>)
  assert.equal(document.querySelector("details")?.open, false)
  cleanup()
  console.log("PASS emoji search, safe source URLs, and reasoning completion")
  for (const Template of [
    DashboardTemplate,
    MailTemplate,
    ChatTemplate,
    CrmTemplate,
    FinancesTemplate,
  ]) {
    assert.ok(renderToString(<Template />).length > 500)
  }
  console.log("PASS five application templates render")
  render(<DashboardTemplate />)
  fireEvent.click(screen.getByRole("button", { name: "Settings" }))
  fireEvent.change(screen.getByLabelText("Workspace name"), {
    target: { value: "Product team" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  assert.ok(screen.getByText("Settings saved in this preview."))
  cleanup()
  render(<MailTemplate />)
  fireEvent.click(screen.getByRole("button", { name: /Jamie Chen/ }))
  assert.ok(screen.getByRole("heading", { name: "Design review" }))
  fireEvent.click(screen.getByLabelText("Archive message"))
  fireEvent.click(screen.getByRole("button", { name: "Archive" }))
  assert.ok(screen.getByRole("button", { name: /Design review/ }))
  cleanup()
  render(<ChatTemplate />)
  fireEvent.click(screen.getByRole("button", { name: "Explore" }))
  fireEvent.click(
    screen.getByRole("button", { name: "Draft a release checklist" })
  )
  assert.equal(
    (screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement)
      .value,
    "Draft a release checklist"
  )
  cleanup()
  render(<CrmTemplate />)
  fireEvent.click(screen.getByRole("button", { name: "Pipeline" }))
  assert.ok(screen.getByRole("region", { name: "Qualified" }))
  fireEvent.change(screen.getByLabelText("Move Capsule Labs to column"), {
    target: { value: "Won" },
  })
  assert.ok(
    within(screen.getByRole("region", { name: "Won" })).getByText(
      "Capsule Labs"
    )
  )
  cleanup()
  render(<FinancesTemplate />)
  fireEvent.click(screen.getByRole("button", { name: "Transactions" }))
  fireEvent.click(screen.getByLabelText("Dividend"))
  const transactions = screen.getByRole("table", { name: "Transactions" })
  assert.ok(within(transactions).getByText("TX-1003"))
  assert.equal(within(transactions).queryByText("TX-1001"), null)
  cleanup()
  console.log(
    "PASS dashboard settings, mail archive, chat prompts, CRM pipeline, finance filters"
  )
  // Allow pending table model notifications to drain before disposing the DOM.
  await act(async () => {
    await Promise.resolve()
  })
}
