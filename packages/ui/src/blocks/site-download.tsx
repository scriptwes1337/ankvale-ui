import type { ReactNode } from "react"
import {
  BlockSection,
  SectionHeading,
  type SectionProps,
} from "@ankvale/ui/blocks/shared"
import { Button } from "@ankvale/ui/components/button"
export type DownloadPlatform = {
  id: string
  name: string
  version: string
  requirements: string
  href: string
  fileName?: string
  icon?: ReactNode
  releaseNotesHref?: string
}
export function DownloadSection({
  platforms,
  ...props
}: SectionProps & { platforms: DownloadPlatform[] }) {
  return (
    <BlockSection {...props} data-slot="download-section">
      <SectionHeading {...props} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <li key={platform.id}>
            <article className="flex h-full flex-col rounded-lg border p-6">
              {platform.icon && (
                <span aria-hidden="true" className="mb-5 text-3xl">
                  {platform.icon}
                </span>
              )}
              <h3 className="text-lg font-semibold">{platform.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Version {platform.version}
              </p>
              <p className="mt-3 flex-1 text-xs leading-6 text-muted-foreground">
                {platform.requirements}
              </p>
              <Button
                className="mt-6 w-fit"
                nativeButton={false}
                render={<a href={platform.href} download={platform.fileName} />}
              >
                Download {platform.name}
              </Button>
              {platform.releaseNotesHref && (
                <a
                  href={platform.releaseNotesHref}
                  className="mt-4 text-xs text-primary hover:underline"
                >
                  Release notes →
                </a>
              )}
            </article>
          </li>
        ))}
      </ul>
      {!platforms.length && (
        <p role="status" className="text-sm text-muted-foreground">
          No downloads available.
        </p>
      )}
    </BlockSection>
  )
}
