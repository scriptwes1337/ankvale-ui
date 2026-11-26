import { notFound } from "next/navigation"
import { ApplicationTemplate } from "@/components/application-template"
import { templateCatalog } from "@/lib/template-catalog"
export function generateStaticParams() {
  return templateCatalog.map((template) => ({ template: template.id }))
}
export default async function TemplatePage({
  params,
}: {
  params: Promise<{ template: string }>
}) {
  const { template } = await params
  const item = templateCatalog.find((item) => item.id === template)
  if (!item) notFound()
  return <ApplicationTemplate name={item.id} />
}
