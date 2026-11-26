"use client"
// Web-only adapter for the SVG primitives used by Ankvale Native previews.
// Device builds continue to use react-native-svg directly.
import { forwardRef, type ComponentProps } from "react"
export const Circle = forwardRef<SVGCircleElement, ComponentProps<"circle">>(
  (props, ref) => <circle {...props} ref={ref} />
)
export const Path = forwardRef<SVGPathElement, ComponentProps<"path">>(
  (props, ref) => <path {...props} ref={ref} />
)
export const Line = forwardRef<SVGLineElement, ComponentProps<"line">>(
  (props, ref) => <line {...props} ref={ref} />
)
export const Rect = forwardRef<SVGRectElement, ComponentProps<"rect">>(
  (props, ref) => <rect {...props} ref={ref} />
)
export const Polygon = forwardRef<SVGPolygonElement, ComponentProps<"polygon">>(
  (props, ref) => <polygon {...props} ref={ref} />
)
export const Text = forwardRef<SVGTextElement, ComponentProps<"text">>(
  (props, ref) => <text {...props} ref={ref} />
)
const Svg = forwardRef<SVGSVGElement, ComponentProps<"svg">>((props, ref) => (
  <svg {...props} ref={ref} />
))
export default Svg
