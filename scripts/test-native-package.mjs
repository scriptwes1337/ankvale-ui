import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  symlink,
  rm,
} from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import ts from "typescript"
const root = process.cwd(),
  directory = await mkdtemp(path.join(root, ".cache-native-consumer-"))
try {
  const result = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "--workspace",
        "@ankvale/native-ui",
        "--pack-destination",
        directory,
        "--json",
      ],
      { cwd: root, encoding: "utf8" }
    )
  )
  const files = result[0].files.map((f) => f.path)
  if (
    !files.includes("src/index.ts") ||
    !files.includes("src/theme.tsx") ||
    files.some((file) => file.includes("node_modules"))
  )
    throw new Error("Incomplete package output")
  const modules = path.join(directory, "node_modules")
  await mkdir(path.join(modules, "@ankvale"), { recursive: true })
  const target = path.join(modules, "@ankvale/native-ui")
  await mkdir(target)
  execFileSync("tar", [
    "-xzf",
    path.join(directory, result[0].filename),
    "-C",
    target,
    "--strip-components=1",
  ])
  const require = createRequire(
    path.join(root, "packages/native-ui/package.json")
  )
  const nativePackage = path.dirname(
    require.resolve("react-native/package.json")
  )
  await symlink(nativePackage, path.join(modules, "react-native"), "dir")
  const entry = path.join(directory, "app.tsx")
  await writeFile(
    entry,
    'import { AnkvaleProvider,NumberStepper,DatePicker,LineChart } from "@ankvale/native-ui"; export const App=()=> <AnkvaleProvider><NumberStepper defaultValue={2}/><DatePicker defaultValue="2026-11-26"/><LineChart label="Revenue" data={[{month:"Jan",value:2}]} xKey="month" series={[{key:"value"}]}/></AnkvaleProvider>'
  )
  const program = ts.createProgram([entry], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    esModuleInterop: true,
    lib: ["lib.es2022.d.ts"],
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (f) => f,
        getNewLine: () => "\n",
      })
    )
    process.exitCode = 1
  } else
    console.log(
      `✓ packed native package (${files.length} files) resolves and type-checks from consumer imports`
    )
} finally {
  await rm(directory, { recursive: true, force: true })
}
