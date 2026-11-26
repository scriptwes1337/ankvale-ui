"use client"
import type { TemplateConfiguration } from "@ankvale/ui/templates/shared"
import { useState } from "react"
import {
  TemplateShell,
  TemplateSettings,
  TemplateHelp,
  downloadCsv,
} from "@ankvale/ui/templates/shared"
import { Kpi } from "@ankvale/ui/components/kpi"
import { KpiGroup } from "@ankvale/ui/components/kpi-group"
import { Widget } from "@ankvale/ui/components/widget"
import { AreaChart } from "@ankvale/ui/components/area-chart"
import { BarChart } from "@ankvale/ui/components/bar-chart"
import { PieChart } from "@ankvale/ui/components/pie-chart"
import {
  DataGrid,
  type DataGridColumn,
} from "@ankvale/ui/components/data-grid"
import { Segment } from "@ankvale/ui/components/segment"
import { TrendChip } from "@ankvale/ui/components/trend-chip"
import { Button } from "@ankvale/ui/components/button"
export type FinanceHolding = {
  id: string
  name: string
  units: number
  value: number
  change: number
}
export type FinanceTransaction = {
  id: string
  type: string
  asset: string
  amount: number
  date: string
}
const holdings: FinanceHolding[] = [
  {
    id: "growth",
    name: "Growth portfolio",
    units: 12.5,
    value: 8400,
    change: 3.2,
  },
  {
    id: "income",
    name: "Income portfolio",
    units: 24,
    value: 6200,
    change: 1.4,
  },
  { id: "reserve", name: "Cash reserve", units: 5200, value: 5200, change: 0 },
  { id: "index", name: "Index portfolio", units: 8, value: 5060, change: -0.8 },
]
const transactions: FinanceTransaction[] = [
  {
    id: "TX-1001",
    type: "Deposit",
    asset: "Cash reserve",
    amount: 1200,
    date: "2026-11-26",
  },
  {
    id: "TX-1002",
    type: "Purchase",
    asset: "Growth portfolio",
    amount: -500,
    date: "2026-11-25",
  },
  {
    id: "TX-1003",
    type: "Dividend",
    asset: "Income portfolio",
    amount: 84,
    date: "2026-11-24",
  },
  {
    id: "TX-1004",
    type: "Withdrawal",
    asset: "Cash reserve",
    amount: -200,
    date: "2026-11-23",
  },
  {
    id: "TX-1005",
    type: "Purchase",
    asset: "Index portfolio",
    amount: -350,
    date: "2026-11-22",
  },
]
const history = [
  { month: "Jun", balance: 18000 },
  { month: "Jul", balance: 18800 },
  { month: "Aug", balance: 18400 },
  { month: "Sep", balance: 20700 },
  { month: "Oct", balance: 22600 },
  { month: "Nov", balance: 24860 },
]
const spending = [
  { category: "Software", value: 420 },
  { category: "Travel", value: 180 },
  { category: "Office", value: 260 },
  { category: "Services", value: 340 },
]
const holdingColumns: DataGridColumn<FinanceHolding>[] = [
  {
    id: "name",
    header: "Asset",
    accessorKey: "name",
    width: 220,
    pinned: "start",
  },
  { id: "units", header: "Units", accessorKey: "units", width: 120 },
  {
    id: "value",
    header: "Value",
    accessorKey: "value",
    width: 140,
    cell: (row) => `$${row.value.toLocaleString("en-US")}`,
  },
  {
    id: "change",
    header: "Change",
    accessorKey: "change",
    width: 120,
    cell: (row) => <TrendChip value={row.change} />,
  },
]
const transactionColumns: DataGridColumn<FinanceTransaction>[] = [
  { id: "id", header: "Transaction", accessorKey: "id", width: 150 },
  { id: "type", header: "Type", accessorKey: "type", width: 130 },
  { id: "asset", header: "Asset", accessorKey: "asset", width: 220 },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    width: 130,
    cell: (row) =>
      `${row.amount > 0 ? "+" : "−"}$${Math.abs(row.amount).toLocaleString("en-US")}`,
  },
  { id: "date", header: "Date", accessorKey: "date", width: 140 },
]
export function FinancesTemplate({
  initialHoldings = holdings,
  initialTransactions = transactions,
  className,
  configuration,
}: {
  initialHoldings?: FinanceHolding[]
  initialTransactions?: FinanceTransaction[]
  configuration?: TemplateConfiguration
  className?: string
}) {
  const [page, setPage] = useState("overview"),
    [range, setRange] = useState("six"),
    [type, setType] = useState("all")
  const balance = initialHoldings.reduce((sum, item) => sum + item.value, 0)
  const pages = [
    { id: "overview", label: "Overview" },
    { id: "portfolio", label: "Portfolio" },
    { id: "spending", label: "Spending" },
    { id: "transactions", label: "Transactions" },
    { id: "settings", label: "Settings" },
    { id: "help", label: "Help" },
  ]
  return (
    <TemplateShell
      configuration={configuration}
      brand="Ankvale finances"
      pages={pages}
      active={page}
      onNavigate={setPage}
      title={pages.find((item) => item.id === page)?.label ?? "Overview"}
      className={className}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => downloadCsv("transactions.csv", initialTransactions)}
        >
          Export transactions
        </Button>
      }
    >
      <div className="space-y-6 p-5 lg:p-8">
        {page === "settings" ? (
          <TemplateSettings />
        ) : page === "help" ? (
          <TemplateHelp />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Illustrative financial data.
            </p>
            {page === "transactions" ? (
              <>
                <Segment
                  label="Transaction type"
                  value={type}
                  onValueChange={setType}
                  options={[
                    { value: "all", label: "All" },
                    ...new Set(initialTransactions.map((item) => item.type)),
                  ].map((option) =>
                    typeof option === "string"
                      ? { value: option, label: option }
                      : option
                  )}
                />
                <DataGrid
                  data={
                    type === "all"
                      ? initialTransactions
                      : initialTransactions.filter((item) => item.type === type)
                  }
                  columns={transactionColumns}
                  getRowId={(row) => row.id}
                  label="Transactions"
                  columnFilters
                  selectable
                />
              </>
            ) : page === "spending" ? (
              <>
                <KpiGroup className="xl:grid-cols-2">
                  <Kpi label="Monthly spending" value="$1,200" change={-4.2} />
                  <Kpi label="Largest category" value="Software" />
                </KpiGroup>
                <Widget title="Spending by category">
                  <BarChart
                    data={spending}
                    series={[{ key: "value", label: "Spending" }]}
                    xKey="category"
                    label="Monthly spending"
                    horizontal
                  />
                </Widget>
              </>
            ) : (
              <>
                <KpiGroup>
                  <Kpi
                    label="Total balance"
                    value={`$${balance.toLocaleString("en-US")}`}
                    change={5.3}
                  />
                  <Kpi label="Holdings" value={initialHoldings.length} />
                  <Kpi
                    label="Deposits"
                    value={`$${initialTransactions
                      .filter((item) => item.type === "Deposit")
                      .reduce((sum, item) => sum + item.amount, 0)
                      .toLocaleString("en-US")}`}
                  />
                  <Kpi
                    label="Transactions"
                    value={initialTransactions.length}
                  />
                </KpiGroup>
                <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
                  <Widget
                    title="Portfolio performance"
                    actions={
                      <Segment
                        label="History range"
                        value={range}
                        onValueChange={setRange}
                        options={[
                          { value: "three", label: "3M" },
                          { value: "six", label: "6M" },
                        ]}
                      />
                    }
                  >
                    <AreaChart
                      data={range === "three" ? history.slice(-3) : history}
                      series={[{ key: "balance", label: "Balance" }]}
                      xKey="month"
                      label="Portfolio balance history"
                    />
                  </Widget>
                  <Widget title="Allocation">
                    <PieChart
                      data={initialHoldings.map((item) => ({
                        name: item.name,
                        value: item.value,
                      }))}
                      label="Portfolio allocation"
                      donut
                    />
                  </Widget>
                </div>
                <Widget title="Holdings">
                  <DataGrid
                    data={initialHoldings}
                    columns={holdingColumns}
                    getRowId={(row) => row.id}
                    label="Holdings"
                    searchable={false}
                  />
                </Widget>
                {page === "overview" && (
                  <Widget title="Recent transactions">
                    <DataGrid
                      data={initialTransactions}
                      columns={transactionColumns}
                      getRowId={(row) => row.id}
                      label="Recent transactions"
                      pageSize={5}
                    />
                  </Widget>
                )}
              </>
            )}
          </>
        )}
      </div>
    </TemplateShell>
  )
}
