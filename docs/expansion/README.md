# Ankvale expansion

The inventory tracks the complete public HeroUI Pro comparison: 69 web families, five application templates, 53 native families, and supporting tools. Existing components are baseline equivalents, not a claim of variant parity.

A new item is complete only after its behavior, preview, documentation, registry/package distribution, and relevant checks are implemented. Pending items remain explicit.

Work order: shared web controls and data presentation; data grid and application shell; editing and scheduling; AI interfaces and charts; application templates; native package; design and agent tooling.

Reference behavior comes from the source URLs recorded on each inventory item. Ankvale retains its own API, implementation, and visual language.

## Map worker

The Map registry includes `public/ankvale-assets/maplibre-gl-worker.mjs` and pins its MapLibre dependency to the same installed version. Keep that asset with the component. Pass `workerUrl` when serving it under a base path or another asset host. Regenerate the registry after updating MapLibre so the worker and library remain matched.
