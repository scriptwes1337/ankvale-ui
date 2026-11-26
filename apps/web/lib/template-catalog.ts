export const templateCatalog = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Metrics, charts, orders, task tracking, and settings.",
  },
  {
    id: "mail",
    name: "Mail",
    description: "Folders, message reading, search, drafts, and compose.",
  },
  {
    id: "chat",
    name: "Chat",
    description:
      "Conversations, document library, prompts, and model selection.",
  },
  {
    id: "crm",
    name: "CRM",
    description: "Companies, pipeline stages, profiles, and account notes.",
  },
  {
    id: "finances",
    name: "Finances",
    description: "Portfolio, allocation, spending, and transactions.",
  },
] as const
export type TemplateId = (typeof templateCatalog)[number]["id"]
