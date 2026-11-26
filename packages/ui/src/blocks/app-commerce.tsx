"use client"
import { useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { Image } from "@ankvale/ui/components/image"
import { NumberStepper } from "@ankvale/ui/components/number-stepper"
import { Descriptions } from "@ankvale/ui/components/descriptions"
import {
  AppSection,
  AppForm,
  AsyncAction,
  AppCollectionState,
  type AppFormValues,
} from "@ankvale/ui/blocks/app-shared"
export type CatalogProduct = {
  id: string
  name: string
  description: string
  category: string
  price: number
  currency: string
  image?: string
  available?: boolean
  options?: { id: string; label: string; values: string[] }[]
}
export function formatMoney(minor: number, currency: string, locale = "en-US") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  })
  return formatter.format(
    minor / 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2)
  )
}
export function ProductCatalog({
  products,
  onView,
  loading,
  error,
}: {
  products: CatalogProduct[]
  onView: (id: string) => void
  loading?: boolean
  error?: string
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState("name")
  const visible = products
    .filter(
      (p) =>
        (!category || p.category === category) &&
        `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === "price" ? a.price - b.price : a.name.localeCompare(b.name)
    )
  return (
    <AppSection title="Products">
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <select
          aria-label="Product category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {[...new Set(products.map((p) => p.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded border bg-background px-3 text-sm"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>
      <AppCollectionState
        loading={loading}
        error={error}
        empty={!visible.length}
      />
      {!loading && !error && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id} className="space-y-3 rounded-lg border p-4">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  className="aspect-[4/3] w-full rounded"
                />
              )}
              <h3 className="text-base font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
              <p className="text-sm">
                {formatMoney(product.price, product.currency)}
              </p>
              <Button variant="outline" onClick={() => onView(product.id)}>
                View {product.name}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AppSection>
  )
}
export function ProductDetail({
  product,
  onAddToCart,
}: {
  product: CatalogProduct
  onAddToCart: (item: {
    productId: string
    quantity: number
    options: Record<string, string>
  }) => void | Promise<void>
}) {
  const [quantity, setQuantity] = useState(1)
  const [options, setOptions] = useState<Record<string, string>>({})
  return (
    <AppSection title={product.name}>
      <div className="grid gap-6 md:grid-cols-2">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            className="aspect-square w-full rounded-lg"
          />
        )}
        <div className="space-y-5">
          <p className="text-2xl font-semibold">
            {formatMoney(product.price, product.currency)}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          {product.options?.map((option) => (
            <label key={option.id} className="grid gap-2 text-sm">
              {option.label}
              <select
                value={options[option.id] ?? ""}
                onChange={(e) =>
                  setOptions({ ...options, [option.id]: e.target.value })
                }
                className="h-9 rounded border bg-background px-3"
              >
                <option value="">Choose {option.label.toLowerCase()}</option>
                {option.values.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
          <NumberStepper
            label="Quantity"
            min={1}
            max={99}
            value={quantity}
            onValueChange={setQuantity}
          />
          <AsyncAction
            disabled={
              product.available === false ||
              product.options?.some((o) => !options[o.id])
            }
            onAction={() =>
              onAddToCart({ productId: product.id, quantity, options })
            }
          >
            {product.available === false ? "Unavailable" : "Add to cart"}
          </AsyncAction>
        </div>
      </div>
    </AppSection>
  )
}
export type CartItem = {
  id: string
  name: string
  quantity: number
  unitPrice: number
  image?: string
  description?: string
}
export function CartPanel({
  items,
  currency,
  onQuantityChange,
  onRemove,
  onCheckout,
}: {
  items: CartItem[]
  currency: string
  onQuantityChange: (id: string, quantity: number) => void | Promise<void>
  onRemove: (id: string) => void | Promise<void>
  onCheckout: () => void
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  return (
    <AppSection title="Your cart">
      <AppCollectionState empty={!items.length} />
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-4 py-4">
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                className="size-16 rounded"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-1 text-sm">
                {formatMoney(item.quantity * item.unitPrice, currency)}
              </p>
            </div>
            <CartQuantity item={item} onChange={onQuantityChange} />
            <AsyncAction
              variant="ghost"
              size="sm"
              onAction={() => onRemove(item.id)}
            >
              Remove
            </AsyncAction>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
        <p className="font-semibold">
          Subtotal {formatMoney(subtotal, currency)}
        </p>
        <Button disabled={!items.length} onClick={onCheckout}>
          Continue to checkout
        </Button>
      </div>
    </AppSection>
  )
}
function CartQuantity({
  item,
  onChange,
}: {
  item: CartItem
  onChange: (id: string, quantity: number) => void | Promise<void>
}) {
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)
  return (
    <div className="space-y-1">
      <NumberStepper
        label={`Quantity for ${item.name}`}
        value={item.quantity}
        min={1}
        max={99}
        disabled={pending}
        onValueChange={async (quantity) => {
          setPending(true)
          setError(false)
          try {
            await onChange(item.id, quantity)
          } catch {
            setError(true)
          } finally {
            setPending(false)
          }
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          Could not update quantity.
        </p>
      )}
    </div>
  )
}
export type OrderReceipt = { id: string; summary: string; href?: string }
export function CheckoutFlow({
  items,
  currency,
  shippingCost = 0,
  tax = 0,
  payment,
  onPlaceOrder,
}: {
  items: CartItem[]
  currency: string
  shippingCost?: number
  tax?: number
  payment: ReactNode
  onPlaceOrder: (details: {
    shipping: AppFormValues
    items: CartItem[]
  }) => Promise<OrderReceipt>
}) {
  const [shipping, setShipping] = useState<AppFormValues | null>(null)
  const [shippingDraft, setShippingDraft] = useState<AppFormValues>({})
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null)
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  return (
    <AppSection title={receipt ? "Order confirmed" : "Checkout"}>
      {receipt ? (
        <div role="status" className="space-y-3">
          <p className="font-medium">Order {receipt.id}</p>
          <p className="text-sm text-muted-foreground">{receipt.summary}</p>
          {receipt.href && (
            <a href={receipt.href} className="text-sm text-primary underline">
              View order
            </a>
          )}
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-[1.4fr_1fr]">
          <div>
            {!shipping ? (
              <AppForm
                fields={[
                  {
                    name: "name",
                    label: "Full name",
                    required: true,
                    autoComplete: "name",
                  },
                  {
                    name: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                    autoComplete: "email",
                  },
                  {
                    name: "address",
                    label: "Street address",
                    required: true,
                    autoComplete: "street-address",
                  },
                  {
                    name: "city",
                    label: "City",
                    required: true,
                    autoComplete: "address-level2",
                  },
                  {
                    name: "postal",
                    label: "Postal code",
                    required: true,
                    autoComplete: "postal-code",
                  },
                  {
                    name: "country",
                    label: "Country",
                    required: true,
                    autoComplete: "country-name",
                  },
                ]}
                submitLabel="Continue to payment"
                initialValues={shippingDraft}
                onValuesChange={setShippingDraft}
                onSubmit={setShipping}
                successMessage=""
              />
            ) : (
              <div className="space-y-5">
                <Descriptions
                  columns={1}
                  items={[
                    {
                      id: "address",
                      label: "Shipping to",
                      value: `${shipping.name}, ${shipping.address}, ${shipping.city}, ${shipping.country}`,
                    },
                  ]}
                />
                <Button variant="ghost" onClick={() => setShipping(null)}>
                  Edit address
                </Button>
                {payment}
                <AsyncAction
                  disabled={!items.length}
                  onAction={async () =>
                    setReceipt(await onPlaceOrder({ shipping, items }))
                  }
                >
                  Place order ·{" "}
                  {formatMoney(subtotal + shippingCost + tax, currency)}
                </AsyncAction>
              </div>
            )}
          </div>
          <aside className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Order summary</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {formatMoney(item.quantity * item.unitPrice, currency)}
                </span>
              </div>
            ))}
            <dl className="grid grid-cols-2 gap-2 border-t pt-4 text-sm">
              <dt>Subtotal</dt>
              <dd className="text-end">{formatMoney(subtotal, currency)}</dd>
              <dt>Shipping</dt>
              <dd className="text-end">
                {formatMoney(shippingCost, currency)}
              </dd>
              <dt>Tax</dt>
              <dd className="text-end">{formatMoney(tax, currency)}</dd>
              <dt className="font-semibold">Total</dt>
              <dd className="text-end font-semibold">
                {formatMoney(subtotal + shippingCost + tax, currency)}
              </dd>
            </dl>
          </aside>
        </div>
      )}
    </AppSection>
  )
}
export type ManagedOrder = {
  id: string
  customer: string
  date: string
  status: string
  total: number
  currency: string
  items: CartItem[]
  shippingAddress: string
}
export function OrderManagement({
  orders,
  onFulfill,
  onRefundRequest,
}: {
  orders: ManagedOrder[]
  onFulfill?: (id: string) => void | Promise<void>
  onRefundRequest?: (id: string, reason: string) => void | Promise<void>
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const order = orders.find((o) => o.id === selected)
  const visible = orders.filter(
    (o) =>
      (!status || o.status === status) &&
      `${o.id} ${o.customer}`.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <AppSection title={order ? `Order ${order.id}` : "Orders"}>
      {order ? (
        <>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            ← All orders
          </Button>
          <Descriptions
            items={[
              { id: "customer", label: "Customer", value: order.customer },
              { id: "date", label: "Placed", value: order.date },
              { id: "status", label: "Status", value: order.status },
              {
                id: "total",
                label: "Total",
                value: formatMoney(order.total, order.currency),
              },
              {
                id: "shipping",
                label: "Ship to",
                value: order.shippingAddress,
              },
            ]}
          />
          <ul className="divide-y">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {formatMoney(item.unitPrice * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>
          {onFulfill && order.status === "pending" && (
            <AsyncAction onAction={() => onFulfill(order.id)}>
              Mark fulfilled
            </AsyncAction>
          )}
          {onRefundRequest && (
            <details className="border-t pt-4 text-sm">
              <summary>Request a refund</summary>
              <div className="mt-4">
                <AppForm
                  fields={[
                    {
                      name: "reason",
                      label: "Refund reason",
                      type: "textarea",
                      required: true,
                    },
                  ]}
                  submitLabel="Submit refund request"
                  onSubmit={(v) => onRefundRequest(order.id, v.reason ?? "")}
                  successMessage="Refund request submitted."
                />
              </div>
            </details>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Input
              aria-label="Search orders"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <select
              aria-label="Order status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border bg-background px-3"
            >
              <option value="">All statuses</option>
              {[...new Set(orders.map((o) => o.status))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {!visible.length && (
            <p className="text-sm text-muted-foreground">No matching orders.</p>
          )}
          <ul className="divide-y">
            {visible.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="text-sm font-medium">
                    {o.id} · {o.customer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.date} · {o.status} · {formatMoney(o.total, o.currency)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(o.id)}
                >
                  View order
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppSection>
  )
}
