import Link from 'next/link';
import { Activity, BrainCircuit, CircleDollarSign, ShieldCheck, Users } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Overview', icon: Activity },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/interventions', label: 'Interventions', icon: BrainCircuit },
  { href: '/admin/operations', label: 'Operations', icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)]"><aside className="fixed inset-y-0 left-0 hidden w-[232px] border-r border-black/10 bg-[var(--surface)] px-5 py-7 lg:block"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[var(--text-primary)] text-[var(--bg)] [font-family:var(--font-display)] text-[20px]">N</span><div><p className="[font-family:var(--font-display)] text-[22px] leading-none">NIA</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-[.18em] text-[var(--text-secondary)]">Control</p></div></div><nav className="mt-12 space-y-2" aria-label="NIA Control"><p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--text-tertiary)]">Operate</p>{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-[14px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"><Icon size={17} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav><div className="absolute bottom-7 left-5 right-5 border-t border-black/10 pt-5"><p className="text-[11px] uppercase tracking-[.14em] text-[var(--text-tertiary)]">Cost ledger</p><p className="mt-2 text-[13px] text-[var(--text-secondary)]">NOT AVAILABLE</p><div className="mt-5 flex items-center gap-2 text-[12px] text-[var(--text-secondary)]"><CircleDollarSign size={14} /> Pricing pending</div></div></aside><main className="min-h-dvh lg:pl-[232px]"><div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">{children}</div></main></div>;
}
