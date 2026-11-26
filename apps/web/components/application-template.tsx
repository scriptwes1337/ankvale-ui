"use client"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { TemplateId } from "@/lib/template-catalog"
const Dashboard = dynamic(() =>
  import("@ankvale/ui/templates/dashboard").then(
    (module) => module.DashboardTemplate
  )
)
const Mail = dynamic(() =>
  import("@ankvale/ui/templates/mail").then((module) => module.MailTemplate)
)
const Chat = dynamic(() =>
  import("@ankvale/ui/templates/chat").then((module) => module.ChatTemplate)
)
const Crm = dynamic(() =>
  import("@ankvale/ui/templates/crm").then((module) => module.CrmTemplate)
)
const Finances = dynamic(() =>
  import("@ankvale/ui/templates/finances").then(
    (module) => module.FinancesTemplate
  )
)
const templates = {
  dashboard: Dashboard,
  mail: Mail,
  chat: Chat,
  crm: Crm,
  finances: Finances,
}
export function ApplicationTemplate({ name }: { name: TemplateId }) {
  const Template = templates[name]
  return (
    <>
      <div className="flex h-10 items-center justify-between border-b bg-card px-4 text-xs">
        <Link href="/templates" className="text-muted-foreground">
          ← Templates
        </Link>
        <span className="text-muted-foreground">
          Local preview · Sample data
        </span>
        <Link href={`/docs/templates/${name}`} className="text-primary">
          API reference
        </Link>
        <a href={`/r/${name}-template.json`} className="text-primary">
          Registry source
        </a>
      </div>
      <Template className="h-[calc(100svh-40px)] min-h-0" />
    </>
  )
}
