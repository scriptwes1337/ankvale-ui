import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "@ankvale/ui/globals.css"
import { AnkvaleProvider } from "@ankvale/ui/components/ankvale-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@ankvale/ui/lib/utils"

export const metadata: Metadata = {
  title: "Ankvale UI — React frontend system",
  description:
    "A React frontend system by Ankvale Labs with components, blocks, templates, animations, icons and graphics for people and coding agents.",
  applicationName: "Ankvale UI",
  authors: [{ name: "Ankvale Labs", url: "https://www.ankvalelabs.com" }],
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AnkvaleProvider>{children}</AnkvaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
