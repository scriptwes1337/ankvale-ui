export type TimeDisambiguation = "reject" | "earlier" | "later"
const formatters = new Map<string, Intl.DateTimeFormat>()
/** Stable ISO-shaped wall time in the supplied IANA zone, independent of the host zone. */
export function zonedWallTime(instant: Date, timeZone: string) {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA-u-ca-iso8601-nu-latn", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
    formatters.set(timeZone, formatter)
  }
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map(({ type, value }) => [type, value])
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
}
/** Rejects nonexistent times. Ambiguous overlap times require an explicit earlier/later policy. */
export function resolveZonedWallTime(
  wall: string,
  timeZone: string,
  disambiguation: TimeDisambiguation = "reject"
) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(wall))
    throw new Error("Enter a valid date and time.")
  const normalized = wall.length === 16 ? `${wall}:00` : wall
  const guess = Date.parse(`${normalized}Z`)
  if (
    !Number.isFinite(guess) ||
    new Date(guess).toISOString().slice(0, 19) !== normalized
  )
    throw new Error("Enter a valid date and time.")
  const offsets = new Set<number>()
  // Observe both sides of offset transitions, including half-hour and date-line changes.
  for (let hours = -48; hours <= 48; hours += 6) {
    const sample = guess + hours * 3600000
    offsets.add(
      Date.parse(`${zonedWallTime(new Date(sample), timeZone)}Z`) - sample
    )
  }
  const candidates = [...offsets]
    .map((offset) => new Date(guess - offset))
    .filter((date) => zonedWallTime(date, timeZone) === normalized)
    .sort((a, b) => a.getTime() - b.getTime())
  if (!candidates.length)
    throw new Error(
      `This time does not exist in ${timeZone} because the clocks change. Choose another time.`
    )
  if (candidates.length > 1 && disambiguation === "reject")
    throw new Error(
      `This time occurs twice in ${timeZone}. Choose the earlier or later occurrence.`
    )
  return candidates[disambiguation === "later" ? candidates.length - 1 : 0]!
}
export function shiftWallDate(wall: string, days: number) {
  const value = new Date(`${wall}Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 19)
}
