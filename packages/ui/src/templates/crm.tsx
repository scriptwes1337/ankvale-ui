"use client"
import type { TemplateConfiguration } from "@ankvale/ui/templates/shared"
import { useMemo, useState } from "react"
import {
  TemplateShell,
  TemplateSettings,
  TemplateHelp,
  downloadCsv,
} from "@ankvale/ui/templates/shared"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"
import { Kanban, type KanbanColumn } from "@ankvale/ui/components/kanban"
import { Kpi } from "@ankvale/ui/components/kpi"
import { KpiGroup } from "@ankvale/ui/components/kpi-group"
import { Segment } from "@ankvale/ui/components/segment"
import { Timeline } from "@ankvale/ui/components/timeline"
import { Button } from "@ankvale/ui/components/button"
import { Input } from "@ankvale/ui/components/input"
export type CrmCompany = {
  id: string
  name: string
  contact: string
  email: string
  stage: string
  value: number
  health: string
  notes: string
}
const stages = ["Lead", "Qualified", "Proposal", "Won"]
const initial: CrmCompany[] = [
  {
    id: "1",
    name: "Northstar Studio",
    contact: "Jamie Chen",
    email: "jamie@example.com",
    stage: "Proposal",
    value: 12000,
    health: "Healthy",
    notes: "Review the proposal next week.",
  },
  {
    id: "2",
    name: "Capsule Labs",
    contact: "Sam Rivera",
    email: "sam@example.com",
    stage: "Qualified",
    value: 8000,
    health: "Healthy",
    notes: "Schedule the product walkthrough.",
  },
  {
    id: "3",
    name: "Offscript",
    contact: "Taylor Brooks",
    email: "taylor@example.com",
    stage: "Lead",
    value: 4500,
    health: "Needs attention",
    notes: "Waiting for a response.",
  },
  {
    id: "4",
    name: "Layers",
    contact: "Alex Lee",
    email: "alex@example.com",
    stage: "Won",
    value: 18000,
    health: "Healthy",
    notes: "Onboarding is complete.",
  },
]
export function CrmTemplate({
  initialCompanies = initial,
  onCompanyChange,
  className,
  configuration,
}: {
  initialCompanies?: CrmCompany[]
  onCompanyChange?: (company: CrmCompany) => void
  configuration?: TemplateConfiguration
  className?: string
}) {
  const [companies, setCompanies] = useState(initialCompanies),
    [page, setPage] = useState("companies"),
    [selected, setSelected] = useState<string | null>("1"),
    [stage, setStage] = useState("all"),
    [saved, setSaved] = useState(false)
  const company = companies.find((item) => item.id === selected)
  function update(id: string, patch: Partial<CrmCompany>) {
    setCompanies((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
    setSaved(false)
  }
  const columns = useMemo<DataGridColumn<CrmCompany>[]>(
    () => [
      {
        id: "name",
        header: "Company",
        accessorKey: "name",
        pinned: "start",
        width: 220,
        cell: (row) => (
          <button
            type="button"
            className="text-start font-medium text-primary hover:underline"
            onClick={() => setSelected(row.id)}
          >
            {row.name}
          </button>
        ),
      },
      { id: "contact", header: "Contact", accessorKey: "contact" },
      { id: "stage", header: "Stage", accessorKey: "stage", width: 130 },
      {
        id: "value",
        header: "Value",
        accessorKey: "value",
        cell: (row) => `$${row.value.toLocaleString("en-US")}`,
        width: 130,
      },
      { id: "health", header: "Health", accessorKey: "health" },
    ],
    []
  )
  const board: KanbanColumn[] = stages.map((stage) => ({
    id: stage,
    title: stage,
    cards: companies
      .filter((company) => company.stage === stage)
      .map((company) => ({
        id: company.id,
        title: company.name,
        description: `$${company.value.toLocaleString("en-US")}`,
      })),
  }))
  return (
    <TemplateShell
      configuration={configuration}
      brand="Ankvale CRM"
      pages={[
        { id: "companies", label: "Companies", count: companies.length },
        { id: "pipeline", label: "Pipeline" },
        { id: "settings", label: "Settings" },
        { id: "help", label: "Help" },
      ]}
      active={page}
      onNavigate={setPage}
      title={
        page === "pipeline"
          ? "Pipeline"
          : page === "settings"
            ? "Settings"
            : page === "help"
              ? "Help"
              : "Companies"
      }
      className={className}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadCsv("companies.csv", companies)}
        >
          Export
        </Button>
      }
      aside={
        company && page === "companies" ? (
          <form
            className="space-y-4 p-4"
            onSubmit={(e) => {
              e.preventDefault()
              onCompanyChange?.(company)
              setSaved(true)
            }}
          >
            <h2 className="text-base font-semibold">{company.name}</h2>
            <label className="grid gap-2 text-xs">
              Contact
              <Input
                value={company.contact}
                onChange={(e) =>
                  update(company.id, { contact: e.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-xs">
              Email
              <Input
                type="email"
                value={company.email}
                onChange={(e) => update(company.id, { email: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-xs">
              Stage
              <select
                value={company.stage}
                onChange={(e) => update(company.id, { stage: e.target.value })}
                className="h-9 rounded-md border bg-card px-2"
              >
                {stages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs">
              Notes
              <textarea
                value={company.notes}
                onChange={(e) => update(company.id, { notes: e.target.value })}
                className="min-h-24 rounded-md border bg-card p-2"
              />
            </label>
            <Button type="submit" size="sm">
              Save company
            </Button>
            {saved && (
              <p role="status" className="text-xs text-success">
                Company saved.
              </p>
            )}
            <Timeline
              items={[
                {
                  id: "created",
                  title: "Company added",
                  date: "Nov 20",
                  status: "complete",
                },
                {
                  id: "contacted",
                  title: "Contact updated",
                  date: "Today",
                  status: "current",
                },
              ]}
            />
          </form>
        ) : undefined
      }
    >
      <div className="space-y-6 p-5 lg:p-8">
        {page === "settings" ? (
          <TemplateSettings />
        ) : page === "help" ? (
          <TemplateHelp />
        ) : (
          <>
            <KpiGroup className="xl:grid-cols-3">
              <Kpi
                label="Pipeline value"
                value={`$${companies
                  .filter((item) => item.stage !== "Won")
                  .reduce((sum, item) => sum + item.value, 0)
                  .toLocaleString("en-US")}`}
              />
              <Kpi
                label="Won"
                value={`$${companies
                  .filter((item) => item.stage === "Won")
                  .reduce((sum, item) => sum + item.value, 0)
                  .toLocaleString("en-US")}`}
              />
              <Kpi label="Companies" value={companies.length} />
            </KpiGroup>
            {page === "pipeline" ? (
              <Kanban
                columns={board}
                onColumnsChange={(next) => {
                  setCompanies((items) =>
                    items.map((item) => ({
                      ...item,
                      stage:
                        next.find((column) =>
                          column.cards.some((card) => card.id === item.id)
                        )?.id ?? item.stage,
                    }))
                  )
                }}
              />
            ) : (
              <>
                <Segment
                  label="Pipeline stage"
                  options={[
                    { value: "all", label: "All" },
                    ...stages.map((stage) => ({ value: stage, label: stage })),
                  ]}
                  value={stage}
                  onValueChange={setStage}
                />
                <DataGrid
                  data={
                    stage === "all"
                      ? companies
                      : companies.filter((company) => company.stage === stage)
                  }
                  columns={columns}
                  getRowId={(row) => row.id}
                  label="Companies"
                  selectable
                  columnFilters
                />
              </>
            )}
          </>
        )}
      </div>
    </TemplateShell>
  )
}
