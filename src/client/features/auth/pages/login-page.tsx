import Link from 'next/link';
import { LoginForm } from '@/client/features/auth/components/login-form';

export function LoginFeaturePage() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="text-zinc-600">Access your billboard dashboard.</p>
        </header>

        <LoginForm />

        <p className="text-center text-sm text-zinc-600">
          Need an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </section>
  );
}
