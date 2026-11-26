import { lookup } from "node:dns/promises"
import { request as httpsRequest } from "node:https"
import { request as httpRequest } from "node:http"
import { isIP } from "node:net"
export function isPublicAddress(address: string) {
  if (isIP(address) === 4) {
    const p = address.split(".").map(Number)
    return !(
      p[0] === 0 ||
      p[0] === 10 ||
      p[0] === 127 ||
      p[0]! >= 224 ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1]! >= 16 && p[1]! <= 31) ||
      (p[0] === 192 && (p[1] === 168 || p[1] === 0)) ||
      (p[0] === 100 && p[1]! >= 64 && p[1]! <= 127) ||
      (p[0] === 198 && (p[1] === 18 || p[1] === 19))
    )
  }
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase()
    return normalized.startsWith("2") || normalized.startsWith("3")
  }
  return false
}
export async function fetchPublicWebsite(
  input: string,
  redirects = 0
): Promise<{ text: string; url: string }> {
  if (redirects > 3) throw new Error("Too many redirects.")
  const url = new URL(input)
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    throw new Error("Use a public HTTP or HTTPS website.")
  const host = url.hostname.replace(/^\[|\]$/g, "")
  const addresses = isIP(host)
    ? [{ address: host, family: isIP(host) }]
    : await lookup(host, { all: true })
  if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address)))
    throw new Error("Only public website addresses are supported.")
  const chosen = addresses[0]!
  return new Promise((resolve, reject) => {
    const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      {
        family: chosen.family,
        headers: {
          "user-agent": "AnkvaleUI-BrandImporter/1.0",
          accept: "text/html,text/css",
          "accept-encoding": "identity",
        },
        lookup: (_host, _options, callback) =>
          callback(null, chosen.address, chosen.family),
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume()
          fetchPublicWebsite(
            new URL(response.headers.location, url).href,
            redirects + 1
          ).then(resolve, reject)
          return
        }
        if (response.statusCode !== 200) {
          response.resume()
          reject(new Error(`Website returned ${response.statusCode}.`))
          return
        }
        const contentType = response.headers["content-type"] ?? ""
        if (!/text\/(html|css|plain)/.test(contentType)) {
          response.resume()
          reject(new Error("Website must return HTML or CSS."))
          return
        }
        let bytes = 0
        const chunks: Buffer[] = []
        response.on("data", (chunk: Buffer) => {
          bytes += chunk.length
          if (bytes > 1_000_000) {
            response.destroy()
            reject(new Error("Website exceeds the 1 MB import limit."))
          } else chunks.push(chunk)
        })
        response.on("end", () =>
          resolve({
            text: Buffer.concat(chunks).toString("utf8"),
            url: url.href,
          })
        )
        response.on("error", reject)
      }
    )
    req.setTimeout(10000, () => req.destroy(new Error("Website timed out.")))
    req.on("error", reject)
    req.end()
  })
}
