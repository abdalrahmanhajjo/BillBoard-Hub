import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';

export function ForgotPasswordFeaturePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Online password reset is not available yet. Contact support from the email address on your
          account and we will help you regain access.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            render={<a href="mailto:hello@boardly.com?subject=Password%20reset%20request" />}
            nativeButton={false}
            className="min-h-11 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Mail className="size-4" aria-hidden />
            Contact support
          </Button>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            className="min-h-11"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Button>
        </div>
      </section>
    </main>
  );
}
