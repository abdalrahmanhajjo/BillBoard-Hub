import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">BillBoard Hub</h1>
        <p className="max-w-2xl text-zinc-600">
          Manage billboard inventory, bookings, approvals, and payments in one place.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-xl bg-zinc-950 px-4 py-2 text-white">
            Sign in
          </Link>
          <Link href="/billboards" className="rounded-xl border border-zinc-300 px-4 py-2">
            Browse billboards
          </Link>
        </div>
      </div>
    </main>
  );
}
