"use client"
import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@ankvale/ui/components/button"
import {
  AppSection,
  AppForm,
  AsyncAction,
  type AppFormValues,
  type AppAction,
} from "@ankvale/ui/blocks/app-shared"
export function AuthPanel({
  mode = "sign-in",
  onSubmit,
  socialActions,
  forgotPasswordHref,
  terms,
  minimumPasswordLength = 8,
}: {
  mode?: "sign-in" | "sign-up"
  onSubmit: (values: {
    email: string
    password: string
    name?: string
  }) => void | Promise<void>
  socialActions?: ReactNode
  forgotPasswordHref?: string
  terms?: ReactNode
  minimumPasswordLength?: number
}) {
  return (
    <AppSection
      title={mode === "sign-in" ? "Sign in" : "Create your account"}
      className="mx-auto max-w-md"
    >
      {socialActions && <div className="grid gap-2">{socialActions}</div>}
      <AppForm
        fields={[
          ...(mode === "sign-up"
            ? [
                {
                  name: "name",
                  label: "Full name",
                  required: true,
                  autoComplete: "name",
                },
              ]
            : []),
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
            minLength: mode === "sign-up" ? minimumPasswordLength : undefined,
            autoComplete:
              mode === "sign-in" ? "current-password" : "new-password",
          },
        ]}
        onSubmit={(values) =>
          onSubmit({
            email: values.email ?? "",
            password: values.password ?? "",
            ...(mode === "sign-up" ? { name: values.name } : {}),
          })
        }
        submitLabel={mode === "sign-in" ? "Sign in" : "Create account"}
        successMessage="Request accepted."
      >
        {forgotPasswordHref && mode === "sign-in" && (
          <a
            href={forgotPasswordHref}
            className="inline-block text-sm text-primary hover:underline"
          >
            Forgot password?
          </a>
        )}
        {terms}
      </AppForm>
    </AppSection>
  )
}
export function PasswordRecovery({
  mode = "request",
  expired = false,
  onSubmit,
  onRequestNew,
}: {
  mode?: "request" | "reset"
  expired?: boolean
  onSubmit: (value: string) => void | Promise<void>
  onRequestNew?: AppAction
}) {
  const [sent, setSent] = useState(false)
  if (expired)
    return (
      <AppSection title="This reset link has expired">
        <p className="text-sm text-muted-foreground">
          Request a new link to continue.
        </p>
        {onRequestNew && (
          <AsyncAction onAction={onRequestNew}>Request a new link</AsyncAction>
        )}
      </AppSection>
    )
  return (
    <AppSection
      title={
        mode === "request" ? "Reset your password" : "Choose a new password"
      }
      className="mx-auto max-w-md"
    >
      {sent ? (
        <p role="status" className="text-sm">
          {mode === "request"
            ? "If an account matches this email, a reset link has been sent."
            : "Your password has been updated."}
        </p>
      ) : (
        <AppForm
          fields={[
            mode === "request"
              ? {
                  name: "email",
                  label: "Email",
                  type: "email",
                  required: true,
                  autoComplete: "email",
                }
              : {
                  name: "password",
                  label: "New password",
                  type: "password",
                  required: true,
                  minLength: 8,
                  autoComplete: "new-password",
                },
          ]}
          submitLabel={
            mode === "request" ? "Send reset link" : "Update password"
          }
          onSubmit={async (values) => {
            await onSubmit(
              values[mode === "request" ? "email" : "password"] ?? ""
            )
            setSent(true)
          }}
        />
      )}
    </AppSection>
  )
}
export function VerificationPanel({
  onVerify,
  onResend,
  recoveryCodes,
  initialCooldown = 0,
}: {
  onVerify: (code: string, recovery: boolean) => void | Promise<void>
  onResend: AppAction
  recoveryCodes?: string[]
  initialCooldown?: number
}) {
  const [recovery, setRecovery] = useState(false)
  const [cooldown, setCooldown] = useState(initialCooldown)
  const [resendError, setResendError] = useState(false)
  const [resending, setResending] = useState(false)
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((v) => Math.max(0, v - 1)), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])
  return (
    <AppSection title="Verify your identity" className="mx-auto max-w-md">
      <AppForm
        key={String(recovery)}
        fields={[
          {
            name: "code",
            label: recovery ? "Recovery code" : "Verification code",
            required: true,
            autoComplete: recovery ? "off" : "one-time-code",
          },
        ]}
        submitLabel="Verify"
        onSubmit={(values) => onVerify(values.code ?? "", recovery)}
        successMessage="Verification accepted."
      />
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => setRecovery((v) => !v)}>
          {recovery ? "Use verification code" : "Use recovery code"}
        </Button>
        <Button
          variant="outline"
          disabled={cooldown > 0 || resending}
          onClick={async () => {
            setResending(true)
            setResendError(false)
            try {
              await onResend()
              setCooldown(30)
            } catch {
              setResendError(true)
            } finally {
              setResending(false)
            }
          }}
        >
          {resending
            ? "Sending…"
            : cooldown
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </Button>
      </div>
      {resendError && (
        <p role="alert" className="text-sm text-destructive">
          Could not resend. Try again.
        </p>
      )}
      {recoveryCodes && (
        <details className="text-sm">
          <summary>View recovery codes</summary>
          <ul className="mt-3 space-y-2 font-mono">
            {recoveryCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Store these codes securely. Each code can only be used once.
          </p>
        </details>
      )}
    </AppSection>
  )
}
export type OnboardingDraft = {
  workspace: string
  company: string
  emails: string
  step?: number
}
export function OrganizationOnboarding({
  initialDraft = { workspace: "", company: "", emails: "" },
  onDraftChange,
  onComplete,
  onJoin,
}: {
  initialDraft?: OnboardingDraft
  onDraftChange?: (draft: OnboardingDraft) => void
  onComplete: (draft: OnboardingDraft) => void | Promise<void>
  onJoin?: (code: string) => void | Promise<void>
}) {
  const [draft, setDraft] = useState(initialDraft)
  const [step, setStep] = useState(initialDraft.step ?? 0)
  function update(values: AppFormValues) {
    const next = { ...draft, ...values, step }
    setDraft(next)
    onDraftChange?.(next)
  }
  return (
    <AppSection
      title="Set up your workspace"
      description={`Step ${step + 1} of 2`}
      className="mx-auto max-w-lg"
    >
      {step === 0 ? (
        <AppForm
          fields={[
            { name: "workspace", label: "Workspace name", required: true },
            { name: "company", label: "Company", required: true },
          ]}
          initialValues={{
            workspace: draft.workspace,
            company: draft.company,
            emails: draft.emails,
          }}
          onValuesChange={update}
          submitLabel="Continue"
          onSubmit={(values) => {
            const next = { ...draft, ...values, step: 1 }
            setDraft(next)
            setStep(1)
            onDraftChange?.(next)
          }}
          successMessage=""
        />
      ) : (
        <>
          <AppForm
            fields={[
              {
                name: "emails",
                label: "Invite teammates",
                type: "textarea",
                description:
                  "Enter email addresses separated by commas. Invitations are sent by your service.",
              },
            ]}
            initialValues={{
              workspace: draft.workspace,
              company: draft.company,
              emails: draft.emails,
            }}
            onValuesChange={update}
            submitLabel="Create workspace"
            onSubmit={(values) => onComplete({ ...draft, ...values, step: 1 })}
            successMessage="Workspace created."
          />
          <Button variant="ghost" onClick={() => setStep(0)}>
            Back
          </Button>
        </>
      )}
      {onJoin && (
        <details className="border-t pt-4 text-sm">
          <summary>Join an existing workspace</summary>
          <div className="mt-4">
            <AppForm
              fields={[
                { name: "code", label: "Invitation code", required: true },
              ]}
              onSubmit={(values) => onJoin(values.code ?? "")}
              submitLabel="Join workspace"
            />
          </div>
        </details>
      )}
    </AppSection>
  )
}
export type WorkspaceOption = { id: string; name: string; description?: string }
export function WorkspaceSwitcher({
  workspaces,
  value,
  onValueChange,
  onCreate,
  onJoin,
  account,
}: {
  workspaces: WorkspaceOption[]
  value: string
  onValueChange: (id: string) => void
  onCreate?: () => void
  onJoin?: () => void
  account?: ReactNode
}) {
  return (
    <AppSection title="Workspace" description={account}>
      <label className="grid gap-2 text-sm font-medium">
        Current workspace
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 font-normal"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        {onCreate && <Button onClick={onCreate}>Create workspace</Button>}
        {onJoin && (
          <Button variant="outline" onClick={onJoin}>
            Join workspace
          </Button>
        )}
      </div>
    </AppSection>
  )
}
