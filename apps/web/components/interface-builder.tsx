"use client"
import { useEffect, useState } from "react"
import {
  validateInterface,
  exportInterface,
  type InterfaceDocument,
  type InterfaceNode,
} from "@ankvale/design-system"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
import { Card, CardContent } from "@ankvale/ui/components/card"
import { Badge } from "@ankvale/ui/components/badge"
import { Separator } from "@ankvale/ui/components/separator"
const types: InterfaceNode["type"][] = [
  "heading",
  "text",
  "button",
  "input",
  "card",
  "separator",
  "badge",
]
const initial: InterfaceDocument = {
  version: 1,
  name: "Project settings",
  layout: "stack",
  nodes: [
    { id: "title", type: "heading", text: "Project settings" },
    { id: "description", type: "text", text: "Manage your project and team." },
    {
      id: "name",
      type: "input",
      text: "Website redesign",
      label: "Project name",
    },
    { id: "save", type: "button", text: "Save changes" },
  ],
}
export function InterfaceBuilder() {
  const [doc, setDoc] = useState(initial),
    [selected, setSelected] = useState("title"),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [past, setPast] = useState<InterfaceDocument[]>([]),
    [future, setFuture] = useState<InterfaceDocument[]>([]),
    [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("ankvale-interface-v1") ??
        localStorage.getItem("anchor-interface-v1")
      if (raw) setDoc(validateInterface(JSON.parse(raw)))
    } catch {
      setError(
        "Could not load the saved interface. The saved data has been preserved."
      )
      return
    }
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem("ankvale-interface-v1", JSON.stringify(doc))
    } catch {
      setError("Browser storage is unavailable. Download your work.")
    }
  }, [doc, loaded])
  function commit(next: InterfaceDocument) {
    try {
      const valid = validateInterface(next)
      setPast([...past.slice(-49), doc])
      setFuture([])
      setDoc(valid)
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid interface")
    }
  }
  function update(patch: Partial<InterfaceNode>) {
    commit({
      ...doc,
      nodes: doc.nodes.map((n) => (n.id === selected ? { ...n, ...patch } : n)),
    })
  }
  function move(id: string, delta: number) {
    const index = doc.nodes.findIndex((n) => n.id === id),
      target = index + delta
    if (target < 0 || target >= doc.nodes.length) return
    const nodes = [...doc.nodes]
    ;[nodes[index], nodes[target]] = [nodes[target]!, nodes[index]!]
    commit({ ...doc, nodes })
  }
  const node = doc.nodes.find((n) => n.id === selected)
  const source = exportInterface(doc)
  function download(name: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={!past.length}
          onClick={() => {
            setFuture([doc, ...future])
            setDoc(past.at(-1)!)
            setPast(past.slice(0, -1))
          }}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          disabled={!future.length}
          onClick={() => {
            setPast([...past, doc])
            setDoc(future[0]!)
            setFuture(future.slice(1))
          }}
        >
          Redo
        </Button>
        <label className="flex items-center gap-2 text-sm">
          Layout
          <select
            className="h-9 rounded border bg-background px-2"
            value={doc.layout}
            onChange={(e) =>
              commit({
                ...doc,
                layout: e.target.value as InterfaceDocument["layout"],
              })
            }
          >
            <option value="stack">Stack</option>
            <option value="two-column">Two columns</option>
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => setDevice(device === "desktop" ? "mobile" : "desktop")}
        >
          {device === "desktop" ? "Mobile preview" : "Desktop preview"}
        </Button>
        <Button onClick={() => download("page.tsx", source)}>Export TSX</Button>
        <Button
          variant="outline"
          onClick={() =>
            download("interface.json", JSON.stringify(doc, null, 2))
          }
        >
          Export JSON
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-semibold">Add component</h2>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const id = crypto.randomUUID()
                    commit({
                      ...doc,
                      nodes: [
                        ...doc.nodes,
                        {
                          id,
                          type,
                          text:
                            type === "separator"
                              ? ""
                              : type === "input"
                                ? "Enter a value"
                                : type === "button"
                                  ? "Continue"
                                  : type === "heading"
                                    ? "New section"
                                    : type === "badge"
                                      ? "Draft"
                                      : "Your content",
                        },
                      ],
                    })
                    setSelected(id)
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold">Layers</h2>
            {doc.nodes.map((n, i) => (
              <div key={n.id} className="flex items-center gap-1">
                <button
                  aria-pressed={selected === n.id}
                  onClick={() => setSelected(n.id)}
                  className={`min-w-0 flex-1 truncate rounded px-2 py-2 text-left text-sm ${selected === n.id ? "bg-accent text-primary" : "hover:bg-muted"}`}
                >
                  {n.type}: {n.text || "Separator"}
                </button>
                <button
                  aria-label={`Move ${n.type} up`}
                  disabled={i === 0}
                  onClick={() => move(n.id, -1)}
                  className="px-2 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  aria-label={`Move ${n.type} down`}
                  disabled={i === doc.nodes.length - 1}
                  onClick={() => move(n.id, 1)}
                  className="px-2 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            ))}
          </section>
          {node && (
            <section className="space-y-3">
              <h2 className="font-semibold">Properties</h2>
              <label className="grid gap-2 text-sm">
                Content
                <textarea
                  className="min-h-20 rounded border bg-background p-2"
                  value={node.text}
                  onChange={(e) => update({ text: e.target.value })}
                />
              </label>
              {node.type === "input" && (
                <label className="grid gap-2 text-sm">
                  Label
                  <Input
                    value={node.label ?? ""}
                    onChange={(e) => update({ label: e.target.value })}
                  />
                </label>
              )}
              {["button", "badge"].includes(node.type) && (
                <label className="grid gap-2 text-sm">
                  Variant
                  <select
                    className="h-9 rounded border bg-background px-2"
                    value={
                      node.variant ??
                      (node.type === "badge" ? "secondary" : "default")
                    }
                    onChange={(e) =>
                      update({
                        variant: e.target.value as InterfaceNode["variant"],
                      })
                    }
                  >
                    {["default", "outline", "secondary"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  commit({
                    ...doc,
                    nodes: doc.nodes.filter((n) => n.id !== node.id),
                  })
                }
              >
                Remove component
              </Button>
            </section>
          )}
          <label className="block text-sm">
            Import JSON
            <input
              type="file"
              accept=".json,application/json"
              className="mt-2 max-w-full text-xs"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  if (file.size > 250000)
                    throw new Error("File exceeds 250 KB.")
                  commit(validateInterface(JSON.parse(await file.text())))
                } catch (error) {
                  setError(
                    error instanceof Error ? error.message : "Import failed"
                  )
                }
              }}
            />
          </label>
          {!loaded && (
            <Button variant="outline" onClick={() => setLoaded(true)}>
              Start with a new interface
            </Button>
          )}
        </aside>
        <div className="space-y-6">
          <section
            aria-label="Interface preview"
            className={`mx-auto w-full rounded-xl border p-8 ${device === "mobile" ? "max-w-[390px]" : ""}`}
          >
            <div
              className={
                doc.layout === "two-column"
                  ? "grid items-start gap-6 sm:grid-cols-2"
                  : "flex flex-col items-start gap-6"
              }
            >
              {doc.nodes.map((n) => (
                <div
                  key={n.id}
                  className={`max-w-full ${n.type === "input" || n.type === "separator" ? "w-full" : ""}`}
                >
                  {n.type === "heading" ? (
                    <h1 className="text-3xl font-semibold tracking-tight">
                      {n.text}
                    </h1>
                  ) : n.type === "text" ? (
                    <p className="text-muted-foreground">{n.text}</p>
                  ) : n.type === "button" ? (
                    <Button variant={n.variant ?? "default"}>{n.text}</Button>
                  ) : n.type === "input" ? (
                    <label className="grid gap-2 text-sm">
                      <span>{n.label ?? n.text}</span>
                      <Input placeholder={n.text} />
                    </label>
                  ) : n.type === "card" ? (
                    <Card>
                      <CardContent className="p-6">{n.text}</CardContent>
                    </Card>
                  ) : n.type === "badge" ? (
                    <Badge variant={n.variant ?? "secondary"}>{n.text}</Badge>
                  ) : (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </section>
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Generated code
            </summary>
            <pre className="mt-3 max-h-[480px] overflow-auto rounded-lg bg-muted p-4 text-xs">
              {source}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
