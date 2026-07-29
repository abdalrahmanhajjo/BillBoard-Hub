'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CreateBillboardForm } from '@/client/features/billboards/components/create-billboard-form';

export function CreateBillboardPage() {
  const router = useRouter();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href="/user/admin/billboards"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to inventory
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Add billboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new billboard inventory record. Choose <strong>Static</strong> or{' '}
          <strong>Digital</strong> under Type.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
        <CreateBillboardForm onCreated={() => router.push('/user/admin/billboards')} />
      </div>
    </section>
  );
}
