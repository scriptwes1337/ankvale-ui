import assert from "node:assert/strict"
import { readFile, writeFile, mkdtemp, rm, access } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import { promisify } from "node:util"
import { execFile } from "node:child_process"

/** Compile actual shipped styles, then inspect nested providers in a real browser. */
export async function run() {
  const require = createRequire(path.join(process.cwd(), "package.json"))
  const postcss = require("postcss")
  const tailwind = require("@tailwindcss/postcss")
  const source = path.resolve("packages/ui/src/styles/globals.css")
  const compiled = await postcss([tailwind({ optimize: false })]).process(
    (await readFile(source, "utf8")) +
      '\n@source inline("opacity-100 dark:opacity-50");',
    { from: source }
  )
  assert.match(compiled.css, /@scope\s*\(\.dark\)\s*to\s*\(\.light\)/)
  assert.match(compiled.css, /--ankvale-control-height:\s*initial/)
  const {
    transformCss,
  } = require("@shadcn/registry/internal/updaters/update-css")
  const {
    transformCssVars,
  } = require("@shadcn/registry/internal/updaters/update-css-vars")
  const manifest = JSON.parse(
    await readFile("apps/web/public/r/ankvale-provider.json", "utf8")
  )
  const config = {
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: {
      css: "app/globals.css",
      config: "",
      cssVariables: true,
      prefix: "",
      baseColor: "neutral",
    },
    aliases: { components: "@/components", utils: "@/lib/utils" },
    resolvedPaths: {
      cwd: process.cwd(),
      tailwindCss: path.resolve("app/globals.css"),
    },
  }
  // These are the actual CLI updater helpers, in the order updateCss uses.
  const withVariables = await transformCssVars(
    '@import "tailwindcss" source(none);',
    manifest.cssVars,
    config,
    { tailwindVersion: "v4", overwriteCssVars: true }
  )
  const installed = await transformCss(withVariables, manifest.css)
  assert.match(
    installed,
    /@scope\s*\(\.dark\)\s*to\s*\(\.light\)/,
    "Registry custom variant must survive the real shadcn transformer"
  )
  assert.match(
    installed,
    /--ankvale-control-height:\s*initial/,
    "Registry density reset must be installed"
  )
  assert.match(
    installed,
    /\[data-motion="none"\]/,
    "Registry motion opt-out must be installed"
  )
  const installedCompiled = await postcss([
    tailwind({ optimize: false }),
  ]).process(
    installed +
      '\n@source inline("bg-background dark:bg-card h-9 h-8 opacity-100 dark:opacity-50");',
    { from: path.resolve("installed-provider.css") }
  )
  assert.match(installedCompiled.css, /@scope\s*\(\.dark\)\s*to\s*\(\.light\)/)
  const browser =
    // This standalone, uncached test runner is outside Turbo tasks.
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.ANKVALE_TEST_CHROME ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  try {
    await access(browser)
  } catch {
    console.log(
      "✓ Source and actual shadcn-installed provider styles compile; browser checks require ANKVALE_TEST_CHROME"
    )
    return
  }
  const directory = await mkdtemp(
    path.join(tmpdir(), "ankvale-provider-styles-")
  )
  const probe = (id: string) =>
    `<div id="${id}" class="bg-background dark:bg-card opacity-100 dark:opacity-50">${id}</div>`
  const control = (id: string, size = "h-9") =>
    `<input id="${id}" data-slot="input" class="${size}">`
  const provider = (attrs: string, body: string) =>
    `<div data-slot="ankvale-provider" ${attrs}>${body}</div>`
  const fixture =
    provider(
      'class="dark" data-density="spacious"',
      probe("outer-dark") +
        control("spacious") +
        provider(
          'class="light" data-density="compact"',
          probe("inner-light") +
            control("compact") +
            provider(
              'class="dark" data-density="comfortable"',
              probe("inner-dark") +
                control("comfortable") +
                control("small", "h-8") +
                provider(
                  'class="light" data-density="compact"',
                  probe("deep-light") + control("deep-compact")
                )
            )
        )
    ) +
    provider(
      'class="light" data-density="compact"',
      control("outer-compact") +
        provider('data-density="spacious"', control("inner-spacious"))
    )
  const motionFixture =
    '<div data-motion="none"><div id="motion-none" style="transition: transform 1s; animation: fixture-motion 1s infinite; scroll-behavior: smooth">Motion opt-out</div></div>'
  // Both source and a clean registry installation share one browser invocation.
  // Independent iframe documents prevent either stylesheet masking a missing rule.
  const styleSets = { source: compiled.css, installed: installedCompiled.css }
  const html = `<!doctype html><meta charset="utf-8"><body><script>
const styles = ${JSON.stringify(styleSets).replaceAll("<", "\\u003c")};
const fixture = ${JSON.stringify(fixture + motionFixture)};
const ids = ["outer-dark", "inner-light", "inner-dark", "deep-light", "spacious", "compact", "comfortable", "small", "deep-compact", "outer-compact", "inner-spacious", "motion-none"];
const result = {};
for (const [name, css] of Object.entries(styles)) {
  const frame=document.createElement("iframe"); document.body.append(frame);
  const doc=frame.contentDocument;
  doc.open(); doc.write('<!doctype html><style>'+css+'@keyframes fixture-motion {to {opacity:0.5}}</style>'+fixture); doc.close();
  result[name] = Object.fromEntries(ids.map(id => { const s=frame.contentWindow.getComputedStyle(doc.getElementById(id)); return [id,{opacity:s.opacity,background:s.backgroundColor,height:s.height,minHeight:s.minHeight,animation:s.animationName,transition:s.transitionProperty,scroll:s.scrollBehavior}]; }));
}
const output=document.createElement("pre"); output.id="result"; output.textContent=JSON.stringify(result); document.body.append(output);
</script>`
  try {
    const filename = path.join(directory, "fixture.html")
    await writeFile(filename, html)
    const { stdout } = await promisify(execFile)(
      browser,
      [
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        `--user-data-dir=${path.join(directory, "profile")}`,
        "--dump-dom",
        `file://${filename}`,
      ],
      { maxBuffer: 2_000_000, timeout: 30_000 }
    )
    const json = stdout.match(/<pre id="result">([^<]+)<\/pre>/)?.[1]
    assert.ok(json, "Browser must execute the computed-style fixture")
    const results = JSON.parse(json)
    for (const [name, result] of Object.entries(results) as [
      string,
      Record<
        string,
        {
          opacity: string
          background: string
          height: string
          animation: string
          transition: string
          scroll: string
        }
      >,
    ][]) {
      for (const id of ["outer-dark", "inner-dark"]) {
        assert.equal(result[id].background, "rgb(32, 32, 32)", `${name}:${id}`)
        assert.equal(
          result[id].opacity,
          "0.5",
          `${name}:${id}: dark variant applies`
        )
      }
      for (const id of ["inner-light", "deep-light"]) {
        assert.equal(
          result[id].background,
          "rgb(255, 255, 255)",
          `${name}:${id}`
        )
        assert.equal(
          result[id].opacity,
          "1",
          `${name}:${id}: ancestor dark variant cannot leak through light boundary`
        )
      }
      for (const id of ["compact", "deep-compact", "outer-compact"])
        assert.equal(result[id].height, "32px", id)
      for (const id of ["spacious", "inner-spacious"])
        assert.equal(result[id].height, "44px", id)
      assert.equal(result.comfortable.height, "36px")
      assert.equal(
        result.small.height,
        "32px",
        "Comfortable retains the component size variant"
      )
      assert.equal(
        result["motion-none"]!.animation,
        "none",
        `${name}: motion opt-out stops animation`
      )
      assert.equal(
        result["motion-none"]!.transition,
        "none",
        `${name}: motion opt-out stops transition`
      )
      assert.equal(
        result["motion-none"]!.scroll,
        "auto",
        `${name}: motion opt-out disables smooth scrolling`
      )
    }
    console.log(
      "✓ Source and shadcn-installed CSS preserve nested appearance, nearest density/size resets and motion opt-out in isolated browser documents"
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
