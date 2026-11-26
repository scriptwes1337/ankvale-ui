# Ankvale authoring tools

Run the web app and open `/design` to create a design system. Themes save in the browser's local storage, including light/dark variables, selected component overrides, brand fields, assets, guidance, and locks. Undo/redo retains up to 50 edits for the selected system. Export JSON for portable backups; browser storage is not a cloud account or cross-device sync.

`/builder` creates editable component arrangements and exports TSX or JSON. Its exported UI uses consumer shadcn paths (`@/components/ui/*`). Connect its actions to application behavior. Current builder blocks are heading, text, button, input, card, separator, and badge; it is not a complete arbitrary React editor.

## Website branding

The editor's importer reads a public HTTP(S) URL and up to three same-origin stylesheets. It extracts static title, description, icon URL, six-digit colors, and font declarations. JavaScript-generated computed styles and assets behind authentication are not extracted. Imported values appear for review and never replace the whole theme automatically. Requests use pinned public DNS addresses, bounded responses, redirect validation, and timeouts.

In development, import and agent endpoints accept same-origin requests. In production, set `ANKVALE_STUDIO_TOKEN` and enter that token in the editor's access-token field. A production deployment without this token disables these server actions. Keep the studio private to trusted editors; saved local designs remain available without server actions.

## Design agent

Configure server-only `AI_GATEWAY_API_KEY` and `ANKVALE_DESIGN_MODEL` (a currently available `provider/model` ID). The editor requests a structured patch through the installed AI SDK. Review its proposal before applying; locked values are preserved and stale proposals are rejected. This transmits the current system and instruction to the configured model provider. No credentials are stored by the editor.

The initial agent supports theme tokens, component-slot overrides, brand fields, asset URL metadata, and guidance. Website tool calling and asset image generation are not yet supported. Live provider verification requires configured credentials; validation and patch handling have automated coverage.

## MCP

Generate catalog output with `npm run registry:build`. Configure a local stdio MCP client:

```json
{
  "mcpServers": {
    "ankvale-ui": {
      "command": "node",
      "args": ["/absolute/path/to/ankvale-ui/scripts/run-mcp.mjs"],
      "env": {
        "ANKVALE_UI_ROOT": "/absolute/path/to/ankvale-ui",
        "ANKVALE_DESIGN_SYSTEMS_DIR": "/absolute/path/to/design-systems"
      }
    }
  }
}
```

The ten read-only tools list components, read source/API docs, read registry items, read templates, list saved designs, fetch manifests, and export designs. The additional discovery tools recommend task patterns, list blocks, and return design/selection/motion guides. The server has no remote HTTP listener or write tools. Export JSON from `/design` into the configured directory using lowercase names such as `ankvale.json`; this is an explicit portable snapshot, not a live browser-storage link.

## Agent skills

Copy `skills/ankvale-code` and `skills/ankvale-design` into your coding agent's skill directory, or link them into a project's supported skill location. Both have validated frontmatter. They are shipped with this library and are not installed into your personal agent configuration automatically.


The downloadable skill ZIPs include their referenced guides. The agent guide ZIP contains an AGENTS.md entry point and adjacent references; keep the directory intact and add a pointer from the consuming project’s instructions. Public discovery is available at `/llms.txt`, `/api/patterns.json`, `/api/blocks.json`, and `/api/guides/*.md`.
