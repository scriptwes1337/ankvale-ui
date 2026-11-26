"use client"
import type { TemplateConfiguration } from "@ankvale/ui/templates/shared"
import { useState } from "react"
import {
  TemplateShell,
  TemplateSettings,
  TemplateHelp,
  downloadCsv,
} from "@ankvale/ui/templates/shared"
import { Button } from "@ankvale/ui/components/button"
import { Kpi } from "@ankvale/ui/components/kpi"
import { KpiGroup } from "@ankvale/ui/components/kpi-group"
import { AreaChart } from "@ankvale/ui/components/area-chart"
import { PieChart } from "@ankvale/ui/components/pie-chart"
import { Widget } from "@ankvale/ui/components/widget"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"
import { Kanban, type KanbanColumn } from "@ankvale/ui/components/kanban"
import { Segment } from "@ankvale/ui/components/segment"
export type DashboardOrder = {
  id: string
  customer: string
  amount: number
  status: string
  date: string
}
const sampleOrders: DashboardOrder[] = Array.from({ length: 18 }, (_, i) => ({
  id: `ORD-${1001 + i}`,
  customer: ["Alex Lee", "Jamie Chen", "Sam Rivera"][i % 3]!,
  amount: 120 + i * 35,
  status: ["Paid", "Pending", "Refunded"][i % 3]!,
  date: `2026-11-${String(i + 1).padStart(2, "0")}`,
}))
const orderColumns: DataGridColumn<DashboardOrder>[] = [
  { id: "id", header: "Order", accessorKey: "id", pinned: "start", width: 130 },
  { id: "customer", header: "Customer", accessorKey: "customer" },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    cell: (row) => `$${row.amount.toFixed(2)}`,
    width: 130,
  },
  { id: "status", header: "Status", accessorKey: "status", width: 130 },
  { id: "date", header: "Date", accessorKey: "date", width: 130 },
]
const initialBoard: KanbanColumn[] = [
  {
    id: "todo",
    title: "To do",
    cards: [
      { id: "brief", title: "Review brief" },
      { id: "research", title: "Customer interviews" },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    cards: [{ id: "design", title: "Dashboard layout" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "setup", title: "Workspace setup" }],
  },
]
const performance = [
  { month: "Jun", revenue: 12000, expenses: 6000 },
  { month: "Jul", revenue: 14500, expenses: 6800 },
  { month: "Aug", revenue: 13200, expenses: 6500 },
  { month: "Sep", revenue: 18000, expenses: 7200 },
  { month: "Oct", revenue: 21300, expenses: 8000 },
  { month: "Nov", revenue: 24860, expenses: 8500 },
]
export function DashboardTemplate({
  orders = sampleOrders,
  className,
  configuration,
}: {
  orders?: DashboardOrder[]
  configuration?: TemplateConfiguration
  className?: string
}) {
  const [page, setPage] = useState("dashboard"),
    [board, setBoard] = useState(initialBoard),
    [period, setPeriod] = useState("six")
  const pages = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders", count: orders.length },
    { id: "tracker", label: "Tracker" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
    { id: "help", label: "Help" },
  ]
  return (
    <TemplateShell
      configuration={configuration}
      brand="Ankvale dashboard"
      pages={pages}
      active={page}
      onNavigate={setPage}
      title={pages.find((item) => item.id === page)?.label ?? "Dashboard"}
      className={className}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => downloadCsv("orders.csv", orders)}
        >
          Export orders
        </Button>
      }
    >
      <div className="space-y-6 p-5 lg:p-8">
        {page === "settings" ? (
          <TemplateSettings />
        ) : page === "help" ? (
          <TemplateHelp />
        ) : page === "tracker" ? (
          <Kanban columns={board} onColumnsChange={setBoard} />
        ) : page === "orders" ? (
          <DataGrid
            data={orders}
            columns={orderColumns}
            getRowId={(row) => row.id}
            label="Orders"
            selectable
            columnFilters
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold">
                {page === "analytics" ? "Analytics" : "Overview"}
              </h1>
              <Segment
                label="Period"
                value={period}
                onValueChange={setPeriod}
                options={[
                  { value: "three", label: "3 months" },
                  { value: "six", label: "6 months" },
                ]}
              />
            </div>
            <KpiGroup>
              <Kpi label="Revenue" value="$24,860" change={12.8} />
              <Kpi label="Expenses" value="$8,500" change={3.1} />
              <Kpi label="Orders" value={orders.length} change={8.2} />
              <Kpi label="Profit" value="$16,360" change={18.5} />
            </KpiGroup>
            <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
              <Widget title="Revenue and expenses">
                <AreaChart
                  label="Revenue and expenses"
                  data={
                    period === "three" ? performance.slice(-3) : performance
                  }
                  series={[
                    { key: "revenue", label: "Revenue" },
                    { key: "expenses", label: "Expenses" },
                  ]}
                  xKey="month"
                />
              </Widget>
              <Widget title="Traffic sources">
                <PieChart
                  label="Traffic sources"
                  data={[
                    { name: "Organic", value: 52 },
                    { name: "Direct", value: 28 },
                    { name: "Referral", value: 20 },
                  ]}
                  donut
                />
              </Widget>
            </div>
            <Widget title="Recent orders">
              <DataGrid
                data={orders}
                columns={orderColumns}
                getRowId={(row) => row.id}
                label="Recent orders"
                pageSize={5}
              />
            </Widget>
          </>
        )}
      </div>
    </TemplateShell>
  )
}
