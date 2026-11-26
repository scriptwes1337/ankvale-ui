"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useState } from "react"
import {
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowUpRightIcon,
  CodeIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Motion } from "@ankvale/ui/components/motion"
import { SiteHeader } from "@/components/site-header"
import { BrandMark } from "@/components/brand-mark"
import { ProjectWorkspace } from "@/components/home/project-workspace"

const ComponentShowcases = dynamic(() =>
  import("./home/component-showcases").then(
    (module) => module.ComponentShowcases
  )
)
const WebsiteShowcases = dynamic(() =>
  import("./home/component-showcases").then((module) => module.WebsiteShowcases)
)
const AgentShowcase = dynamic(() =>
  import("./home/component-showcases").then((module) => module.AgentShowcase)
)
export function Homepage() {
  const [copyState, setCopyState] = useState("")
  const command = "npx @ankvalelabs/ui init"
  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(command)
      setCopyState("Installation command copied.")
    } catch {
      setCopyState("Copy unavailable. Select the command to copy it.")
    }
  }
  return (
    <div className="overflow-x-clip bg-background text-foreground">
      <SiteHeader />
      <main id="main-content">
        <section
          aria-labelledby="home-title"
          className="mx-auto max-w-[1440px] px-4 pt-14 pb-8 text-center sm:px-8 sm:pt-20 lg:px-12"
        >
          <div className="mx-auto mb-12 max-w-3xl sm:mb-16">
            <p className="mb-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Made for people. Ready for agents.
            </p>
            <h1
              id="home-title"
              className="text-[clamp(2.8rem,6.6vw,6.1rem)] leading-[1.02] font-semibold tracking-[-.065em]"
            >
              Your React
              <br />
              <span className="text-primary">frontend system.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Components, blocks, templates, animations, icons, and graphics.
              All in one system.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/playground" />}
              >
                Explore the library <ArrowRightIcon />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<a href="#workspace" />}
              >
                Try the workspace <ArrowDownIcon />
              </Button>
            </div>
          </div>
          <Motion duration={360}>
            <ProjectWorkspace />
          </Motion>
        </section>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 pt-6 pb-8 text-xs text-muted-foreground sm:gap-x-14">
          <span className="inline-flex items-center gap-2">
            <span className="text-foreground">React</span> & TypeScript
          </span>
          <span>Built on Base UI</span>
          <span>Keyboard accessible</span>
          <span>Reduced-motion support</span>
        </div>
        <ComponentShowcases />
        <WebsiteShowcases />
        <AgentShowcase />
        <section
          id="install"
          className="border-t bg-secondary/25 px-6 py-20 text-center sm:py-24"
          aria-labelledby="install-heading"
        >
          <div className="mx-auto max-w-2xl">
            <BrandMark className="mx-auto mb-6 w-14" />
            <h2
              id="install-heading"
              className="text-3xl font-semibold tracking-[-.045em] sm:text-5xl"
            >
              Make it your own.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Set up your Next.js project, including agent guides and skills.
            </p>
            <div className="mt-7 flex items-center gap-3 rounded-lg border bg-background p-3 text-start sm:p-4">
              <CodeIcon className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
              <code className="min-w-0 flex-1 overflow-x-auto py-1 text-[11px] whitespace-nowrap sm:text-xs">
                {command}
              </code>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Copy installation command"
                onClick={copyInstall}
              >
                {copyState === "Installation command copied." ? (
                  <CheckIcon />
                ) : (
                  <CopyIcon />
                )}
              </Button>
            </div>
            <p
              role="status"
              className="mt-3 min-h-4 text-xs text-muted-foreground"
            >
              {copyState}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/docs/system/installation"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary"
              >
                Installation guide <ArrowUpRightIcon />
              </Link>
              <a
                href="https://www.npmjs.com/package/@ankvalelabs/ui"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium"
              >
                View on npm <ArrowUpRightIcon />
              </a>
              <Link
                href="/templates"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium"
              >
                Explore templates <ArrowUpRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-8 text-xs text-muted-foreground lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <BrandMark className="w-7" />
          Ankvale UI
        </Link>
        <a href="https://www.ankvalelabs.com" className="hover:text-foreground">
          Built with Ankvale UI by Ankvale Labs
        </a>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/playground">Components</Link>
          <Link href="/blocks">Blocks</Link>
          <Link href="/icons">Icons</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/guides">Guides</Link>
        </nav>
      </footer>
    </div>
  )
}
