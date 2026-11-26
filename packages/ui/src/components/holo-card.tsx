"use client"
import { useState, type ComponentProps } from "react"
import { cn } from "@ankvale/ui/lib/utils"
/** Pointer tilt without glass, gradients, or altering Ankvale's surface colors. */
export function HoloCard({
  className,
  style,
  children,
  ...props
}: ComponentProps<"div">) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  return (
    <div
      data-slot="holo-card"
      className={cn(
        "rounded-xl border bg-card p-6 transition-transform duration-150 motion-reduce:transform-none!",
        className
      )}
      style={{
        ...style,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return
        const rect = e.currentTarget.getBoundingClientRect()
        setTilt({
          x: (-(e.clientY - rect.top - rect.height / 2) / rect.height) * 6,
          y: ((e.clientX - rect.left - rect.width / 2) / rect.width) * 6,
        })
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      {...props}
    >
      {children}
    </div>
  )
}
