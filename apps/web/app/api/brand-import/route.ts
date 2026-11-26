import { extractBrand } from "@ankvale/design-system"
import { fetchPublicWebsite } from "@/lib/public-website"
import { authorizeStudio } from "@/lib/studio-request"
export async function POST(request: Request) {
  if (!authorizeStudio(request))
    return Response.json(
      { error: "Studio authorization is required." },
      { status: 401 }
    )
  try {
    const raw = await request.text()
    if (raw.length > 4000) throw new Error("Request too large.")
    const body = JSON.parse(raw)
    if (typeof body.url !== "string" || body.url.length > 2000)
      throw new Error("Enter a website URL.")
    const page = await fetchPublicWebsite(body.url)
    const links = (page.text.match(/<link\b[^>]*>/gi) ?? [])
      .filter((tag) => /rel=["']stylesheet["']/i.test(tag))
      .map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1])
      .filter((value): value is string => !!value)
      .map((value) => new URL(value, page.url))
      .filter((url) => url.origin === new URL(page.url).origin)
      .slice(0, 3)
    const styles = await Promise.allSettled(
      links.map((url) => fetchPublicWebsite(url.href))
    )
    const css = styles
      .filter(
        (r): r is PromiseFulfilledResult<{ text: string; url: string }> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value.text)
      .join("\n")
    return Response.json({
      brand: extractBrand(page.text, page.url, css),
      note: "Static HTML and up to three same-origin stylesheets. Review extracted values before applying.",
    })
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not import website.",
      },
      { status: 400 }
    )
  }
}
