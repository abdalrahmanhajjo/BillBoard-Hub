import Link from "next/link";
import { RegisterForm } from "@/client/features/auth/components/register-form";

export function RegisterFeaturePage() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="text-zinc-600">Register as an advertiser dashboard user.</p>
        </header>

        <RegisterForm />

        <p className="text-center text-sm text-zinc-600">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
