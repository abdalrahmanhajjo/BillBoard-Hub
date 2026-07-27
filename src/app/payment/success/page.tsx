import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
        <h1 className="text-3xl font-semibold text-emerald-900">Payment successful</h1>
        <p className="mt-2 text-emerald-800">Your booking has been confirmed.</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard/advertiser/bookings"
            className="rounded-xl bg-emerald-700 px-4 py-2 text-white"
          >
            View bookings
          </Link>
          <Link
            href="/billboards"
            className="rounded-xl border border-emerald-300 px-4 py-2 text-emerald-900"
          >
            Browse billboards
          </Link>
        </div>
      </div>
    </main>
  );
}
