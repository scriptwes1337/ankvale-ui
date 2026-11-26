import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { previewNames } from "@/lib/preview-names"
import { Playground } from "@/components/playground"

export default async function Page() {
  const directory = path.resolve(
    process.cwd(),
    "../../packages/ui/src/components"
  )
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".tsx"))
    .sort()
  const missing = files.filter(
    (file) => !previewNames.includes(file.replace(/\.tsx$/, ""))
  )
  if (missing.length)
    throw new Error(`Missing component previews: ${missing.join(", ")}`)
  const components = await Promise.all(
    files.map(async (file) => ({
      name: file.replace(/\.tsx$/, ""),
      title: file
        .replace(/\.tsx$/, "")
        .split("-")
        .map((word) =>
          word === "otp"
            ? "OTP"
            : word === "kbd"
              ? "Kbd"
              : word[0]!.toUpperCase() + word.slice(1)
        )
        .join(" "),
      source: await readFile(path.join(directory, file), "utf8"),
    }))
  )
  return <Playground components={components} />
}
