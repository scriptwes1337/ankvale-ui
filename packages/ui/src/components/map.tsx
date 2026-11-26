"use client"
import { useEffect, useRef, useState } from "react"
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl"
import { cn } from "@ankvale/ui/lib/utils"
export type MapMarker = {
  id: string
  longitude: number
  latitude: number
  label: string
  description?: string
  color?: string
}
export type MapProps = {
  /** Serve the version-matched worker installed by the Ankvale registry. Override for a base path or CDN. */
  workerUrl?: string
  mapStyle: string | StyleSpecification
  markers?: MapMarker[]
  center?: [number, number]
  zoom?: number
  height?: number
  label?: string
  className?: string
  onMarkerSelect?: (marker: MapMarker) => void
  onMove?: (view: { center: [number, number]; zoom: number }) => void
  fitMarkers?: boolean
}
const defaultMarkers: MapMarker[] = []
const defaultCenter: [number, number] = [103.851959, 1.29027]
export function Map({
  mapStyle,
  workerUrl = "/ankvale-assets/maplibre-gl-worker.mjs",
  markers = defaultMarkers,
  center = defaultCenter,
  zoom = 11,
  height = 360,
  label = "Map",
  className,
  onMarkerSelect,
  onMove,
  fitMarkers = false,
}: MapProps) {
  const container = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<MapLibreMap | null>(null),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false)
  const callbacks = useRef({ onMarkerSelect, onMove })
  useEffect(() => {
    callbacks.current = { onMarkerSelect, onMove }
  }, [onMarkerSelect, onMove])
  const initial = useRef({ center, zoom })
  useEffect(() => {
    setReady(false)
    setError("")
    let disposed = false
    let instance: MapLibreMap | undefined
    let observer: ResizeObserver | undefined
    void import("maplibre-gl")
      .then((module) => {
        if (disposed || !container.current) return
        try {
          const worker = new URL(workerUrl, window.location.href)
          worker.searchParams.set("v", module.getVersion())
          module.setWorkerUrl(worker.href)
          instance = new module.Map({
            container: container.current,
            style: mapStyle,
            center: initial.current.center,
            zoom: initial.current.zoom,
            attributionControl: { compact: true },
          })
          instance.addControl(new module.NavigationControl(), "top-right")
          instance.on("moveend", () => {
            const position = instance!.getCenter()
            callbacks.current.onMove?.({
              center: [position.lng, position.lat],
              zoom: instance!.getZoom(),
            })
          })
          instance.on("error", () => {
            if (!disposed) setError("Map data could not be loaded.")
          })
          instance.on("load", () => {
            if (!disposed) {
              setError("")
              setReady(true)
            }
          })
          observer = new ResizeObserver(() => instance?.resize())
          observer.observe(container.current)
          setMap(instance)
        } catch {
          setError("Interactive maps require WebGL support.")
        }
      })
      .catch(() => {
        if (!disposed) setError("Map could not be initialized.")
      })
    return () => {
      disposed = true
      observer?.disconnect()
      instance?.remove()
    }
  }, [mapStyle, workerUrl])
  useEffect(() => {
    if (!map) return
    const current = map.getCenter()
    if (
      Math.abs(current.lng - center[0]) > 0.000001 ||
      Math.abs(current.lat - center[1]) > 0.000001 ||
      Math.abs(map.getZoom() - zoom) > 0.001
    )
      map.jumpTo({ center, zoom })
  }, [map, center, zoom])
  useEffect(() => {
    if (!map) return
    let disposed = false
    const rendered: { remove: () => void }[] = []
    void import("maplibre-gl").then((module) => {
      if (disposed) return
      for (const marker of markers) {
        const element = document.createElement("button")
        element.type = "button"
        element.className =
          "flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-primary-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-ring"
        element.setAttribute("aria-label", marker.label)
        element.textContent = "•"
        if (marker.color) element.style.backgroundColor = marker.color
        const popupContent = document.createElement("div"),
          title = document.createElement("strong")
        title.textContent = marker.label
        popupContent.append(title)
        if (marker.description) {
          const description = document.createElement("p")
          description.textContent = marker.description
          popupContent.append(description)
        }
        const popup = new module.Popup({ offset: 18 }).setDOMContent(
          popupContent
        )
        element.addEventListener("click", () =>
          callbacks.current.onMarkerSelect?.(marker)
        )
        rendered.push(
          new module.Marker({ element })
            .setLngLat([marker.longitude, marker.latitude])
            .setPopup(popup)
            .addTo(map)
        )
      }
      if (fitMarkers && markers.length) {
        const bounds = new module.LngLatBounds()
        markers.forEach((marker) =>
          bounds.extend([marker.longitude, marker.latitude])
        )
        map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 0 })
      }
    })
    return () => {
      disposed = true
      rendered.forEach((marker) => marker.remove())
    }
  }, [map, markers, fitMarkers])
  return (
    <section
      data-slot="map"
      data-render-ready={ready}
      aria-label={label}
      className={cn("overflow-hidden rounded-lg border bg-card", className)}
    >
      <div
        ref={container}
        role="region"
        aria-label={`${label} interactive map`}
        style={{ height }}
      />
      {error && (
        <p role="status" className="border-t p-3 text-xs text-muted-foreground">
          {error}
        </p>
      )}
      {markers.length > 0 && (
        <ul
          aria-label="Map locations"
          className="flex flex-wrap gap-2 border-t p-3"
        >
          {markers.map((marker) => (
            <li key={marker.id}>
              <button
                type="button"
                className="rounded border px-2 py-1 text-xs outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  map?.flyTo({
                    center: [marker.longitude, marker.latitude],
                    zoom: Math.max(map.getZoom(), 12),
                    essential: false,
                  })
                  callbacks.current.onMarkerSelect?.(marker)
                }}
              >
                {marker.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
