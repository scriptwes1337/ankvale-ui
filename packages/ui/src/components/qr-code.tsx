"use client"
import QRCodeGenerator from "qrcode"
import { useMemo, useRef } from "react"
import { Button } from "@ankvale/ui/components/button"
export function QRCode({
  value,
  label,
  size = 180,
  status = "active",
  onRefresh,
  download = false,
}: {
  value: string
  label: string
  size?: number
  status?: "active" | "expired" | "loading"
  onRefresh?: () => void
  download?: boolean
}) {
  const svg = useRef<SVGSVGElement>(null)
  const result = useMemo(() => {
    try {
      if (!value) return null
      return QRCodeGenerator.create(value, { errorCorrectionLevel: "M" })
    } catch {
      return null
    }
  }, [value])
  if (status !== "active")
    return (
      <div
        data-slot="qr-code"
        role="status"
        className="flex flex-col items-center gap-3 rounded-lg border p-6"
      >
        <p className="text-sm">
          {status === "loading" ? "Generating code…" : "Code expired"}
        </p>
        {status === "expired" && onRefresh && (
          <Button type="button" variant="outline" onClick={onRefresh}>
            Refresh code
          </Button>
        )}
      </div>
    )
  if (!result)
    return <p role="alert">Cannot generate QR code for this value.</p>
  const n = result.modules.size
  let path = ""
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (result.modules.get(y, x)) path += `M${x + 4} ${y + 4}h1v1h-1z`
  return (
    <figure
      data-slot="qr-code"
      className="inline-flex flex-col items-center gap-3"
    >
      <svg
        ref={svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${n + 8} ${n + 8}`}
        width={size}
        height={size}
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
        className="max-w-full"
      >
        <title>{label}</title>
        <rect width={n + 8} height={n + 8} fill="white" />
        <path d={path} fill="black" />
      </svg>
      {download && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (!svg.current) return
            const blob = new Blob([svg.current.outerHTML], {
              type: "image/svg+xml",
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "qr-code.svg"
            a.click()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          }}
        >
          Download SVG
        </Button>
      )}
    </figure>
  )
}
