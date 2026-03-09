import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return (
    <main className="page-wrap px-4 pb-12 pt-14">
      <Card className="island-shell rise-in mx-auto max-w-2xl border border-(--line) bg-[color-mix(in_oklab,var(--surface-strong)_84%,white_16%)] shadow-[0_22px_44px_rgba(30,90,72,0.12)]">
        <CardHeader>
          <CardTitle>Login route ready</CardTitle>
          <CardDescription>
            Registration now redirects here after a successful account creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-(--sea-ink-soft)">
          <p>
            This route exists so the signup flow has a real destination. The
            external NestJS registration endpoint is now wired, but your final
            sign-in experience still depends on how you want to connect login to
            that backend.
          </p>
          <p>
            If you want the next step, implement the login mutation here against
            the same backend or replace this route with the final auth screen.
          </p>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t border-(--line)">
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
        </CardFooter>
      </Card>
    </main>
  )
}