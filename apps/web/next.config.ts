import type { NextConfig } from "next"
import path from "node:path"
import { fileURLToPath } from "node:url"

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../.."
  ),
  transpilePackages: [
    "@ankvale/ui",
    "@ankvale/design-system",
    "@ankvale/native-ui",
    "react-native-web",
    "react-native-svg",
  ],
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
      "react-native-svg": "./lib/native-svg.web.tsx",
    },
  },
}

export default nextConfig
