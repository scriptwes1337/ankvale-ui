"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CopyIcon,
  CodeIcon,
  EyeIcon,
  SquaresFourIcon,
  ListIcon,
  StarIcon,
  CurrencyDollarIcon,
  QuestionIcon,
  SparkleIcon,
  AnchorIcon,
} from "@phosphor-icons/react"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Label } from "@ankvale/ui/components/label"
import { SiteHeader } from "@/components/site-header"
import { BlockDemo, demoProps } from "@/components/block-demo"
import { blockDefinitions, categories, type BlockId } from "@/lib/block-catalog"
import { blockUsage } from "@/lib/block-usage"
import { cn } from "@ankvale/ui/lib/utils"

const categoryIcons = [
  QuestionIcon,
  ListIcon,
  SquaresFourIcon,
  StarIcon,
  CurrencyDollarIcon,
  QuestionIcon,
  SparkleIcon,
  AnchorIcon,
]
function defaults(category: string) {
  if (category === "Page states")
    return {
      title: "Page not found",
      description: "This page may have moved, or the address may be incorrect.",
    }
  return category === "Navigation" || category === "Footers"
    ? {
        title: "Ankvale Studio",
        description: "Clear tools for your notes, projects, and next idea.",
      }
    : category === "FAQs"
      ? {
          title: "Frequently asked questions",
          description: "",
        }
      : category === "Pricing"
        ? {
            title: "Plans and pricing",
            description: "Choose monthly or annual billing.",
          }
        : category === "Social proof"
          ? {
              title: "Customer stories",
              description:
                "Illustrative content. Replace these sample profiles and quotes with your own.",
            }
          : category === "Calls to action"
            ? {
                title: "Get started",
                description: "Create an account to start your first project.",
              }
            : {
                title: "Features",
                description: "Notes, projects, and team collaboration.",
              }
}
export function BlockGallery({ sources }: { sources: Record<string, string> }) {
  const [selected, setSelected] = useState<BlockId>("feature-bento")
  const [title, setTitle] = useState(defaults("Features").title)
  const [description, setDescription] = useState(
    defaults("Features").description
  )
  const [mode, setMode] = useState<"preview" | "code" | "source">("preview")
  const [copied, setCopied] = useState("")
  const [query, setQuery] = useState("")
  const [origin, setOrigin] = useState("")
  const definition = blockDefinitions.find((block) => block.id === selected)!
  function choose(id: BlockId) {
    const block = blockDefinitions.find((item) => item.id === id)!
    const content = defaults(block.category)
    setSelected(id)
    setTitle(content.title)
    setDescription(content.description)
    setCopied("")
  }
  useEffect(() => {
    setOrigin(window.location.origin)
    function update() {
      const hash = window.location.hash.slice(1)
      if (
        [
          "minimal",
          "product",
          "framed",
          "split",
          "centered",
          "statement",
          "editorial",
          "showcase",
          "canvas",
        ].includes(hash)
      ) {
        window.location.replace(`/blocks/heroes#${hash}`)
        return
      }
      const match = blockDefinitions.find((item) => item.id === hash)
      if (match) choose(match.id)
    }
    update()
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [])
  const usage = blockUsage(definition, demoProps(selected, title, description))
  const source = sources[definition.module] ?? ""
  const command = `npx shadcn@latest add ${origin}/r/${selected}.json`
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
    } catch {
      setCopied("Copy failed")
    }
  }
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[1440px] px-6 pt-12 pb-20 lg:px-10"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Blocks</h1>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/examples/studio" />}
          >
            Example website
          </Button>
        </div>
        <Link
          href="/blocks/heroes"
          className="mb-6 inline-block text-sm text-accent-foreground hover:underline"
        >
          Hero layouts →
        </Link>
        <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-xl border bg-card p-4 lg:sticky lg:top-5">
            <Input
              aria-label="Find a block"
              placeholder="Find a block…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-5"
            />
            <nav
              aria-label="Blocks"
              className="grid max-h-[60vh] gap-5 overflow-y-auto lg:max-h-[calc(100dvh-12rem)]"
            >
              {categories.map((category, index) => {
                const blocks = blockDefinitions.filter(
                  (block) =>
                    block.category === category &&
                    `${block.name} ${category}`
                      .toLowerCase()
                      .includes(query.toLowerCase())
                )
                const Icon = categoryIcons[index] ?? SquaresFourIcon
                return blocks.length > 0 ? (
                  <div key={category}>
                    <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Icon size={14} />
                      {category}
                    </p>
                    {blocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => {
                          choose(block.id)
                          window.history.replaceState(null, "", `#${block.id}`)
                        }}
                        aria-current={
                          selected === block.id ? "page" : undefined
                        }
                        className={cn(
                          "block w-full rounded-md px-3 py-2 text-start text-sm",
                          selected === block.id
                            ? "bg-muted font-medium"
                            : "text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        {block.name}
                      </button>
                    ))}
                  </div>
                ) : null
              })}
              {!blockDefinitions.some((block) =>
                `${block.name} ${block.category}`
                  .toLowerCase()
                  .includes(query.toLowerCase())
              ) && (
                <p className="text-sm text-muted-foreground">
                  No matching blocks.
                </p>
              )}
            </nav>
          </aside>
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {definition.category}
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  {definition.name}
                </h2>
              </div>
              <Link
                href={`/docs/blocks/${definition.module}`}
                className="text-sm text-primary hover:underline"
              >
                API reference →
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div
                  className="flex gap-1"
                  role="group"
                  aria-label="Block view"
                >
                  {(["preview", "code", "source"] as const).map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={mode === value ? "secondary" : "ghost"}
                      aria-pressed={mode === value}
                      onClick={() => setMode(value)}
                      className="capitalize"
                    >
                      {value === "preview" ? <EyeIcon /> : <CodeIcon />}
                      {value}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    copy(mode === "source" ? source : usage, "Copied")
                  }
                >
                  <CopyIcon />
                  Copy {mode === "source" ? "source" : "usage"}
                </Button>
              </div>
              {mode === "preview" ? (
                <div
                  className={cn("min-h-72 overflow-hidden", "bg-background")}
                >
                  <BlockDemo
                    key={selected}
                    id={selected}
                    title={title}
                    description={description}
                  />
                </div>
              ) : (
                <pre
                  tabIndex={0}
                  className="max-h-[650px] min-h-80 overflow-auto p-6 text-sm leading-7"
                >
                  <code>{mode === "source" ? source : usage}</code>
                </pre>
              )}
            </div>
            {!/^(app|site)-/.test(definition.module) && (
              <div className="mt-5 grid gap-5 rounded-xl border bg-card p-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="block-title">
                    {definition.category === "Navigation" ||
                    definition.category === "Footers"
                      ? "Brand"
                      : "Section heading"}
                  </Label>
                  <Input
                    id="block-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                  />
                </div>
                {definition.category !== "Navigation" &&
                  selected !== "footer-minimal" && (
                    <div className="grid gap-2">
                      <Label htmlFor="block-description">Description</Label>
                      <Input
                        id="block-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={300}
                      />
                    </div>
                  )}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <code className="min-w-0 text-xs break-all sm:text-sm">
                {command}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(command, "Install command copied")}
              >
                <CopyIcon />
                Install block
              </Button>
            </div>
            <p
              role="status"
              className="mt-3 min-h-5 text-sm text-muted-foreground"
            >
              {copied}
            </p>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Sample brands, profiles, quotes, and prices are illustrative.
              Installing a block includes its category module, shared styles,
              and required components. Forms need your own service integration.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
