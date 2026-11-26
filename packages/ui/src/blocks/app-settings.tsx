"use client"
import { useState, type ReactNode } from "react"
import { Popconfirm } from "@ankvale/ui/components/popconfirm"
import { Result } from "@ankvale/ui/components/result"
import {
  AppSection,
  AppForm,
  AsyncAction,
  AsyncFileInput,
} from "@ankvale/ui/blocks/app-shared"
export function ProfileSettings({
  profile,
  onSave,
  avatar,
  onAvatarChange,
}: {
  profile: { name: string; email: string; bio?: string }
  onSave: (profile: {
    name: string
    email: string
    bio: string
  }) => void | Promise<void>
  avatar?: ReactNode
  onAvatarChange?: (file: File) => void | Promise<void>
}) {
  return (
    <AppSection
      title="Your profile"
      description="Manage how your name and details appear."
    >
      {avatar}
      {onAvatarChange && (
        <AsyncFileInput
          label="Profile image"
          accept="image/*"
          onFiles={(files) => onAvatarChange(files[0]!)}
        />
      )}
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
          { name: "bio", label: "Bio", type: "textarea" },
        ]}
        initialValues={{
          name: profile.name,
          email: profile.email,
          bio: profile.bio ?? "",
        }}
        onSubmit={(v) =>
          onSave({ name: v.name ?? "", email: v.email ?? "", bio: v.bio ?? "" })
        }
      />
    </AppSection>
  )
}
export function WorkspaceSettings({
  workspace,
  onSave,
  branding,
  dangerZone,
}: {
  workspace: { name: string; email: string; website?: string; timeZone: string }
  onSave: (workspace: {
    name: string
    email: string
    website: string
    timeZone: string
  }) => void | Promise<void>
  branding?: ReactNode
  dangerZone?: ReactNode
}) {
  return (
    <AppSection title="Workspace settings">
      {branding}
      <AppForm
        fields={[
          { name: "name", label: "Workspace name", required: true },
          {
            name: "email",
            label: "Contact email",
            type: "email",
            required: true,
          },
          { name: "website", label: "Website", type: "url" },
          { name: "timeZone", label: "Time zone", required: true },
        ]}
        initialValues={{ ...workspace, website: workspace.website ?? "" }}
        onSubmit={(v) =>
          onSave({
            name: v.name ?? "",
            email: v.email ?? "",
            website: v.website ?? "",
            timeZone: v.timeZone ?? "",
          })
        }
      />
      {dangerZone}
    </AppSection>
  )
}
export type WorkspaceMember = {
  id: string
  name: string
  email: string
  role: string
  status?: "active" | "invited"
}
export function MembersPanel({
  members,
  roles,
  onInvite,
  onRoleChange,
  onRemove,
  onRevoke,
  canManage = true,
}: {
  members: WorkspaceMember[]
  roles: { id: string; label: string }[]
  onInvite: (email: string, role: string) => void | Promise<void>
  onRoleChange: (id: string, role: string) => void | Promise<void>
  onRemove: (id: string) => void | Promise<void>
  onRevoke?: (id: string) => void | Promise<void>
  canManage?: boolean
}) {
  return (
    <AppSection title="Members" description="Manage access to this workspace.">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="p-3 text-start font-medium">Member</th>
              <th className="p-3 text-start font-medium">Role</th>
              <th className="p-3 text-start font-medium">Status</th>
              <th className="p-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b">
                <td className="p-3">
                  <p>{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </td>
                <td className="p-3">
                  <MemberRole
                    member={member}
                    roles={roles}
                    onChange={onRoleChange}
                    disabled={!canManage}
                  />
                </td>
                <td className="p-3">{member.status ?? "active"}</td>
                <td className="p-3">
                  {canManage && (
                    <Popconfirm
                      trigger={
                        member.status === "invited" ? "Revoke invite" : "Remove"
                      }
                      title={
                        member.status === "invited"
                          ? `Revoke invitation for ${member.email}?`
                          : `Remove ${member.name}?`
                      }
                      onConfirm={() =>
                        member.status === "invited" && onRevoke
                          ? onRevoke(member.id)
                          : onRemove(member.id)
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!members.length && (
          <p className="py-6 text-sm text-muted-foreground">No members yet.</p>
        )}
      </div>
      {canManage && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">
            Invite a teammate
          </summary>
          <div className="mt-4">
            <AppForm
              fields={[
                {
                  name: "email",
                  label: "Email address",
                  type: "email",
                  required: true,
                },
                {
                  name: "role",
                  label: "Role",
                  type: "select",
                  required: true,
                  options: roles.map((r) => ({ value: r.id, label: r.label })),
                },
              ]}
              onSubmit={(v) => onInvite(v.email ?? "", v.role ?? "")}
              submitLabel="Send invitation"
              successMessage="Invitation sent."
            />
          </div>
        </details>
      )}
    </AppSection>
  )
}
function MemberRole({
  member,
  roles,
  onChange,
  disabled,
}: {
  member: WorkspaceMember
  roles: { id: string; label: string }[]
  onChange: (id: string, role: string) => void | Promise<void>
  disabled: boolean
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  return (
    <div className="space-y-1">
      <select
        aria-label={`Role for ${member.name}`}
        value={member.role}
        disabled={disabled || pending}
        className="rounded border bg-background px-2 py-1"
        onChange={async (e) => {
          const role = e.target.value
          setPending(true)
          setError(false)
          try {
            await onChange(member.id, role)
          } catch {
            setError(true)
          } finally {
            setPending(false)
          }
        }}
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          Could not change role.
        </p>
      )}
    </div>
  )
}
export function PermissionsEditor({
  roles,
  permissions,
  grants,
  onChange,
  onSave,
  canManage = true,
  inherited = {},
}: {
  roles: { id: string; label: string }[]
  permissions: { id: string; label: string; description?: string }[]
  grants: Record<string, string[]>
  onChange: (grants: Record<string, string[]>) => void
  onSave: (grants: Record<string, string[]>) => void | Promise<void>
  canManage?: boolean
  inherited?: Record<string, string[]>
}) {
  if (!canManage)
    return (
      <Result
        status="permission"
        title="Permission required"
        description="Ask a workspace administrator to manage roles."
      />
    )
  return (
    <AppSection title="Roles and permissions">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-start font-medium">Permission</th>
              {roles.map((r) => (
                <th key={r.id} className="p-3 font-medium">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id} className="border-b">
                <th className="p-3 text-start font-normal">
                  <p>{permission.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {permission.description}
                  </p>
                </th>
                {roles.map((role) => (
                  <td key={role.id} className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      aria-label={`${permission.label} for ${role.label}`}
                      checked={
                        !!grants[role.id]?.includes(permission.id) ||
                        !!inherited[role.id]?.includes(permission.id)
                      }
                      disabled={inherited[role.id]?.includes(permission.id)}
                      title={
                        inherited[role.id]?.includes(permission.id)
                          ? "Inherited permission"
                          : undefined
                      }
                      onChange={(e) =>
                        onChange({
                          ...grants,
                          [role.id]: e.target.checked
                            ? [...(grants[role.id] ?? []), permission.id]
                            : (grants[role.id] ?? []).filter(
                                (id) => id !== permission.id
                              ),
                        })
                      }
                    />
                    {inherited[role.id]?.includes(permission.id) && (
                      <span className="block text-xs text-muted-foreground">
                        Inherited
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AsyncAction onAction={() => onSave(grants)}>
        Save permissions
      </AsyncAction>
    </AppSection>
  )
}
export function SecuritySettings({
  sessions,
  onChangePassword,
  mfa,
  onRevokeSession,
}: {
  sessions: {
    id: string
    device: string
    lastActive: string
    current?: boolean
  }[]
  onChangePassword: (values: {
    currentPassword: string
    newPassword: string
  }) => void | Promise<void>
  mfa?: ReactNode
  onRevokeSession: (id: string) => void | Promise<void>
}) {
  return (
    <AppSection title="Security">
      <div className="max-w-md">
        <AppForm
          fields={[
            {
              name: "currentPassword",
              label: "Current password",
              type: "password",
              required: true,
              autoComplete: "current-password",
            },
            {
              name: "newPassword",
              label: "New password",
              type: "password",
              required: true,
              minLength: 8,
              autoComplete: "new-password",
            },
          ]}
          submitLabel="Update password"
          onSubmit={(v) =>
            onChangePassword({
              currentPassword: v.currentPassword ?? "",
              newPassword: v.newPassword ?? "",
            })
          }
        />
      </div>
      {mfa}
      <div className="space-y-3 border-t pt-5">
        <h3 className="text-sm font-semibold">Active sessions</h3>
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
          >
            <div>
              <p className="text-sm">
                {s.device}
                {s.current ? " · This device" : ""}
              </p>
              <p className="text-xs text-muted-foreground">{s.lastActive}</p>
            </div>
            {!s.current && (
              <AsyncAction
                variant="outline"
                size="sm"
                onAction={() => onRevokeSession(s.id)}
              >
                Revoke session
              </AsyncAction>
            )}
          </div>
        ))}
      </div>
    </AppSection>
  )
}
export function NotificationPreferences({
  categories,
  channels,
  value,
  onChange,
  onSave,
}: {
  categories: { id: string; label: string }[]
  channels: { id: string; label: string }[]
  value: Record<string, string[]>
  onChange: (value: Record<string, string[]>) => void
  onSave: (value: Record<string, string[]>) => void | Promise<void>
}) {
  return (
    <AppSection title="Notification preferences">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-start">Category</th>
              {channels.map((c) => (
                <th key={c.id} className="p-3">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b">
                <th className="p-3 text-start font-normal">{category.label}</th>
                {channels.map((channel) => (
                  <td key={channel.id} className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      aria-label={`${category.label} by ${channel.label}`}
                      checked={
                        value[category.id]?.includes(channel.id) ?? false
                      }
                      onChange={(e) =>
                        onChange({
                          ...value,
                          [category.id]: e.target.checked
                            ? [...(value[category.id] ?? []), channel.id]
                            : (value[category.id] ?? []).filter(
                                (id) => id !== channel.id
                              ),
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AsyncAction onAction={() => onSave(value)}>Save preferences</AsyncAction>
    </AppSection>
  )
}
