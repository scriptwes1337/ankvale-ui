"use client"
import { useState, type ReactNode } from "react"
import { Input } from "@ankvale/ui/components/input"
import { Button } from "@ankvale/ui/components/button"
import { Popconfirm } from "@ankvale/ui/components/popconfirm"
import {
  AppSection,
  AppForm,
  AsyncAction,
  AppCollectionState,
  type AppAction,
} from "@ankvale/ui/blocks/app-shared"
export type IntegrationItem = {
  id: string
  name: string
  description: string
  category: string
  connected: boolean
  permissions?: string[]
  icon?: ReactNode
}
export function IntegrationsPanel({
  items,
  onConnect,
  onDisconnect,
  loading,
  error,
  onRetry,
}: {
  items: IntegrationItem[]
  onConnect: (id: string) => void | Promise<void>
  onDisconnect: (id: string) => void | Promise<void>
  loading?: boolean
  error?: string
  onRetry?: AppAction
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const visible = items.filter(
    (i) =>
      (!category || i.category === category) &&
      `${i.name} ${i.description}`.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <AppSection title="Integrations">
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="Search integrations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <select
          aria-label="Integration category"
          className="rounded-md border bg-background px-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {[...new Set(items.map((i) => i.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <AppCollectionState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!visible.length}
      />
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <section key={item.id} className="space-y-3 rounded-lg border p-4">
              <div aria-hidden="true">{item.icon}</div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              {item.permissions?.length && (
                <details className="text-xs">
                  <summary>Requested permissions</summary>
                  <ul className="mt-2 list-inside list-disc">
                    {item.permissions.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </details>
              )}
              {item.connected ? (
                <Popconfirm
                  trigger="Disconnect"
                  title={`Disconnect ${item.name}?`}
                  onConfirm={() => onDisconnect(item.id)}
                />
              ) : (
                <AsyncAction
                  variant="outline"
                  onAction={() => onConnect(item.id)}
                >
                  Connect {item.name}
                </AsyncAction>
              )}
            </section>
          ))}
        </div>
      )}
    </AppSection>
  )
}
export type ApiKeyItem = {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed?: string
}
export function ApiKeysPanel({
  keys,
  onCreate,
  onRevoke,
}: {
  keys: ApiKeyItem[]
  onCreate: (name: string) => Promise<{ secret: string }>
  onRevoke: (id: string) => void | Promise<void>
}) {
  const [secret, setSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  return (
    <AppSection
      title="API keys"
      description="Use keys to connect your services. Keep them private."
    >
      <AppForm
        fields={[{ name: "name", label: "Key name", required: true }]}
        submitLabel="Create key"
        onSubmit={async (v) => {
          const result = await onCreate(v.name ?? "")
          setSecret(result.secret)
          setCopied(false)
        }}
        successMessage=""
      />
      {secret && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm">
            Copy this key now. It will not be shown again after you close this
            panel.
          </p>
          <code className="block rounded bg-muted p-3 text-sm break-all">
            {secret}
          </code>
          <div className="flex gap-2">
            <AsyncAction
              variant="outline"
              onAction={async () => {
                await navigator.clipboard.writeText(secret)
                setCopied(true)
              }}
            >
              {copied ? "Copied" : "Copy key"}
            </AsyncAction>
            <Button variant="ghost" onClick={() => setSecret(null)}>
              Hide key
            </Button>
          </div>
        </div>
      )}
      <ul className="divide-y">
        {keys.map((key) => (
          <li
            key={key.id}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div>
              <p className="text-sm font-medium">{key.name}</p>
              <p className="text-xs text-muted-foreground">
                {key.prefix}•••• · Created {key.created}
                {key.lastUsed ? ` · Last used ${key.lastUsed}` : ""}
              </p>
            </div>
            <Popconfirm
              trigger="Revoke key"
              title={`Revoke ${key.name}?`}
              onConfirm={() => onRevoke(key.id)}
            />
          </li>
        ))}
      </ul>
    </AppSection>
  )
}
export function WebhooksPanel({
  endpoints,
  deliveries,
  onCreate,
  onDelete,
  onRetry,
}: {
  endpoints: { id: string; url: string; events: string[] }[]
  deliveries: {
    id: string
    event: string
    time: string
    status: "success" | "failed" | "pending"
  }[]
  onCreate: (values: { url: string; events: string[] }) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  onRetry: (id: string) => void | Promise<void>
}) {
  return (
    <AppSection title="Webhooks">
      <AppForm
        fields={[
          { name: "url", label: "Endpoint URL", type: "url", required: true },
          {
            name: "events",
            label: "Events",
            required: true,
            description: "Separate event names with commas.",
          },
        ]}
        submitLabel="Add endpoint"
        onSubmit={(v) =>
          onCreate({
            url: v.url ?? "",
            events: (v.events ?? "")
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean),
          })
        }
      />
      <ul className="divide-y">
        {endpoints.map((e) => (
          <li
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm break-all">{e.url}</p>
              <p className="text-xs text-muted-foreground">
                {e.events.join(", ")}
              </p>
            </div>
            <Popconfirm
              trigger="Delete endpoint"
              title="Delete this endpoint?"
              onConfirm={() => onDelete(e.id)}
            />
          </li>
        ))}
      </ul>
      <h3 className="font-semibold">Delivery log</h3>
      <ul className="divide-y">
        {deliveries.map((d) => (
          <li key={d.id} className="flex flex-wrap justify-between gap-3 py-3">
            <div>
              <p className="text-sm">
                {d.event} · {d.status}
              </p>
              <p className="text-xs text-muted-foreground">{d.time}</p>
            </div>
            {d.status === "failed" && (
              <AsyncAction
                size="sm"
                variant="outline"
                onAction={() => onRetry(d.id)}
              >
                Retry delivery
              </AsyncAction>
            )}
          </li>
        ))}
      </ul>
    </AppSection>
  )
}
