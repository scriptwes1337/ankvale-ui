"use client"
import { useState } from "react"
import { QueryBuilder } from "@ankvale/ui/components/query-builder"
import {
  compileQuery,
  type QueryField,
  type QueryGroup,
} from "@ankvale/ui/lib/query"
type Contact = {
  id: string
  name: string
  revenue: number
  active: boolean
  joined: string
  plan: string
}
const contacts: Contact[] = [
  {
    id: "a",
    name: "Morgan",
    revenue: 1200,
    active: true,
    joined: "2026-01-12",
    plan: "team",
  },
  {
    id: "b",
    name: "Sam",
    revenue: 300,
    active: true,
    joined: "2026-05-20",
    plan: "starter",
  },
  {
    id: "c",
    name: "Alex",
    revenue: 0,
    active: false,
    joined: "2026-09-02",
    plan: "starter",
  },
]
const fields: QueryField<Contact>[] = [
  { id: "name", label: "Name", type: "text" },
  { id: "revenue", label: "Revenue", type: "number" },
  { id: "active", label: "Active", type: "boolean" },
  { id: "joined", label: "Joined", type: "date" },
  {
    id: "plan",
    label: "Plan",
    type: "enum",
    options: [
      { value: "starter", label: "Starter" },
      { value: "team", label: "Team" },
    ],
  },
]
function QueryExample() {
  const [query, setQuery] = useState<QueryGroup>({
    type: "group",
    id: "root",
    conjunction: "and",
    children: [
      {
        type: "rule",
        id: "active",
        field: "active",
        operator: "eq",
        value: true,
      },
      {
        type: "group",
        id: "growth",
        conjunction: "or",
        children: [
          {
            type: "rule",
            id: "revenue",
            field: "revenue",
            operator: "gte",
            value: 1000,
          },
          {
            type: "rule",
            id: "plan",
            field: "plan",
            operator: "eq",
            value: "team",
          },
        ],
      },
    ],
  })
  let matches: Contact[] = []
  try {
    matches = contacts.filter(compileQuery(query, fields))
  } catch {
    /* The editor renders validation messages. */
  }
  return (
    <div className="w-full max-w-3xl space-y-4">
      <QueryBuilder
        value={query}
        onChange={setQuery}
        fields={fields}
        label="Find contacts"
      />
      <div className="rounded-lg border">
        <p
          className="border-b px-4 py-3 text-xs text-muted-foreground"
          role="status"
        >
          {matches.length} matching contacts
        </p>
        {matches.map((contact) => (
          <div
            key={contact.id}
            className="flex justify-between gap-3 border-b px-4 py-3 text-sm last:border-0"
          >
            <span>{contact.name}</span>
            <span className="text-muted-foreground">
              {contact.plan} · ${contact.revenue}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
const previews = { "query-builder": QueryExample }
export function QueryPreview({ name }: { name: string }) {
  const Preview = previews[name as keyof typeof previews]
  return Preview ? <Preview /> : null
}
