import assert from "node:assert/strict"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react"
import {
  AppBlockPreview,
  appBlockPreviewNames,
} from "../apps/web/components/app-block-previews"
import {
  AuthPanel,
  OrganizationOnboarding,
} from "../packages/ui/src/blocks/app-auth"
import { AsyncAction } from "../packages/ui/src/blocks/app-shared"
import {
  parseCsv,
  ImportExportWizard,
} from "../packages/ui/src/blocks/app-files"
import { GlobalSearch } from "../packages/ui/src/blocks/app-data"
import { DangerZone } from "../packages/ui/src/blocks/app-safety"
import {
  CheckoutFlow,
  formatMoney,
} from "../packages/ui/src/blocks/app-commerce"
export async function run() {
  for (const name of appBlockPreviewNames) {
    const html = renderToString(<AppBlockPreview name={name} />)
    assert(html.length > 100, name)
    assert(!html.includes("Unknown app block"), name)
    assert(!/undefined/.test(html), name)
  }
  console.log(
    `✓ ${appBlockPreviewNames.length} application blocks server-render with useful examples`
  )
  render(<AuthPanel onSubmit={async () => {}} />)
  assert.equal(
    screen.getByLabelText("Password").getAttribute("minlength"),
    null
  )
  cleanup()
  render(
    <AuthPanel
      mode="sign-up"
      minimumPasswordLength={12}
      onSubmit={async () => {}}
    />
  )
  assert.equal(
    screen.getByLabelText("Password").getAttribute("minlength"),
    "12"
  )
  cleanup()
  assert.equal(formatMoney(100, "JPY"), "¥100")
  assert.equal(formatMoney(100, "USD"), "$1.00")
  let authCalls = 0
  render(
    <AuthPanel
      onSubmit={async () => {
        authCalls++
        throw new Error("unavailable")
      }}
    />
  )
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "alex@example.com" },
  })
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "long-password" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
  assert(await screen.findByRole("alert"))
  assert.equal(authCalls, 1)
  assert.equal(
    (screen.getByLabelText("Email") as HTMLInputElement).value,
    "alex@example.com"
  )
  cleanup()
  render(<AppBlockPreview name="app-onboarding" />)
  fireEvent.change(screen.getByLabelText("Workspace name"), {
    target: { value: "Studio" },
  })
  fireEvent.change(screen.getByLabelText("Company"), {
    target: { value: "Ankvale" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Continue" }))
  assert(await screen.findByLabelText("Invite teammates"))
  fireEvent.click(screen.getByRole("button", { name: "Back" }))
  assert.equal(
    (screen.getByLabelText("Workspace name") as HTMLInputElement).value,
    "Studio"
  )
  cleanup()
  console.log(
    "✓ auth rejection retains values and onboarding preserves its draft"
  )
  render(<AppBlockPreview name="app-members" />)
  fireEvent.change(screen.getByLabelText("Role for Jamie Chen"), {
    target: { value: "viewer" },
  })
  await waitFor(() =>
    assert.equal(
      (screen.getByLabelText("Role for Jamie Chen") as HTMLSelectElement).value,
      "viewer"
    )
  )
  cleanup()
  render(<AppBlockPreview name="app-permissions" />)
  const permission = screen.getByLabelText(
    "Invite members for Member"
  ) as HTMLInputElement
  assert.equal(permission.checked, false)
  fireEvent.click(permission)
  assert.equal(permission.checked, true)
  cleanup()
  render(<AppBlockPreview name="app-notifications" />)
  fireEvent.click(screen.getByRole("checkbox", { name: "Unread only" }))
  assert.equal(screen.queryByText("Invitation accepted"), null)
  fireEvent.click(screen.getByRole("button", { name: "Mark read" }))
  await waitFor(() =>
    assert.equal(screen.queryByText("Review requested"), null)
  )
  cleanup()
  console.log(
    "✓ role changes, permission matrix and unread notification workflow"
  )
  render(<AppBlockPreview name="app-crud" />)
  fireEvent.click(screen.getByRole("button", { name: "Create record" }))
  const dialog = await screen.findByRole("dialog")
  fireEvent.change(within(dialog).getByLabelText("Project name"), {
    target: { value: "New project" },
  })
  fireEvent.change(within(dialog).getByLabelText("Status"), {
    target: { value: "Planned" },
  })
  fireEvent.click(within(dialog).getByRole("button", { name: "Save record" }))
  assert(await screen.findByText("New project"))
  await waitFor(() => assert.equal(screen.queryByRole("dialog"), null))
  fireEvent.change(screen.getByLabelText("Collection view"), {
    target: { value: "cards" },
  })
  assert(screen.getByText("New project"))
  cleanup()
  render(<AppBlockPreview name="app-collection-toolbar" />)
  fireEvent.click(screen.getByRole("button", { name: "Add filter" }))
  assert(screen.getByLabelText("Filter 1 field"))
  fireEvent.change(screen.getByLabelText("Filter 1 value"), {
    target: { value: "Alex" },
  })
  assert(screen.getByText(/"value": "Alex"/))
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }))
  assert.equal(screen.queryByLabelText("Filter 1 field"), null)
  cleanup()
  console.log(
    "✓ CRUD create/dialog/view modes and controlled filter rules/reset"
  )
  const aborts: AbortSignal[] = []
  const search = async (query: string, signal: AbortSignal) => {
    aborts.push(signal)
    return [{ id: query, title: query, group: "Results" }]
  }
  render(<GlobalSearch search={search} onSelect={() => {}} />)
  fireEvent.change(screen.getByRole("textbox", { name: "Global search" }), {
    target: { value: "first" },
  })
  assert(await screen.findByRole("button", { name: "first" }))
  fireEvent.change(screen.getByRole("textbox", { name: "Global search" }), {
    target: { value: "second" },
  })
  assert(await screen.findByRole("button", { name: "second" }))
  assert.equal(aborts[0]?.aborted, true)
  cleanup()
  console.log("✓ search refresh aborts old work and renders results")
  assert.deepEqual(
    parseCsv(
      'name,email\r\n"Lee, Alex",alex@example.com\r\n"A ""quoted"" name",a@example.com'
    ),
    [
      ["name", "email"],
      ["Lee, Alex", "alex@example.com"],
      ['A "quoted" name', "a@example.com"],
    ]
  )
  assert.throws(() => parseCsv('name\n"unclosed'))
  let imported: Record<string, string>[] = []
  render(
    <ImportExportWizard
      fields={[
        { id: "name", label: "Name", required: true },
        { id: "email", label: "Email", required: true },
      ]}
      uniqueBy="email"
      onImport={async (rows) => {
        imported = rows
        return { created: rows.length }
      }}
    />
  )
  const file = new File(
    ["name,email\nAlex,alex@example.com\nAlex,alex@example.com"],
    "members.csv",
    { type: "text/csv" }
  )
  Object.defineProperty(file, "text", {
    value: async () =>
      "name,email\nAlex,alex@example.com\nAlex,alex@example.com",
  })
  fireEvent.change(screen.getByLabelText("CSV file"), {
    target: { files: [file] },
  })
  assert(await screen.findByText("1 valid · 0 invalid · 1 duplicates"))
  fireEvent.click(screen.getByRole("button", { name: "Import 1 records" }))
  assert(await screen.findByText("1 records imported."))
  assert.equal(imported.length, 1)
  cleanup()
  console.log("✓ quoted CSV parsing, duplicate preview and import callback")
  render(<AppBlockPreview name="app-booking" />)
  fireEvent.change(screen.getByLabelText("Date"), {
    target: { value: "2026-12-08" },
  })
  fireEvent.click(screen.getByRole("radio", { name: "9:00 AM" }))
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Alex" },
  })
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "alex@example.com" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }))
  assert(await screen.findByText("Dec 8 · 9:00 AM"))
  cleanup()
  render(<AppBlockPreview name="app-help" />)
  fireEvent.change(screen.getByLabelText("Search help"), {
    target: { value: "Invite" },
  })
  assert(screen.getByRole("button", { name: /Invite teammates/ }))
  assert.equal(screen.queryByRole("button", { name: /Create a project/ }), null)
  fireEvent.click(screen.getByRole("button", { name: /Invite teammates/ }))
  assert(
    screen.getByText(
      "Open Members in workspace settings and enter their email address."
    )
  )
  cleanup()
  console.log(
    "✓ booking selection/service receipt and searchable help articles"
  )
  let deleted = 0
  render(
    <DangerZone
      name="Studio"
      onDelete={() => {
        deleted++
      }}
    />
  )
  assert.equal(
    (
      screen.getByRole("button", {
        name: "Delete workspace",
      }) as HTMLButtonElement
    ).disabled,
    true
  )
  fireEvent.change(screen.getByLabelText("Type Studio to confirm"), {
    target: { value: "Studio" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Delete workspace" }))
  await waitFor(() => assert.equal(deleted, 1))
  cleanup()
  let checkoutCalls = 0
  render(
    <CheckoutFlow
      items={[{ id: "item", name: "Notebook", quantity: 1, unitPrice: 2400 }]}
      currency="USD"
      payment={<p>Test payment slot</p>}
      onPlaceOrder={async () => {
        checkoutCalls++
        if (checkoutCalls === 1) throw new Error("payment error")
        return { id: "1042", summary: "Order accepted" }
      }}
    />
  )
  for (const [label, value] of Object.entries({
    "Full name": "Alex",
    Email: "alex@example.com",
    "Street address": "1 Example Street",
    City: "Singapore",
    "Postal code": "123456",
    Country: "Singapore",
  }))
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }))
  const place = await screen.findByRole("button", { name: /Place order/ })
  fireEvent.click(place)
  assert(await screen.findByRole("alert"))
  assert(screen.getByText(/Alex, 1 Example Street/))
  fireEvent.click(screen.getByRole("button", { name: /Place order/ }))
  assert(await screen.findByText("Order accepted"))
  cleanup()
  console.log(
    "✓ danger confirmation and checkout rejection/retry with retained shipping"
  )
}
