"use client"
import { nativePreviewNames } from "@/lib/native-preview-names"
import { DesignLivePreview } from "./design-live-preview"
import { previewNames } from "@/lib/preview-names"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import {
  createDesignSystem,
  validateDesignSystem,
  exportDesignSystem,
  contrast,
  type DesignSystem,
  type ThemeTokens,
  type DesignExport,
  type BrandImport,
} from "@ankvale/design-system"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ankvale/ui/components/card"
import { Badge } from "@ankvale/ui/components/badge"
import { Skeleton } from "@ankvale/ui/components/skeleton"
const storageKey = "ankvale-design-systems-v1"
const colorLabels = {
  background: "Background",
  foreground: "Text",
  primary: "Primary",
  primaryForeground: "Primary text",
  muted: "Muted background",
  mutedForeground: "Muted text",
  border: "Border",
} as const
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
export function DesignStudio() {
  const [systems, setSystems] = useState<DesignSystem[] | null>(null),
    [current, setCurrent] = useState<DesignSystem | null>(null),
    [past, setPast] = useState<DesignSystem[]>([]),
    [future, setFuture] = useState<DesignSystem[]>([]),
    [mode, setMode] = useState<"light" | "dark">("light"),
    [platform, setPlatform] = useState<"web" | "native">("web"),
    [nativeComponent, setNativeComponent] = useState("number-stepper"),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(""),
    [format, setFormat] = useState<DesignExport>("web-css"),
    [component, setComponent] = useState("button"),
    [slot, setSlot] = useState("button"),
    [slots, setSlots] = useState<string[]>(["button"]),
    [url, setUrl] = useState(""),
    [brand, setBrand] = useState<BrandImport | null>(null),
    [pending, setPending] = useState(false),
    [prompt, setPrompt] = useState(""),
    [proposal, setProposal] = useState<DesignSystem | null>(null),
    [token, setToken] = useState("")
  useEffect(() => {
    let live = true
    setSlot(component)
    setSlots([component])
    void fetch(`/api/components/${component}.json`)
      .then((response) => response.json())
      .then((data) => {
        if (live && Array.isArray(data.slots) && data.slots.length) {
          setSlots(data.slots)
          setSlot(data.slots.includes(component) ? component : data.slots[0])
        }
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [component])
  const revision = useRef("")
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(storageKey) ??
        localStorage.getItem("anchor-design-systems-v1")
      const list = raw ? JSON.parse(raw) : [createDesignSystem()]
      if (!Array.isArray(list) || !list.length)
        throw new Error("No saved systems.")
      const valid = list.map(validateDesignSystem)
      setSystems(valid)
      setCurrent(valid[0]!)
    } catch (e) {
      setError(
        `Could not load saved designs: ${e instanceof Error ? e.message : "invalid data"}. Export a backup before replacing stored data.`
      )
    }
  }, [])
  useEffect(() => {
    if (!systems) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(systems))
      setSaved("Saved in this browser")
    } catch {
      setSaved("")
      setError(
        "Browser storage is unavailable or full. Download JSON to keep your changes."
      )
    }
  }, [systems])
  function select(system: DesignSystem) {
    setCurrent(system)
    setPast([])
    setFuture([])
    setProposal(null)
    setError("")
  }
  function commit(next: DesignSystem, history = true) {
    if (!current || !systems) return
    try {
      const valid = validateDesignSystem({
        ...next,
        updatedAt: new Date().toISOString(),
      })
      if (history) {
        setPast((items) => [...items.slice(-49), current])
        setFuture([])
      }
      setCurrent(valid)
      setSystems((items) =>
        items!.map((item) => (item.id === valid.id ? valid : item))
      )
      setProposal(null)
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid change")
    }
  }
  function updateTokens(patch: Partial<ThemeTokens>) {
    if (current) commit({ ...current, [mode]: { ...current[mode], ...patch } })
  }
  async function request(kind: "brand-import" | "design-agent") {
    if (pending || !current) return
    setPending(true)
    setError("")
    const snapshot = JSON.stringify(current)
    revision.current = snapshot
    try {
      const response = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(
          kind === "brand-import" ? { url } : { system: current, prompt }
        ),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Request failed")
      if (kind === "brand-import") setBrand(result.brand)
      else {
        setProposal(validateDesignSystem(result.system))
        if (result.patch?.mode === "light" || result.patch?.mode === "dark")
          setMode(result.patch.mode)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setPending(false)
    }
  }
  if (!current || !systems)
    return (
      <div className="space-y-4">
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          onClick={() => {
            const system = createDesignSystem()
            setSystems([system])
            setCurrent(system)
          }}
        >
          Create a design system
        </Button>
      </div>
    )
  const tokens = current[mode],
    style = current.components[slot] ?? {},
    preview = proposal ?? current,
    previewTokens = preview[mode]
  const cssVars = {
    "--background": previewTokens.background,
    "--foreground": previewTokens.foreground,
    "--primary": previewTokens.primary,
    "--primary-foreground": previewTokens.primaryForeground,
    "--muted": previewTokens.muted,
    "--muted-foreground": previewTokens.mutedForeground,
    "--border": previewTokens.border,
    "--card": previewTokens.background,
    "--card-foreground": previewTokens.foreground,
    "--radius": `${previewTokens.radius}px`,
    color: previewTokens.foreground,
    background: previewTokens.background,
    fontFamily: previewTokens.fontFamily,
    fontSize: previewTokens.fontSize,
  } as CSSProperties
  const overrides = Object.entries(preview.components)
    .map(
      ([id, value]) =>
        `#design-preview [data-slot="${id}"] {${Object.entries(value)
          .map(
            ([key, n]) =>
              `${({ radius: "border-radius", paddingX: "padding-inline", paddingY: "padding-block", borderWidth: "border-width", fontSize: "font-size" } as Record<string, string>)[key]}:${n}px!important`
          )
          .join(";")}}`
    )
    .join("\n")
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-2 text-sm">
          Saved system
          <select
            className="h-9 rounded-md border bg-background px-3"
            value={current.id}
            onChange={(e) =>
              select(systems.find((s) => s.id === e.target.value)!)
            }
          >
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => {
            const system = createDesignSystem("Untitled")
            setSystems([...systems, system])
            select(system)
          }}
        >
          New
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const clone = {
              ...structuredClone(current),
              id: crypto.randomUUID(),
              name: `${current.name} copy`,
            }
            setSystems([...systems, clone])
            select(clone)
          }}
        >
          Duplicate
        </Button>
        <Button
          variant="outline"
          disabled={!past.length}
          onClick={() => {
            const previous = past.at(-1)!
            setPast(past.slice(0, -1))
            setFuture([current, ...future])
            commit(previous, false)
          }}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          disabled={!future.length}
          onClick={() => {
            setPast([...past, current])
            setFuture(future.slice(1))
            commit(future[0]!, false)
          }}
        >
          Redo
        </Button>
        <span role="status" className="text-xs text-muted-foreground">
          {saved}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <label className="grid gap-2 text-sm">
            Name
            <Input
              value={current.name}
              onChange={(e) => commit({ ...current, name: e.target.value })}
            />
          </label>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                onClick={() => setMode(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <fieldset className="space-y-3">
            <legend className="mb-3 font-medium">Theme variables</legend>
            {Object.entries(colorLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <label className="flex flex-1 items-center justify-between gap-3 text-sm">
                  {label}
                  <input
                    type="color"
                    aria-label={label}
                    value={tokens[key as keyof typeof colorLabels]}
                    disabled={current.locked.includes(`${mode}.${key}`)}
                    onChange={(e) => updateTokens({ [key]: e.target.value })}
                    className="h-8 w-12 cursor-pointer rounded border"
                  />
                </label>
                <button
                  aria-label={`${current.locked.includes(`${mode}.${key}`) ? "Unlock" : "Lock"} ${label}`}
                  aria-pressed={current.locked.includes(`${mode}.${key}`)}
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    const path = `${mode}.${key}`
                    commit({
                      ...current,
                      locked: current.locked.includes(path)
                        ? current.locked.filter((p) => p !== path)
                        : [...current.locked, path],
                    })
                  }}
                >
                  {current.locked.includes(`${mode}.${key}`)
                    ? "Locked"
                    : "Lock"}
                </button>
              </div>
            ))}
            {(
              [
                ["radius", "Corner radius", 0, 32],
                ["spacing", "Spacing unit", 2, 12],
                ["fontSize", "Font size", 12, 24],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className="grid gap-1 text-sm">
                {label}: {tokens[key]}px
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={tokens[key]}
                  onChange={(e) =>
                    updateTokens({ [key]: Number(e.target.value) })
                  }
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm">
              Font family
              <Input
                value={tokens.fontFamily}
                onChange={(e) => updateTokens({ fontFamily: e.target.value })}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Text contrast{" "}
              {contrast(tokens.foreground, tokens.background).toFixed(2)}:1 ·
              Button contrast{" "}
              {contrast(tokens.primaryForeground, tokens.primary).toFixed(2)}:1
            </p>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-3 font-medium">Component styles</legend>
            <label className="grid gap-2 text-sm">
              Component
              <select
                className="h-9 rounded border bg-background px-3"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
              >
                {previewNames.map((id) => (
                  <option key={id}>{id}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Target slot
              <select
                className="h-9 rounded border bg-background px-3"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              >
                {slots.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            {(
              [
                ["radius", "Radius", 0, 32],
                ["paddingX", "Horizontal padding", 0, 40],
                ["paddingY", "Vertical padding", 0, 24],
                ["borderWidth", "Border width", 0, 4],
                ["fontSize", "Text size", 12, 24],
              ] as const
            ).map(([key, label, min, max]) => (
              <label className="grid gap-1 text-sm" key={key}>
                {label}: {style[key] ?? "Default"}
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={
                    style[key] ??
                    (key === "fontSize"
                      ? 14
                      : key === "radius"
                        ? tokens.radius
                        : 0)
                  }
                  onChange={(e) =>
                    commit({
                      ...current,
                      components: {
                        ...current.components,
                        [slot]: {
                          ...style,
                          [key]: Number(e.target.value),
                        },
                      },
                    })
                  }
                />
              </label>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const components = { ...current.components }
                delete components[slot]
                commit({ ...current, components })
              }}
            >
              Reset component
            </Button>
          </fieldset>
        </div>
        <div className="space-y-6">
          <section
            id="design-preview"
            className="rounded-xl border p-8"
            style={cssVars}
          >
            <style>{overrides}</style>
            <div style={{ display: "grid", gap: previewTokens.spacing * 6 }}>
              <div>
                <h2 className="text-2xl font-semibold">Project settings</h2>
                <p
                  style={{ color: previewTokens.mutedForeground, marginTop: 8 }}
                >
                  Manage your project and team.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Website redesign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <label className="grid gap-2 text-sm">
                    Project name
                    <Input defaultValue="Website redesign" />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button>Save changes</Button>
                    <Button variant="outline">Cancel</Button>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            </div>
          </section>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={platform === "web" ? "default" : "outline"}
              onClick={() => setPlatform("web")}
            >
              Web
            </Button>
            <Button
              variant={platform === "native" ? "default" : "outline"}
              onClick={() => setPlatform("native")}
            >
              Native
            </Button>
            {platform === "native" && (
              <label className="flex items-center gap-2 text-sm">
                Native component
                <select
                  className="h-9 rounded border bg-background px-2"
                  value={nativeComponent}
                  onChange={(e) => setNativeComponent(e.target.value)}
                >
                  {nativePreviewNames.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {platform === "native" && (
            <p className="text-xs text-muted-foreground">
              Native preview applies colors and radius. Component CSS applies to
              web.
            </p>
          )}
          <DesignLivePreview
            system={preview}
            mode={mode}
            component={platform === "native" ? nativeComponent : component}
            platform={platform}
          />
          {proposal && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm">Agent proposal is shown in the preview.</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (JSON.stringify(current) !== revision.current) {
                      setError(
                        "The design changed while the agent was working. Generate a fresh proposal."
                      )
                      return
                    }
                    commit(proposal)
                  }}
                >
                  Apply proposal
                </Button>
                <Button variant="outline" onClick={() => setProposal(null)}>
                  Discard
                </Button>
              </div>
            </div>
          )}
          <section className="space-y-4 rounded-xl border p-6">
            <h2 className="font-semibold">Brand</h2>
            {(
              ["website", "description", "audience", "tone", "logo"] as const
            ).map((key) => (
              <label className="grid gap-2 text-sm" key={key}>
                {key}
                <Input
                  value={current.brand[key]}
                  onChange={(e) =>
                    commit({
                      ...current,
                      brand: { ...current.brand, [key]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm">
              Design guidance
              <textarea
                className="min-h-24 rounded-md border bg-background p-3"
                value={current.guidance}
                onChange={(e) =>
                  commit({ ...current, guidance: e.target.value })
                }
              />
            </label>
            <h3 className="text-sm font-medium">Assets</h3>
            {current.brand.assets.map((asset, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {asset.name}: {asset.url}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    commit({
                      ...current,
                      brand: {
                        ...current.brand,
                        assets: current.brand.assets.filter(
                          (_, index) => index !== i
                        ),
                      },
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                commit({
                  ...current,
                  brand: {
                    ...current.brand,
                    assets: [
                      ...current.brand.assets,
                      { name: "Asset", url: "https://" },
                    ],
                  },
                })
              }
            >
              Add asset
            </Button>
            {current.brand.assets.length > 0 && (
              <div className="grid gap-2">
                {current.brand.assets.map((asset, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <Input
                      aria-label={`Asset ${i + 1} name`}
                      value={asset.name}
                      onChange={(e) =>
                        commit({
                          ...current,
                          brand: {
                            ...current.brand,
                            assets: current.brand.assets.map((a, index) =>
                              index === i ? { ...a, name: e.target.value } : a
                            ),
                          },
                        })
                      }
                    />
                    <Input
                      aria-label={`Asset ${i + 1} URL`}
                      value={asset.url}
                      onChange={(e) =>
                        commit({
                          ...current,
                          brand: {
                            ...current.brand,
                            assets: current.brand.assets.map((a, index) =>
                              index === i ? { ...a, url: e.target.value } : a
                            ),
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="space-y-3 rounded-xl border p-6">
            <h2 className="font-semibold">Import website branding</h2>
            <label className="grid gap-2 text-sm">
              Website URL
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
            <Button
              variant="outline"
              disabled={pending || !url}
              onClick={() => request("brand-import")}
            >
              {pending ? "Working…" : "Extract brand"}
            </Button>
            {brand && (
              <div className="space-y-3 rounded border p-4">
                <p className="font-medium">{brand.name}</p>
                <p className="text-sm text-muted-foreground">
                  {brand.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {brand.colors.map((color) => (
                    <button
                      key={color}
                      title={`Set primary to ${color}`}
                      aria-label={`Set primary to ${color}`}
                      onClick={() => updateTokens({ primary: color })}
                      className="size-8 rounded border"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <p className="text-xs">
                  {brand.fonts.join(" · ") ||
                    "No static font declarations found."}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    commit({
                      ...current,
                      name: brand.name,
                      brand: {
                        ...current.brand,
                        website: brand.website,
                        description: brand.description,
                        logo: brand.logo,
                      },
                    })
                    setBrand(null)
                  }}
                >
                  Apply brand details
                </Button>
              </div>
            )}
          </section>
          <section className="space-y-3 rounded-xl border p-6">
            <h2 className="font-semibold">Ask the design agent</h2>
            <label className="grid gap-2 text-sm">
              Instruction
              <textarea
                className="min-h-20 rounded-md border bg-background p-3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Use more compact spacing"
              />
            </label>
            <Button
              disabled={pending || !prompt.trim()}
              onClick={() => request("design-agent")}
            >
              {pending ? "Working…" : "Generate proposal"}
            </Button>
            <details>
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Studio access token
              </summary>
              <Input
                type="password"
                aria-label="Studio access token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
              />
            </details>
          </section>
          <section className="space-y-3 rounded-xl border p-6">
            <h2 className="font-semibold">Export</h2>
            <label className="grid gap-2 text-sm">
              Format
              <select
                className="h-9 rounded border bg-background px-3"
                value={format}
                onChange={(e) => setFormat(e.target.value as DesignExport)}
              >
                {(
                  [
                    "web-css",
                    "native-theme",
                    "design-md",
                    "product-md",
                    "json",
                  ] as const
                ).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <pre className="max-h-64 overflow-auto rounded bg-muted p-4 text-xs">
              {exportDesignSystem(current, format)}
            </pre>
            <Button
              variant="outline"
              onClick={() =>
                download(
                  {
                    "web-css": "ankvale-theme.css",
                    "native-theme": "ankvale-native-theme.json",
                    "design-md": "DESIGN.md",
                    "product-md": "PRODUCT.md",
                    json: "ankvale-design-system.json",
                  }[format],
                  exportDesignSystem(current, format)
                )
              }
            >
              Download
            </Button>
            <label className="block text-sm">
              Import design JSON
              <input
                type="file"
                accept="application/json,.json"
                className="mt-2 block text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    if (file.size > 1000000)
                      throw new Error("File exceeds 1 MB.")
                    const imported = validateDesignSystem(
                      JSON.parse(await file.text())
                    )
                    const clone = { ...imported, id: crypto.randomUUID() }
                    setSystems([...systems, clone])
                    select(clone)
                  } catch (error) {
                    setError(
                      error instanceof Error ? error.message : "Import failed"
                    )
                  }
                }}
              />
            </label>
          </section>
        </div>
      </div>
    </div>
  )
}
