"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import inventory from "../../../docs/expansion/inventory.json"
const Preview = dynamic(
  () => import("./native-previews").then((module) => module.NativePreview),
  {
    ssr: false,
    loading: () => (
      <p className="p-8 text-sm text-muted-foreground">Loading preview…</p>
    ),
  }
)
export function NativePlayground() {
  const [selected, setSelected] = useState("number-stepper")
  useEffect(() => {
    const hash = decodeURIComponent(location.hash.slice(1))
    if (inventory.native.some((item) => item.id === hash)) setSelected(hash)
  }, [])
  function select(name: string) {
    setSelected(name)
    history.replaceState(null, "", `#${name}`)
  }
  const title = (name: string) =>
    name
      .split("-")
      .map((word) => word[0]!.toUpperCase() + word.slice(1))
      .join(" ")
  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <label className="grid gap-2 text-sm md:hidden">
        Component
        <select
          aria-label="Native component"
          value={selected}
          onChange={(event) => select(event.target.value)}
          className="h-10 rounded-md border bg-background px-3"
        >
          {inventory.native.map((item) => (
            <option key={item.id} value={item.id}>
              {title(item.id)}
            </option>
          ))}
        </select>
      </label>
      <nav
        aria-label="Native components"
        className="hidden max-h-[70vh] flex-col gap-1 overflow-auto md:flex"
      >
        {inventory.native.map((item) => (
          <button
            key={item.id}
            onClick={() => select(item.id)}
            aria-current={selected === item.id ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-left text-sm ${selected === item.id ? "bg-accent text-primary" : "hover:bg-muted"}`}
          >
            {title(item.id)}
          </button>
        ))}
      </nav>
      <section>
        <h2 className="mb-5 text-xl font-semibold">{title(selected)}</h2>
        <div className="max-w-xl rounded-xl border bg-white p-6 text-[#191919]">
          <Preview key={selected} name={selected} />
        </div>
        <a
          href={`/docs/native/${selected}`}
          className="mt-4 inline-block text-sm text-primary"
        >
          API reference →
        </a>
        <p className="mt-4 text-xs text-muted-foreground">
          Import from @ankvale/native-ui/components/{selected}
        </p>
      </section>
    </div>
  )
}
