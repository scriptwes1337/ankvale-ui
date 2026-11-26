"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import {
  ArrowUpRightIcon,
  ArrowClockwiseIcon,
  CopyIcon,
  CodeIcon,
  EyeIcon,
  DesktopIcon,
  DeviceMobileIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react"
import {
  heroVariants as variants,
  heroExamples as examples,
  type HeroVariant as Variant,
} from "@/lib/hero-catalog"
import { Button } from "@ankvale/ui/components/button"
import { Label } from "@ankvale/ui/components/label"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@ankvale/ui/lib/utils"

export function HeroGallery({
  source,
  graphicsSource,
}: {
  source: string
  graphicsSource: string
}) {
  const [variant, setVariant] = useState<Variant>("split")
  const [tab, setTab] = useState<"preview" | "code" | "source">("preview")
  const [file, setFile] = useState<"layout" | "graphics">("layout")
  const [content, setContent] = useState(examples)
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop")
  const [revision, setRevision] = useState(0)
  const [customize, setCustomize] = useState(false)
  const [copied, setCopied] = useState("")
  const [origin, setOrigin] = useState("")
  const formId = useId()
  useEffect(() => {
    function update() {
      const name = window.location.hash.slice(1)
      if (Object.hasOwn(variants, name)) setVariant(name as Variant)
    }
    update()
    setOrigin(window.location.origin)
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [])
  const Hero = variants[variant],
    current = content[variant]
  const name = `Hero${variant.charAt(0).toUpperCase() + variant.slice(1)}`
  const usage = `import { ${name} } from "@/components/blocks/heroes"\nimport { Button } from "@/components/ui/button"\n\nexport function Hero() {\n  return (\n    <${name}\n      headingLevel="h1"\n      title={${JSON.stringify(current.title)}}\n      description={${JSON.stringify(current.description)}}\n      actions={\n        <Button nativeButton={false} render={<a href="/playground" />}>\n          Explore the library\n        </Button>\n      }\n    />\n  )\n}\n\n// Interactive artwork is included. Pass your own children to replace it.\n// Pass children={null} for a text-only composition.`
  const currentSource = file === "layout" ? source : graphicsSource
  const install = `npx shadcn@latest add ${origin || "<registry-origin>"}/r/hero-blocks.json`
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(`${label} copied`)
    } catch {
      setCopied("Copy failed")
    }
  }
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[1600px] px-4 pt-8 pb-16 sm:px-6 lg:px-10"
      >
        <div className="mb-7 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Heroes</h1>
          <Link
            href="/blocks"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            All blocks <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div
          className="mb-6 flex gap-1 overflow-x-auto border-b"
          role="group"
          aria-label="Hero layout"
        >
          {(Object.keys(variants) as Variant[]).map((name, index) => (
            <button
              key={name}
              type="button"
              aria-pressed={variant === name}
              onClick={() => {
                setVariant(name)
                history.replaceState(null, "", `#${name}`)
                setCopied("")
              }}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                variant === name
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="font-mono text-[10px] opacity-50">
                0{index + 1}
              </span>
              {name}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-3 py-2.5 sm:px-4">
            <div className="flex gap-1" role="group" aria-label="Block view">
              {(["preview", "code", "source"] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={tab === value ? "secondary" : "ghost"}
                  aria-pressed={tab === value}
                  className="capitalize"
                  onClick={() => {
                    setTab(value)
                    setCopied("")
                  }}
                >
                  {value === "preview" ? <EyeIcon /> : <CodeIcon />}
                  {value === "code" ? "Usage" : value}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={
                  <Link
                    href={`/examples/heroes/${variant}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                aria-label="Open full-page hero preview"
              >
                <ArrowUpRightIcon />
              </Button>
              {tab === "preview" && (
                <>
                  <div
                    className="me-2 flex gap-1 border-e pe-3"
                    role="group"
                    aria-label="Preview width"
                  >
                    <Button
                      size="icon-sm"
                      variant={width === "desktop" ? "secondary" : "ghost"}
                      aria-label="Desktop preview"
                      aria-pressed={width === "desktop"}
                      onClick={() => setWidth("desktop")}
                    >
                      <DesktopIcon />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant={width === "mobile" ? "secondary" : "ghost"}
                      aria-label="Mobile preview"
                      aria-pressed={width === "mobile"}
                      onClick={() => setWidth("mobile")}
                    >
                      <DeviceMobileIcon />
                    </Button>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Replay hero entrance"
                    onClick={() => setRevision((value) => value + 1)}
                  >
                    <ArrowClockwiseIcon />
                  </Button>
                  <Button
                    size="sm"
                    variant={customize ? "secondary" : "ghost"}
                    aria-expanded={customize}
                    aria-controls={formId}
                    onClick={() => setCustomize(!customize)}
                  >
                    <SlidersHorizontalIcon />
                    <span className="hidden sm:inline">Customize</span>
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copy(
                    tab === "source" ? currentSource : usage,
                    tab === "source" ? "Source" : "Usage"
                  )
                }
              >
                <CopyIcon />
                <span className="hidden sm:inline">
                  {tab === "source" ? "Copy file" : "Copy usage"}
                </span>
              </Button>
            </div>
          </div>
          {tab === "preview" ? (
            <div
              className={cn(
                "flex justify-center",
                width === "mobile" && "bg-secondary px-3 py-8"
              )}
            >
              <div
                className={cn(
                  "min-w-0 flex-1 bg-background",
                  width === "mobile" && "overflow-hidden rounded-lg border"
                )}
                style={{ maxWidth: width === "mobile" ? 390 : "100%" }}
              >
                <div className="flex h-17 items-center justify-between gap-4 border-b border-border/70 px-[clamp(1.5rem,4%,4rem)]">
                  <a
                    href="/"
                    className="flex items-center gap-2 text-sm font-semibold tracking-tight"
                  >
                    <BrandMark className="w-7" />
                    Ankvale
                    <span className="text-xs font-normal text-muted-foreground">
                      studio
                    </span>
                  </a>
                  <nav
                    aria-label="Hero example navigation"
                    className="flex items-center gap-6 text-xs"
                  >
                    <Link
                      href="/blocks"
                      className={cn(
                        "text-muted-foreground hover:text-foreground",
                        width === "mobile" && "hidden"
                      )}
                    >
                      Blocks
                    </Link>
                    <Link
                      href="/templates"
                      className={cn(
                        "hidden text-muted-foreground hover:text-foreground sm:inline",
                        width === "mobile" && "sm:hidden"
                      )}
                    >
                      Templates
                    </Link>
                    <Link
                      href="/#install"
                      className="flex items-center gap-1.5 font-medium"
                    >
                      Get started <ArrowUpRightIcon />
                    </Link>
                  </nav>
                </div>
                <Hero
                  key={`${variant}-${revision}`}
                  title={current.title}
                  description={current.description}
                  actions={
                    <>
                      <Button
                        size="lg"
                        nativeButton={false}
                        render={<Link href="/#install" />}
                      >
                        Get started <ArrowUpRightIcon />
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        nativeButton={false}
                        render={<Link href="/playground" />}
                      >
                        Explore the library <span aria-hidden="true">→</span>
                      </Button>
                    </>
                  }
                />
              </div>
            </div>
          ) : (
            <div>
              {tab === "source" && (
                <div
                  role="group"
                  aria-label="Source file"
                  className="flex gap-2 border-b px-4 py-2"
                >
                  {(["layout", "graphics"] as const).map((name) => (
                    <Button
                      key={name}
                      size="sm"
                      variant={file === name ? "secondary" : "ghost"}
                      aria-pressed={file === name}
                      onClick={() => {
                        setFile(name)
                        setCopied("")
                      }}
                    >
                      {name === "layout" ? "heroes.tsx" : "hero-graphics.tsx"}
                    </Button>
                  ))}
                </div>
              )}
              <pre
                tabIndex={0}
                className="max-h-[75vh] min-h-[500px] overflow-auto p-6 text-xs leading-7"
              >
                <code>{tab === "source" ? currentSource : usage}</code>
              </pre>
            </div>
          )}
        </div>
        {customize && (
          <section
            id={formId}
            aria-label="Customize hero content"
            className="mt-4 grid gap-6 rounded-lg border bg-card p-6 md:grid-cols-2"
          >
            <div className="grid gap-2">
              <Label htmlFor="hero-headline">Headline</Label>
              <textarea
                id="hero-headline"
                rows={3}
                value={current.title}
                maxLength={120}
                onChange={(event) =>
                  setContent((previous) => ({
                    ...previous,
                    [variant]: {
                      ...previous[variant],
                      title: event.target.value,
                    },
                  }))
                }
                className="resize-y rounded-md border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-description">Description</Label>
              <textarea
                id="hero-description"
                rows={3}
                value={current.description}
                maxLength={240}
                onChange={(event) =>
                  setContent((previous) => ({
                    ...previous,
                    [variant]: {
                      ...previous[variant],
                      description: event.target.value,
                    },
                  }))
                }
                className="resize-y rounded-md border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() =>
                setContent((previous) => ({
                  ...previous,
                  [variant]: examples[variant],
                }))
              }
            >
              Reset this example
            </Button>
          </section>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <p role="status" className="text-muted-foreground">
            {copied}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="max-w-full overflow-x-auto rounded border bg-card px-3 py-2 text-[11px]">
              {install}
            </code>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Copy hero installation command"
              onClick={() => copy(install, "Install command")}
            >
              <CopyIcon />
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
