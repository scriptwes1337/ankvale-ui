import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { renderToString } from "react-dom/server"
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  act,
} from "@testing-library/react"
import {
  SiteBlockPreview,
  siteBlockPreviewNames,
} from "../apps/web/components/site-block-previews"
import {
  ContactSection,
  type ContactMessage,
} from "../packages/ui/src/blocks/site-contact"
import { JobApplication } from "../packages/ui/src/blocks/site-careers"
import { EventRegistration } from "../packages/ui/src/blocks/site-events"
import { ConsentPreferences } from "../packages/ui/src/blocks/site-legal"
import { Roadmap } from "../packages/ui/src/blocks/site-product"
export async function run() {
  for (const name of siteBlockPreviewNames) {
    const html = renderToString(<SiteBlockPreview name={name} />)
    assert(html.length > 100, name)
    assert(!html.includes("Unknown website block"), name)
    assert(!html.includes("undefined"), name)
    assert(!html.includes("backdrop-blur"), name)
  }
  assert.equal(siteBlockPreviewNames.length, 33)
  console.log("✓ 33 website block variants server-render, covering W01–W18")
  const previousFormData = globalThis.FormData
  globalThis.FormData = window.FormData
  try {
    let sent: ContactMessage | undefined
    render(
      <ContactSection
        title="Contact"
        departments={[{ id: "sales", label: "Sales" }]}
        onSend={async (data) => {
          sent = data
        }}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Send message" }))
    assert.equal(sent, undefined)
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Department"), {
      target: { value: "sales" },
    })
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "A project question" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Send message" }))
    assert(await screen.findByText("Your message has been sent."))
    assert.deepEqual(sent, {
      name: "Alex",
      email: "alex@example.com",
      department: "sales",
      message: "A project question",
    })
    cleanup()
    let fail!: () => void
    let calls = 0
    const pending = new Promise<void>((_, reject) => {
      fail = () => reject(new Error("offline"))
    })
    const form = render(
      <ContactSection
        departments={[{ id: "sales", label: "Sales" }]}
        onSend={() => {
          calls++
          return pending
        }}
      />
    )
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alex" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Department"), {
      target: { value: "sales" },
    })
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Keep this message" },
    })
    fireEvent.submit(form.container.querySelector("form")!)
    fireEvent.submit(form.container.querySelector("form")!)
    assert.equal(calls, 1)
    await act(async () => fail())
    assert(
      await screen.findByText(
        "Your message could not be sent. Your details are still here; try again."
      )
    )
    assert.equal(
      (screen.getByLabelText("Message") as HTMLTextAreaElement).value,
      "Keep this message"
    )
    cleanup()
    console.log(
      "✓ contact validity, department payload, async submission guard, failure/value preservation"
    )
    let application = ""
    render(
      <JobApplication
        jobTitle="Designer"
        onApply={async (data) => {
          application = data.name
        }}
      />
    )
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jamie" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jamie@example.com" },
    })
    fireEvent.change(screen.getByLabelText("What would you like us to know?"), {
      target: { value: "My experience" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }))
    assert(await screen.findByText("Your application has been submitted."))
    assert.equal(application, "Jamie")
    cleanup()
    let registration = ""
    render(
      <EventRegistration
        eventTitle="Workshop"
        onRegister={async (data) => {
          registration = data.email
        }}
      />
    )
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Sam" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sam@example.com" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: "Complete registration" })
    )
    assert(await screen.findByText("Your registration is confirmed."))
    assert.equal(registration, "sam@example.com")
    cleanup()
    console.log(
      "✓ application and event registration callbacks receive validated user data"
    )
  } finally {
    globalThis.FormData = previousFormData
  }
  render(<SiteBlockPreview name="careers-list" />)
  fireEvent.change(screen.getByLabelText("Find a role"), {
    target: { value: "designer" },
  })
  assert(screen.getByRole("heading", { name: "Product designer" }))
  assert.equal(
    screen.queryByRole("heading", { name: "Frontend engineer" }),
    null
  )
  fireEvent.change(screen.getByLabelText("Department"), {
    target: { value: "Engineering" },
  })
  assert(screen.getByText("No roles match your search."))
  cleanup()
  render(<SiteBlockPreview name="blog-index" />)
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: "Design" },
  })
  assert(
    screen.getByRole("heading", { name: "The details between the big ideas" })
  )
  assert.equal(
    screen.queryByRole("heading", { name: "Make room for better decisions" }),
    null
  )
  cleanup()
  render(<SiteBlockPreview name="integration-directory" />)
  fireEvent.change(screen.getByLabelText("Find an integration"), {
    target: { value: "calendar" },
  })
  assert(screen.getByRole("heading", { name: "Team calendar" }))
  assert.equal(screen.queryByRole("heading", { name: "Shared files" }), null)
  cleanup()
  render(<SiteBlockPreview name="event-index" />)
  fireEvent.change(screen.getByLabelText("Event type"), {
    target: { value: "Webinar" },
  })
  assert(screen.getByRole("heading", { name: "Design and delivery" }))
  assert.equal(
    screen.queryByRole("heading", { name: "A better project brief" }),
    null
  )
  cleanup()
  render(<SiteBlockPreview name="release-feed" />)
  fireEvent.change(screen.getByLabelText("Release type"), {
    target: { value: "Improvement" },
  })
  assert(screen.getByRole("heading", { name: "Keyboard improvements" }))
  assert.equal(screen.queryByRole("heading", { name: "Project views" }), null)
  cleanup()
  console.log(
    "✓ careers, editorial, integration, event and release filters update visible content"
  )
  render(<SiteBlockPreview name="how-it-works" />)
  fireEvent.click(screen.getByRole("button", { name: /Make a plan/ }))
  assert.equal(
    screen
      .getByRole("button", { name: /Make a plan/ })
      .getAttribute("aria-pressed"),
    "true"
  )
  assert(screen.getByRole("heading", { name: "Make a plan" }))
  cleanup()
  render(<SiteBlockPreview name="documentation-shell" />)
  fireEvent.click(screen.getByRole("button", { name: "Project views" }))
  assert(
    screen.getByText(
      "Use a list for scanning work and a board for understanding stages."
    )
  )
  fireEvent.change(screen.getByLabelText("Documentation version"), {
    target: { value: "1.1" },
  })
  assert(screen.getByRole("heading", { name: "Getting started (1.1)" }))
  cleanup()
  let vote = ""
  render(
    <Roadmap
      title="Roadmap"
      items={[
        {
          id: "new",
          title: "New feature",
          description: "A proposal",
          status: "planned",
          votes: 1,
        },
      ]}
      onVote={async (id) => {
        vote = id
      }}
    />
  )
  fireEvent.click(screen.getByRole("button", { name: /Vote/ }))
  assert(await screen.findByText("Vote saved."))
  assert.equal(vote, "new")
  cleanup()
  console.log(
    "✓ process selection, documentation navigation/version and roadmap callback"
  )
  let saved: Record<string, boolean> | undefined
  render(
    <ConsentPreferences
      categories={[
        {
          id: "necessary",
          name: "Necessary",
          description: "Required",
          required: true,
        },
        { id: "analytics", name: "Analytics", description: "Optional" },
      ]}
      defaultValue={{ necessary: false, analytics: true }}
      onSave={async (value) => {
        saved = value
      }}
    />
  )
  const necessary = screen.getByRole("checkbox", {
    name: /Necessary/,
  }) as HTMLInputElement
  assert.equal(necessary.checked, true)
  assert.equal(necessary.disabled, true)
  fireEvent.click(screen.getByRole("button", { name: "Reject optional" }))
  assert(await screen.findByText("Your preferences have been saved."))
  assert.deepEqual(saved, { necessary: true, analytics: false })
  assert.equal(
    (screen.getByRole("checkbox", { name: /Analytics/ }) as HTMLInputElement)
      .checked,
    false
  )
  cleanup()
  render(<SiteBlockPreview name="announcement-bar" />)
  fireEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }))
  assert.equal(
    screen.queryByRole("complementary", { name: "Announcement" }),
    null
  )
  assert(screen.getByRole("button", { name: "Restore announcement" }))
  cleanup()
  console.log(
    "✓ consent enforces required categories and reject-optional, announcement dismiss/restore"
  )
  render(<SiteBlockPreview name="video-showcase" />)
  fireEvent.click(screen.getByRole("button", { name: "Play Circle study" }))
  assert(await screen.findByRole("dialog"))
  assert(
    screen
      .getByLabelText("Circle study", { selector: "video" })
      .getAttribute("src")
      ?.startsWith("data:video/mp4;base64,")
  )
  cleanup()
  render(<SiteBlockPreview name="media-gallery" />)
  fireEvent.click(
    screen.getByRole("button", { name: "Preview Blue circle study" })
  )
  assert(await screen.findByRole("dialog"))
  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  assert(screen.getByRole("heading", { name: "Arch study" }))
  cleanup()
  const definitions = JSON.parse(
    await readFile("apps/web/lib/site-block-definitions.json", "utf8")
  )
  assert.equal(definitions.length, 33)
  for (const def of definitions) {
    assert(siteBlockPreviewNames.includes(def.id), def.id)
    const source = await readFile(
      `packages/ui/src/blocks/${def.module}.tsx`,
      "utf8"
    )
    assert(source.includes(`export function ${def.component}(`), def.component)
  }
  console.log(
    "✓ media dialogs and local video asset, complete definition/source/preview coverage"
  )
}
