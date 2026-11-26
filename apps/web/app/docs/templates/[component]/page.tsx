import { PackageDocs, packageDocuments } from "@/components/package-docs"
export async function generateStaticParams() {
  return (await packageDocuments("templates"))
    .filter((d) => d.id !== "shared")
    .map((d) => ({ component: d.id }))
}
export default async function TemplateDocs({
  params,
}: {
  params: Promise<{ component: string }>
}) {
  return <PackageDocs id={(await params).component} kind="templates" />
}
