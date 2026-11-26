import type { ReactNode } from "react"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import { Image } from "@ankvale/ui/components/image"
export type CompanyMilestone = {
  id: string
  date: string
  title: string
  description: string
}
export function AboutStory({
  narrative,
  visual,
  milestones = [],
  ...props
}: SectionProps & {
  narrative: ReactNode
  visual?: ReactNode
  milestones?: CompanyMilestone[]
}) {
  return (
    <BlockSection {...props} data-slot="about-story">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <SectionHeading {...props} />
          <div className="max-w-[65ch] space-y-4 text-base leading-7 text-muted-foreground">
            {narrative}
          </div>
        </div>
        {visual && (
          <div className="flex items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-8">
            {visual}
          </div>
        )}
      </div>
      {milestones.length > 0 && (
        <ol
          aria-label="Company history"
          className="mt-14 grid gap-6 border-t pt-8 sm:grid-cols-3"
        >
          {milestones.map((item) => (
            <li key={item.id}>
              <p className="text-xs text-primary">{item.date}</p>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      )}
    </BlockSection>
  )
}
export type TeamMember = {
  id: string
  name: string
  role: string
  bio?: string
  image?: { src: string; alt: string }
  href?: string
  links?: { label: string; href: string }[]
}
export function TeamGrid({
  members,
  ...props
}: SectionProps & { members: TeamMember[] }) {
  return (
    <BlockSection {...props} data-slot="team-grid">
      <SectionHeading {...props} />
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <li key={member.id}>
            <article>
              {member.image ? (
                <Image
                  {...member.image}
                  className="mb-5 aspect-[4/3] w-full rounded-lg"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="mb-5 flex aspect-[4/3] items-center justify-center rounded-lg bg-muted text-5xl font-medium tracking-tight text-muted-foreground"
                >
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              )}
              <h3 className="font-semibold">
                {member.href ? (
                  <a
                    href={member.href}
                    className="underline-offset-4 hover:underline"
                  >
                    {member.name}
                  </a>
                ) : (
                  member.name
                )}
              </h3>
              <p className="mt-1 text-sm text-primary">{member.role}</p>
              {member.bio && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {member.bio}
                </p>
              )}
              {member.links && (
                <div className="mt-3 flex gap-3">
                  {member.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-xs underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
      {!members.length && (
        <p className="text-sm text-muted-foreground">
          No team profiles available.
        </p>
      )}
    </BlockSection>
  )
}
export function TeamProfile({
  member,
  children,
  ...props
}: SectionProps & { member: TeamMember }) {
  return (
    <BlockSection {...props} data-slot="team-profile">
      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          {member.image ? (
            <Image
              {...member.image}
              className="aspect-square w-full rounded-lg"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex aspect-square items-center justify-center rounded-lg bg-muted text-6xl"
            >
              {member.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>
        <div>
          <p className="mb-3 text-sm text-primary">{member.role}</p>
          <h2 className="text-4xl font-semibold tracking-tight">
            {member.name}
          </h2>
          {member.bio && (
            <p className="mt-5 max-w-[65ch] leading-7 text-muted-foreground">
              {member.bio}
            </p>
          )}
          <div className="mt-6 space-y-4 leading-7">{children}</div>
          {member.links && (
            <nav
              aria-label={`${member.name} links`}
              className="mt-6 flex gap-4"
            >
              {member.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </BlockSection>
  )
}
