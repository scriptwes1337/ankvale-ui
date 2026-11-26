"use client"
import type { ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import { Descriptions } from "@ankvale/ui/components/descriptions"
import { Progress } from "@ankvale/ui/components/progress"
import { Popconfirm } from "@ankvale/ui/components/popconfirm"
import {
  AppSection,
  AsyncAction,
  type AppAction,
} from "@ankvale/ui/blocks/app-shared"
export type BillingPlan = {
  id: string
  name: string
  price: string
  features: string[]
}
export type BillingInvoice = {
  id: string
  date: string
  amount: string
  status: string
}
export function BillingOverview({
  currentPlan,
  plans,
  usage,
  invoices,
  onChangePlan,
  onCancel,
  onInvoice,
}: {
  currentPlan: string
  plans: BillingPlan[]
  usage: { label: string; used: number; limit: number }[]
  invoices: BillingInvoice[]
  onChangePlan: (id: string) => void | Promise<void>
  onCancel: AppAction
  onInvoice: (id: string) => void
}) {
  return (
    <AppSection title="Billing and subscription">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <section key={plan.id} className="space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">
              {plan.name}
              {plan.id === currentPlan && (
                <span className="ms-2 text-xs text-primary">Current plan</span>
              )}
            </h3>
            <p className="text-xl font-semibold">{plan.price}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            <AsyncAction
              variant={plan.id === currentPlan ? "outline" : "default"}
              disabled={plan.id === currentPlan}
              onAction={() => onChangePlan(plan.id)}
            >
              Choose {plan.name}
            </AsyncAction>
          </section>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {usage.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between gap-3 text-sm">
              <span>{item.label}</span>
              <span>
                {item.used} / {item.limit}
              </span>
            </div>
            <Progress
              value={
                item.limit > 0
                  ? Math.min(100, (item.used / item.limit) * 100)
                  : 0
              }
              aria-label={item.label}
            />
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">Invoices</h3>
        {invoices.length ? (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <span>
                {invoice.date} · {invoice.amount} · {invoice.status}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInvoice(invoice.id)}
              >
                View invoice {invoice.id}
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        )}
      </div>
      <Popconfirm
        trigger="Cancel subscription"
        title="Cancel your subscription?"
        description="Your service will confirm when the cancellation takes effect."
        confirmLabel="Cancel subscription"
        onConfirm={onCancel}
      />
    </AppSection>
  )
}
export function InvoiceDetails({
  number,
  date,
  status,
  customer,
  items,
  subtotal,
  tax,
  total,
  onDownload,
  paymentMethod,
}: {
  number: string
  date: string
  status: string
  customer: ReactNode
  items: { id: string; description: string; quantity: number; amount: string }[]
  subtotal: string
  tax: string
  total: string
  onDownload: AppAction
  paymentMethod?: ReactNode
}) {
  return (
    <AppSection
      title={`Invoice ${number}`}
      actions={
        <AsyncAction variant="outline" onAction={onDownload}>
          Download invoice
        </AsyncAction>
      }
    >
      <Descriptions
        items={[
          { id: "date", label: "Issued", value: date },
          { id: "status", label: "Status", value: status },
        ]}
      />
      <div className="text-sm">{customer}</div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-start">Description</th>
              <th className="p-3 text-end">Quantity</th>
              <th className="py-3 text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">{item.description}</td>
                <td className="p-3 text-end">{item.quantity}</td>
                <td className="py-3 text-end">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="ms-auto grid max-w-xs grid-cols-2 gap-3 text-sm">
        <dt>Subtotal</dt>
        <dd className="text-end">{subtotal}</dd>
        <dt>Tax</dt>
        <dd className="text-end">{tax}</dd>
        <dt className="font-semibold">Total</dt>
        <dd className="text-end font-semibold">{total}</dd>
      </dl>
      {paymentMethod}
    </AppSection>
  )
}
