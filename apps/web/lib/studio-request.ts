import { timingSafeEqual } from "node:crypto"
export function authorizeStudio(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) return false
  if (process.env.NODE_ENV !== "production") return true
  const token = process.env.ANKVALE_STUDIO_TOKEN
  const given =
    request.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""
  if (!token || !given) return false
  const a = Buffer.from(token),
    b = Buffer.from(given)
  return a.length === b.length && timingSafeEqual(a, b)
}
