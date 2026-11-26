# Scheduling

`Scheduler` now includes simultaneous resource-day lanes, a recurring series editor, per-occurrence overrides/skips, and IANA timezone conversion. Resources, events, persistence, availability and authoritative conflict checks remain application data.

## Time and recurrence contracts

`resolveZonedWallTime(wall, timeZone, policy)` parses a real ISO calendar wall time using Intl timezone rules. Nonexistent DST times are rejected. Repeated clock times require `earlier` or `later`, or throw under the default `reject` policy. Half-hour offsets, quarter-hour zones and non-hour overlap transitions are supported. No arbitrary fixed-hour conversion is used. `zonedWallTime` formats an instant in the supplied IANA zone.

Recurring events store their zone in `timeZone`. For backwards compatibility, events without a zone use the browser zone. Daily/weekly occurrences advance calendar dates in that zone, preserving wall time across offset changes. Recurrences are bounded to 366 instances. `gapPolicy: "skip"` can skip nonexistent recurring times; otherwise expansion reports an error and the editor offers a way to correct the series. `disambiguation` determines repeated future times. This is a bounded daily/weekly model, not a general RFC 5545 recurrence-rule interpreter.

An expanded instance carries `seriesId` and its original `occurrenceKey` date, even after moving it. `recurrence.overrides[key]` changes only that instance; `exceptions` suppress it. `updateOccurrence(series, key, overrideOrNull)` is immutable. Choosing “This occurrence” persists the updated series; choosing “Entire series” edits its anchor and repeat rule. Existing keyed exceptions/overrides are retained. Moving a series anchor may make some old date keys inapplicable; the owner can clear/remap them explicitly if desired.

The editor awaits `onSave(updatedSeries)` before emitting `onEventsChange`, blocks duplicate saves, retains rejected drafts and supports retry. Skipping an occurrence follows the same persistence contract. `findEventConflicts` checks every expanded occurrence against the other series and also detects a series overlapping itself. The server must recheck races and its own availability policy before confirming a booking.

## Views

Resource-day lanes use the configured IANA timezone and support overlapping events, independent resource columns, a date input and native event buttons. Keyboard users open the same editor as pointer users. The 24-hour wall-time axis displays local clock positions; overlapping clock times can share a visual position. The optional existing Agenda week/month view is explicitly labeled “Calendar (browser timezone)” because its third-party localizer uses browser-local dates. It is read-only here so drag operations cannot bypass validation; use the editor for changes. The standalone Agenda retains its original drag/resize APIs.

Pass `initialDate` for a deterministic initial view. Without it, the first event date is used, then the current date if there are no events. The consuming route owns loading/error boundaries and remote fetching.

## Verification

`node scripts/test-tooling.mjs tests/scheduler.test.tsx` checks IANA quarter-hour offsets, DST gaps/overlaps including a half-hour overlap, date validation, wall-clock recurrence across DST, immutable occurrence edits/exceptions, future and self-conflicts, lane rendering and rejected-save/retry/skip interactions.
