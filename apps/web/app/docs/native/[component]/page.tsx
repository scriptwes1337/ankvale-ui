import { PackageDocs, packageDocuments } from "@/components/package-docs"
export async function generateStaticParams() {
  return (await packageDocuments("native")).map((d) => ({ component: d.id }))
}
export default async function NativeDocs({
  params,
}: {
  params: Promise<{ component: string }>
}) {
  return <PackageDocs id={(await params).component} kind="native" />
}
