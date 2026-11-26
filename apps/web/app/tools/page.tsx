import { SiteHeader } from "@/components/site-header"
export default function ToolsPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-4xl space-y-10 px-6 py-12"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Developer tools
        </h1>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Build with an agent</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Start with a task, choose an existing composition, then read its
            actual API. The guides cover section selection, design rules, states
            and motion.
          </p>
          <div className="flex flex-wrap gap-5 text-sm text-primary">
            <a href="/guides">Read the guides →</a>
            <a href="/downloads/ankvale-agent-guide.zip" download>
              Download AGENTS.md & references →
            </a>
            <a href="/llms.txt">Agent discovery →</a>
          </div>
          <p className="text-sm text-muted-foreground">
            Keep the downloaded files together. Add a pointer to
            ankvale-ui/AGENTS.md in your existing project instructions.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">MCP server</h2>
          <p className="text-sm text-muted-foreground">
            Recommend task patterns and read design guides, block catalogs,
            component APIs, source, registry items, templates, and exported
            design systems from your coding agent.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            MCP discovery is currently available through a local Ankvale source
            checkout. The downloadable guides and skills work independently of
            MCP and are the simplest way to give an agent the component catalog
            and design guidance.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Agent skills</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                id: "ankvale-code",
                name: "Ankvale code",
                description:
                  "Use the actual component APIs, registry, native package, and templates.",
              },
              {
                id: "ankvale-design",
                name: "Ankvale design",
                description:
                  "Apply Ankvale’s visual language and saved design systems.",
              },
            ].map((skill) => (
              <article
                key={skill.id}
                className="space-y-3 rounded-lg border p-5"
              >
                <h3 className="font-medium">{skill.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {skill.description}
                </p>
                <a
                  className="inline-block text-sm text-primary"
                  href={`/downloads/${skill.id}.zip`}
                  download
                >
                  Download skill →
                </a>
              </article>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Extract each folder into your coding agent’s supported skills
            location.
          </p>
        </section>
      </main>
    </>
  )
}
