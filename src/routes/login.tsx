import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowRightIcon, LogInIcon } from 'lucide-react'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'

const loginSchema = z.object({
  email: z.email('Enter a valid email address.').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

const loginResponseSchema = z.object({
  accessToken: z.string(),
})

type LoginFormValues = z.infer<typeof loginSchema>

const loginUser = createServerFn({
  method: 'POST',
})
  .inputValidator((data: LoginFormValues) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const serverUrl = process.env.SERVER_URL

    if (!serverUrl) {
      throw new Error('SERVER_URL is not configured for login requests.')
    }

    const response = await fetch(new URL('/auth/login', serverUrl), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      throw new Error(getApiErrorMessage(payload, response.status))
    }

    return loginResponseSchema.parse(payload)
  })

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const mutation = useMutation({
    mutationKey: ['login-user'],
    mutationFn: (value: LoginFormValues) => loginUser({ data: value }),
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } satisfies LoginFormValues,
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  return (
    <main className="page-wrap px-4 pb-12 pt-14">
      <Card className="island-shell rise-in mx-auto max-w-2xl border border-(--line) bg-[color-mix(in_oklab,var(--surface-strong)_84%,white_16%)] shadow-[0_22px_44px_rgba(30,90,72,0.12)]">
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>
            Submit your email and password to the external NestJS auth login
            endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched ||
                      form.state.submissionAttempts > 0) &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        placeholder="user@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>
                        Use the same email you registered with.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError
                          errors={toFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    (field.state.meta.isTouched ||
                      form.state.submissionAttempts > 0) &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
                        placeholder="123456789"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>
                        This request is sent to <code>/auth/login</code> on the
                        configured backend.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError
                          errors={toFieldErrors(field.state.meta.errors)}
                        />
                      )}
                    </Field>
                  )
                }}
              />

              {mutation.isError && (
                <Field data-invalid>
                  <FieldError>{getMutationErrorMessage(mutation.error)}</FieldError>
                </Field>
              )}
            </FieldGroup>
          </form>

          {mutation.isSuccess && (
            <div className="rounded-xl border border-(--line) bg-[color-mix(in_oklab,var(--surface-strong)_84%,white_16%)] p-4">
              <p className="mb-2 text-sm font-medium text-(--sea-ink)">
                Access token received
              </p>
              <pre className="overflow-x-auto text-xs text-(--sea-ink-soft)">
{mutation.data.accessToken}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 border-t border-(--line)">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting || mutation.isPending}
                onClick={() => void form.handleSubmit()}
              >
                <LogInIcon data-icon="inline-start" />
                {isSubmitting || mutation.isPending ? 'Logging in...' : 'Log in'}
              </Button>
            )}
          </form.Subscribe>

          <div className="flex items-center justify-between gap-3">
          <Link
            to="/signup"
            className="text-sm font-medium text-(--lagoon-deep) underline underline-offset-4"
          >
            Back to signup
          </Link>
          <Button render={<Link to="/demo/better-auth" />}>
            Review current auth demo
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}

function toFieldErrors(errors: unknown[]) {
  return errors.flatMap((error) => {
    if (typeof error === 'string') {
      return [{ message: error }]
    }

    if (error instanceof Error) {
      return [{ message: error.message }]
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return [{ message: error.message }]
    }

    return []
  })
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to log in right now.'
}

function getApiErrorMessage(payload: unknown, status: number) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error
  }

  return `Login request failed with status ${status}.`
}