export function BillboardDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-zinc-100 py-2 sm:flex-row sm:justify-between">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
