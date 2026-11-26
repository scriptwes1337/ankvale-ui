"use client"
import {
  SiteCollectionState,
  type SiteCollectionStatus,
} from "@ankvale/ui/blocks/site-shared"
import { useId, useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Textarea } from "@ankvale/ui/components/textarea"
import { Button } from "@ankvale/ui/components/button"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import {
  SiteFilter,
  SiteEmpty,
  SiteBadge,
  useSiteSubmission,
  SubmissionFeedback,
} from "@ankvale/ui/blocks/site-shared"
export type JobPosting = {
  id: string
  title: string
  department: string
  location: string
  employment: string
  href: string
  salary?: string
}
export function CareersList({
  jobs,
  loading,
  error,
  onRetry,
  ...props
}: SectionProps & SiteCollectionStatus & { jobs: JobPosting[] }) {
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState("")
  const departments = [...new Set(jobs.map((job) => job.department))]
  const filtered = jobs.filter(
    (job) =>
      (!department || job.department === department) &&
      `${job.title} ${job.location}`.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <BlockSection {...props} aria-busy={loading} data-slot="careers-list">
      <SectionHeading {...props} />
      <SiteCollectionState loading={loading} error={error} onRetry={onRetry} />
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_240px]">
        <label className="space-y-2 text-sm font-medium">
          <span>Find a role</span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles or locations"
          />
        </label>
        <SiteFilter
          label="Department"
          options={departments}
          value={department}
          onChange={setDepartment}
        />
      </div>
      <ul className="divide-y border-y">
        {filtered.map((job) => (
          <li key={job.id}>
            <a
              href={job.href}
              className="flex flex-wrap items-center justify-between gap-5 rounded py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {job.department} · {job.location} · {job.employment}
                </p>
              </div>
              <span aria-hidden="true" className="text-xl text-primary">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
      {!loading && !error && !filtered.length && (
        <SiteEmpty>No roles match your search.</SiteEmpty>
      )}
    </BlockSection>
  )
}
export function JobDetail({
  job,
  children,
  applyHref,
  ...props
}: SectionProps & { job: JobPosting; applyHref: string; children: ReactNode }) {
  return (
    <BlockSection {...props} data-slot="job-detail">
      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <article>
          <p className="mb-3 text-sm text-primary">{job.department}</p>
          <h2 className="text-4xl font-semibold tracking-tight">{job.title}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <SiteBadge>{job.location}</SiteBadge>
            <SiteBadge>{job.employment}</SiteBadge>
            {job.salary && <SiteBadge>{job.salary}</SiteBadge>}
          </div>
          <div className="mt-10 max-w-[70ch] space-y-5 leading-7 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:ps-6">
            {children}
          </div>
        </article>
        <aside className="h-fit rounded-lg border p-6">
          <h3 className="font-semibold">Apply for this role</h3>
          <p className="my-4 text-sm leading-6 text-muted-foreground">
            Tell us about your experience and the work you would like to do.
          </p>
          <Button nativeButton={false} render={<a href={applyHref} />}>
            Start application
          </Button>
        </aside>
      </div>
    </BlockSection>
  )
}
export type JobApplicationData = {
  name: string
  email: string
  portfolio: string
  coverLetter: string
  resume: File | null
}
export function JobApplication({
  jobTitle,
  onApply,
  ...props
}: SectionProps & {
  jobTitle: string
  onApply: (data: JobApplicationData) => void | Promise<void>
}) {
  const id = useId()
  const submission = useSiteSubmission()
  return (
    <BlockSection {...props} data-slot="job-application">
      <SectionHeading {...props} title={props.title ?? `Apply: ${jobTitle}`} />
      <form
        className="max-w-2xl space-y-5"
        onChange={() => {
          if (submission.status !== "idle" && submission.status !== "pending")
            submission.reset()
        }}
        onSubmit={async (e) => {
          e.preventDefault()
          if (!e.currentTarget.reportValidity()) return
          const data = new FormData(e.currentTarget)
          const resume = data.get("resume")
          await submission.run(() =>
            onApply({
              name: String(data.get("name") ?? ""),
              email: String(data.get("email") ?? ""),
              portfolio: String(data.get("portfolio") ?? ""),
              coverLetter: String(data.get("coverLetter") ?? ""),
              resume: resume instanceof File && resume.size ? resume : null,
            })
          )
        }}
      >
        <fieldset
          disabled={submission.status === "pending"}
          className="space-y-5"
        >
          <label
            htmlFor={`${id}-name`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Name</span>
            <Input name="name" id={`${id}-name`} autoComplete="name" required />
          </label>
          <label
            htmlFor={`${id}-email`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Email</span>
            <Input
              type="email"
              name="email"
              id={`${id}-email`}
              autoComplete="email"
              required
            />
          </label>
          <label
            htmlFor={`${id}-portfolio`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Portfolio or profile URL</span>
            <Input type="url" name="portfolio" id={`${id}-portfolio`} />
          </label>
          <label
            htmlFor={`${id}-resume`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>Resume (PDF)</span>
            <Input
              type="file"
              accept="application/pdf"
              name="resume"
              id={`${id}-resume`}
            />
          </label>
          <label
            htmlFor={`${id}-cover`}
            className="block space-y-2 text-sm font-medium"
          >
            <span>What would you like us to know?</span>
            <Textarea name="coverLetter" id={`${id}-cover`} required rows={5} />
          </label>
          <Button type="submit">
            {submission.status === "pending"
              ? "Submitting…"
              : "Submit application"}
          </Button>
        </fieldset>
        <SubmissionFeedback
          status={submission.status}
          success="Your application has been submitted."
          error="Your application could not be submitted. Your details are still here; try again."
        />
      </form>
    </BlockSection>
  )
}
