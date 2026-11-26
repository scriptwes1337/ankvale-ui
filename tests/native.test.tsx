import assert from "node:assert/strict"
import { render, fireEvent, cleanup, screen, act } from "@testing-library/react"
import { NativePreview } from "../apps/web/components/native-previews"
import inventory from "../docs/expansion/inventory.json"
import * as N from "../packages/native-ui/src"
import { parseDate, dateKey } from "../packages/native-ui/src/lib/dates"
export async function run() {
  for (const { id } of inventory.native) {
    const view = render(<NativePreview name={id} />)
    assert(
      view.container.textContent?.length ||
        view.container.querySelector("svg,[role=progressbar]"),
      `${id} is empty`
    )
    cleanup()
  }
  console.log("✓ 53 native browser previews render")
  let number = 0
  render(
    <N.NumberStepper
      defaultValue={1}
      min={0}
      max={2}
      onValueChange={(v) => (number = v)}
    />
  )
  fireEvent.click(screen.getByRole("button", { name: /increase/i }))
  assert.equal(number, 2)
  fireEvent.click(screen.getByRole("button", { name: /increase/i }))
  assert.equal(number, 2)
  cleanup()
  console.log("✓ native stepper bounds")
  let date = ""
  render(
    <N.Calendar
      defaultValue="2026-11-26"
      min="2026-11-20"
      max="2026-11-29"
      onValueChange={(v) => (date = v)}
    />
  )
  fireEvent.click(
    screen.getByRole("button", { name: /Friday, November 27, 2026/ })
  )
  assert.equal(date, "2026-11-27")
  fireEvent.click(
    screen.getByRole("button", { name: /Monday, November 30, 2026/ })
  )
  assert.equal(date, "2026-11-27")
  cleanup()
  console.log("✓ native calendar bounds and selection")
  let range = { start: "", end: "" }
  render(
    <N.RangeCalendar
      defaultValue={{ start: "2026-11-26", end: "2026-11-26" }}
      onValueChange={(v) => (range = v)}
    />
  )
  fireEvent.click(
    screen.getByRole("button", { name: /Friday, November 27, 2026/ })
  )
  fireEvent.click(
    screen.getByRole("button", { name: /Tuesday, November 24, 2026/ })
  )
  assert.deepEqual(range, { start: "2026-11-24", end: "2026-11-27" })
  cleanup()
  console.log("✓ native range reverse selection")
  render(<N.DateField defaultValue="2026-11-26" />)
  const input = screen.getByRole("textbox")
  fireEvent.change(input, { target: { value: "2026-02-31" } })
  fireEvent.blur(input)
  assert(screen.getByRole("alert").textContent?.includes("valid"))
  cleanup()
  assert.equal(parseDate("2026-02-29"), null)
  assert.equal(dateKey(parseDate("2024-02-29")!), "2024-02-29")
  console.log("✓ native date validation and leap years")
  let selected = ""
  render(
    <N.Autocomplete
      label="Team"
      options={[
        { value: "design", label: "Design" },
        { value: "code", label: "Engineering" },
      ]}
      onValueChange={(v) => (selected = v)}
    />
  )
  fireEvent.focus(screen.getByRole("combobox"))
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "Des" } })
  fireEvent.click(screen.getByRole("button", { name: "Design" }))
  assert.equal(selected, "design")
  cleanup()
  console.log("✓ native autocomplete filtering and selection")
  let digits = ""
  render(<N.NumberPad maxLength={2} onValueChange={(v) => (digits = v)} />)
  fireEvent.click(screen.getByRole("button", { name: "1" }))
  fireEvent.click(screen.getByRole("button", { name: "2" }))
  fireEvent.click(screen.getByRole("button", { name: "3" }))
  assert.equal(digits, "12")
  fireEvent.click(screen.getByRole("button", { name: "Delete digit" }))
  assert.equal(digits, "1")
  cleanup()
  console.log("✓ native number pad limits and deletion")
  render(
    <N.Segment
      options={[
        { value: "one", label: "One" },
        { value: "two", label: "Two" },
      ]}
    />
  )
  fireEvent.click(screen.getByRole("tab", { name: "Two" }))
  assert.equal(
    screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
    "true"
  )
  cleanup()
  console.log("✓ native segment selection")
  render(
    <N.LineChart
      data={[
        { name: "Jan", value: 12 },
        { name: "Feb", value: 20 },
      ]}
      xKey="name"
      series={[{ key: "value" }]}
    />
  )
  fireEvent.click(screen.getByRole("button", { name: "Feb: value 20" }))
  assert(screen.getByText("Feb: value 20"))
  cleanup()
  console.log("✓ native chart accessible data selection")
  let time = ""
  render(
    <N.WheelTimePicker
      defaultValue="23:45"
      hourCycle={12}
      onValueChange={(value) => (time = value)}
    />
  )
  fireEvent.click(screen.getByRole("radio", { name: "AM" }))
  assert.equal(time, "11:45")
  cleanup()
  console.log("✓ native 12-hour conversion")
  let dateTime = ""
  render(
    <N.WheelDateTimePicker
      defaultValue="2024-02-29T09:30"
      min="2020-01-01T00:00"
      max="2030-12-31T23:59"
      onValueChange={(value) => (dateTime = value)}
    />
  )
  fireEvent.click(screen.getByRole("radio", { name: "2025", exact: true }))
  assert.equal(dateTime, "2025-02-28T09:30")
  cleanup()
  console.log("✓ wheel date clamps leap-day changes")
  let archived = false
  render(
    <N.SwipeableRow
      actions={[{ label: "Archive", onPress: () => (archived = true) }]}
    >
      <span>Message</span>
    </N.SwipeableRow>
  )
  assert.equal(screen.queryByRole("button", { name: "Archive" }), null)
  fireEvent.click(screen.getByRole("button", { name: "Row actions" }))
  fireEvent.click(screen.getByRole("button", { name: "Archive" }))
  assert(archived)
  assert.equal(screen.queryByRole("button", { name: "Archive" }), null)
  cleanup()
  console.log("✓ swipeable row action visibility and activation")
  let push: ((row: Record<string, string | number>) => void) | undefined,
    unsubscribed = false
  const live = render(
    <N.LiveChart
      data={[{ name: "One", value: 1 }]}
      xKey="name"
      series={[{ key: "value" }]}
      maxPoints={2}
      subscribe={(callback) => {
        push = callback
        return () => {
          unsubscribed = true
        }
      }}
    />
  )
  act(() => {
    push?.({ name: "Two", value: 2 })
    push?.({ name: "Three", value: 3 })
  })
  assert.equal(screen.queryByRole("button", { name: "One: value 1" }), null)
  assert(screen.getByRole("button", { name: "Three: value 3" }))
  live.unmount()
  assert(unsubscribed)
  console.log("✓ live chart rolling window and unsubscribe")
  let phone = "",
    country = "",
    valid = false
  render(
    <N.PhoneNumberField
      defaultCountry="US"
      onValueChange={(value) => (phone = value)}
      onCountryChange={(value) => (country = value)}
      onValidationChange={(result) => (valid = result.valid)}
    />
  )
  const phoneInput = screen.getByRole("textbox", { name: "Phone number" })
  fireEvent.change(phoneInput, { target: { value: "+65 8123 4567" } })
  assert.equal(phone, "+6581234567")
  assert.equal(country, "SG")
  assert.equal((phoneInput as HTMLInputElement).value, "8123 4567")
  fireEvent.blur(phoneInput)
  assert(valid)
  fireEvent.click(
    screen.getByRole("button", { name: "Country calling code: +65" })
  )
  const countrySearch = screen.getByRole("combobox", {
    name: "Search Country calling code",
  })
  fireEvent.change(countrySearch, { target: { value: "GB" } })
  fireEvent.click(
    screen.getByRole("button", { name: "United Kingdom (GB) +44" })
  )
  assert.equal(country, "GB")
  assert.equal(phone, "+4481234567")
  cleanup()
  console.log(
    "✓ international phone paste, formatting, validation, country search and E.164 output"
  )
}
