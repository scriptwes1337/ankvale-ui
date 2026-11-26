import type { Metadata } from "next"
import { StudioExample } from "@/components/studio-example"
export const metadata: Metadata = {
  title: "Forma — An Ankvale UI concept website",
  description:
    "A complete website assembled from reusable Ankvale blocks. Clean default styling throughout. All content is illustrative.",
}
export default function Page() {
  return <StudioExample />
}
