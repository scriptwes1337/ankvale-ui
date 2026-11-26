import Image from "next/image"
import { cn } from "@ankvale/ui/lib/utils"

/** Decorative beside the wordmark; the enclosing link supplies its name. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/ankvale-ui-mark-small.png"
      alt=""
      width={128}
      height={56}
      unoptimized
      className={cn("h-auto w-9 shrink-0", className)}
    />
  )
}
