import Image from 'next/image';
import { CheckCircle2, Landmark, ShieldCheck, Sparkles } from 'lucide-react';

type AuthBrandPanelProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
};

const highlights = [
  {
    icon: Landmark,
    title: 'Prime billboard inventory',
    description: 'Browse high-visibility placements across premium city routes.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure reservation workflow',
    description: 'Track approvals and payments with role-based access control.',
  },
  {
    icon: CheckCircle2,
    title: 'Live campaign readiness',
    description: 'Move from request to confirmed campaign with clear status updates.',
  },
];

export function AuthBrandPanel({ title, subtitle, imageUrl, imageAlt }: AuthBrandPanelProps) {
  return (
    <aside className="relative hidden h-full overflow-hidden rounded-3xl rounded-r-none border border-blue-100 bg-linear-to-br from-blue-600 via-cyan-600 to-teal-500 p-7 text-white shadow-2xl lg:block">
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />

      <div className="animate-in fade-in slide-in-from-left-4 relative z-10 flex h-full flex-col gap-6 duration-700">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Billboard Reservation Platform
          </p>
          <h2 className="text-3xl leading-tight font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-blue-50/90">{subtitle}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 backdrop-blur-sm">
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={960}
            height={640}
            className="h-44 w-full object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-blue-950/45 via-transparent to-transparent" />
        </div>

        <div className="grid gap-3">
          {highlights.map((item, index) => (
            <div
              key={item.title}
              className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm duration-700"
              style={{ animationDelay: `${120 + index * 120}ms` }}
            >
              <div className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-blue-50/85">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
