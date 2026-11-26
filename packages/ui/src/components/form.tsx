"use client"
import { useId, useRef, type ComponentProps, type ReactNode } from "react"
import {
  FormProvider,
  Controller,
  useFormContext,
  type FieldValues,
  type UseFormReturn,
  type SubmitHandler,
  type FieldPath,
  type ControllerProps,
} from "react-hook-form"
import { cn } from "@ankvale/ui/lib/utils"
export {
  useForm,
  useFieldArray,
  useWatch,
  useFormContext,
} from "react-hook-form"
export type FormProps<T extends FieldValues> = Omit<
  ComponentProps<"form">,
  "onSubmit"
> & {
  form: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  submitErrorMessage?: string
}
/** Submit callbacks may reject; entered values are retained and an error is announced. */
export function Form<T extends FieldValues>({
  form,
  onSubmit,
  submitErrorMessage = "Changes could not be saved. Try again.",
  children,
  className,
  ...props
}: FormProps<T>) {
  const submitting = useRef(false)
  return (
    <FormProvider {...form}>
      <form
        data-slot="form"
        noValidate
        className={cn("space-y-5", className)}
        {...props}
        onSubmit={async (event) => {
          event.preventDefault()
          if (submitting.current) return
          submitting.current = true
          try {
            await form.handleSubmit(async (values, submitEvent) => {
              form.clearErrors("root.server")
              try {
                await onSubmit(values, submitEvent)
              } catch {
                form.setError("root.server", { message: submitErrorMessage })
              }
            })(event)
          } finally {
            submitting.current = false
          }
        }}
      >
        {children}
        {form.formState.errors.root?.server?.message && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.root.server.message}
          </p>
        )}
      </form>
    </FormProvider>
  )
}
export type FormFieldProps<
  T extends FieldValues,
  N extends FieldPath<T>,
> = Omit<ControllerProps<T, N>, "control" | "render"> & {
  label: ReactNode
  description?: ReactNode
  className?: string
  render: (
    props: Parameters<ControllerProps<T, N>["render"]>[0] & {
      inputProps: {
        id: string
        "aria-invalid": boolean
        "aria-describedby": string | undefined
      }
    }
  ) => ReactNode
}
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  className,
  render,
  ...props
}: FormFieldProps<T, N>) {
  const id = useId()
  const { control } = useFormContext<T>()
  return (
    <Controller
      {...props}
      control={control}
      render={(state) => (
        <div data-slot="form-field" className={cn("space-y-2", className)}>
          <label htmlFor={id} className="block text-sm font-medium">
            {label}
          </label>
          {render({
            ...state,
            inputProps: {
              id,
              "aria-invalid": !!state.fieldState.error,
              "aria-describedby":
                [
                  description ? `${id}-description` : null,
                  state.fieldState.error ? `${id}-error` : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined,
            },
          })}
          {description && (
            <p
              id={`${id}-description`}
              className="text-xs text-muted-foreground"
            >
              {description}
            </p>
          )}
          {state.fieldState.error && (
            <p
              id={`${id}-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {state.fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}
