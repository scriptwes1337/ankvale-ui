import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
