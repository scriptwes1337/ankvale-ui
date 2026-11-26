<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Ankvale UI work

Ankvale is intended for coding agents as well as people. Read `docs/agents/AGENTS.md` for the workflow, `docs/agents/component-selection.md` before composing screens, `docs/agents/design-guide.md` for styling, and `docs/agents/motion-guide.md` for animation changes. `docs/agents/patterns.json` maps tasks to actual registry IDs. Prefer a suitable template or block before assembling an equivalent composition from primitives.

Preserve Ankvale's sole Notion-inspired language: white surfaces, neutral borders, Bootstrap blue primary, concise copy, no gradients or glass. Use semantic tokens and keep reduced-motion and keyboard behavior intact. Source and generated API docs take precedence over guessed shadcn/HeroUI props.

After changing a component or block, run `npm run registry:build`, relevant interaction tests, type checks and lint. Verify consuming-project imports when distribution changes. Use `npm run test:agent-guides` for catalog, packaged-guide and motion behavior checks. Do not claim device correctness from React Native Web previews.
