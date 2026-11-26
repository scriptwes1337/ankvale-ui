import { PackageDocs, packageDocuments } from "@/components/package-docs"
export async function generateStaticParams() {
  return (await packageDocuments("block-modules")).map((document) => ({
    component: document.id,
  }))
}
export default async function BlockDocs({
  params,
}: {
  params: Promise<{ component: string }>
}) {
  return <PackageDocs id={(await params).component} kind="block-modules" />
}
