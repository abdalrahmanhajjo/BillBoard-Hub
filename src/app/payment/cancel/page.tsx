import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h1 className="text-3xl font-semibold text-zinc-950">Payment canceled</h1>
        <p className="mt-2 text-zinc-600">You can retry the payment when you are ready.</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard/advertiser/bookings"
            className="rounded-xl bg-zinc-950 px-4 py-2 text-white"
          >
            Retry payment
          </Link>
          <Link
            href="/billboards"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-zinc-900"
          >
            Back to billboards
          </Link>
        </div>
      </div>
    </main>
  );
}
