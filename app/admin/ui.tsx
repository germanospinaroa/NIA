'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export function AdminHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <header className="mb-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[var(--accent)]">{eyebrow}</p><h1 className="mt-3 max-w-[760px] text-[36px] leading-[1.02] tracking-[-.03em] [font-family:var(--font-display)] sm:text-[48px]">{title}</h1>{description && <p className="mt-3 max-w-[620px] text-[15px] leading-6 text-[var(--text-secondary)]">{description}</p>}</div>{actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}</header>;
}

export function PeriodFilter({ value, onChange, from, to, onDatesChange }: { value: string; onChange: (value: string) => void; from?: string; to?: string; onDatesChange?: (from: string, to: string) => void }) {
  return <div className="flex flex-wrap items-center gap-2" aria-label="Periodo"><span className="mr-1 text-[12px] font-semibold uppercase tracking-[.12em] text-[var(--text-tertiary)]">Period</span>{[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['custom', 'Custom']].map(([key, label]) => <button key={key} type="button" onClick={() => onChange(key)} className={`rounded-[12px] border px-3 py-2 text-[12px] font-semibold transition-colors ${value === key ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg)]' : 'border-black/10 bg-[var(--surface)] text-[var(--text-secondary)] hover:border-black/25'}`}>{label}</button>)}{value === 'custom' && onDatesChange && <span className="flex items-center gap-2"><input aria-label="From" type="date" value={from ?? ''} onChange={event => onDatesChange(event.target.value, to ?? '')} className="rounded-[10px] border border-black/10 bg-[var(--surface)] px-2 py-2 text-[12px]" /><input aria-label="To" type="date" value={to ?? ''} onChange={event => onDatesChange(from ?? '', event.target.value)} className="rounded-[10px] border border-black/10 bg-[var(--surface)] px-2 py-2 text-[12px]" /></span>}</div>;
}

export function MetricCard({ label, value, note, accent = false }: { label: string; value: string | number; note?: string; accent?: boolean }) {
  return <article className={`min-h-[132px] rounded-[20px] border p-5 ${accent ? 'border-[var(--accent)]/35 bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))]' : 'border-black/10 bg-[var(--surface)]'}`}><p className="text-[12px] font-semibold uppercase tracking-[.12em] text-[var(--text-tertiary)]">{label}</p><p className="mt-6 tabular-nums text-[34px] leading-none tracking-[-.04em] [font-family:var(--font-display)]">{value}</p>{note && <p className="mt-3 text-[12px] text-[var(--text-secondary)]">{note}</p>}</article>;
}

export function SectionHeading({ title, href, action }: { title: string; href?: string; action?: React.ReactNode }) {
  return <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-[20px] tracking-[-.02em] [font-family:var(--font-display)]">{title}</h2>{href ? <Link href={href} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--accent)]">View all <ArrowUpRight size={14} /></Link> : action}</div>;
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.replaceAll('_', ' ');
  const tone = value === 'approved' || value === 'delivered' || value === 'completed' ? 'bg-[#dfe9dc] text-[#345238]' : value === 'failed' ? 'bg-[#f1ddd8] text-[#813e31]' : value === 'no_approved_intervention' || value === 'retry' ? 'bg-[#f3e8ce] text-[#775723]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]';
  return <span className={`inline-flex w-fit items-center rounded-[8px] px-2 py-1 text-[11px] font-semibold capitalize ${tone}`}>{normalized}</span>;
}

export function EmptyState({ title, detail = 'No hay registros en este periodo.' }: { title: string; detail?: string }) { return <div className="rounded-[20px] border border-dashed border-black/15 bg-[var(--surface)] p-8 text-center"><p className="[font-family:var(--font-display)] text-[22px]">{title}</p><p className="mt-2 text-[13px] text-[var(--text-secondary)]">{detail}</p></div>; }

export function TablePager({ offset, limit, total, onChange }: { offset: number; limit: number; total: number; onChange: (offset: number) => void }) {
  const page = Math.floor(offset / limit) + 1; const pages = Math.max(Math.ceil(total / limit), 1);
  return <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 text-[12px] text-[var(--text-secondary)]"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - limit))} className="grid h-8 w-8 place-items-center rounded-[9px] border border-black/10 disabled:opacity-35" aria-label="Previous page"><ChevronLeft size={15} /></button><button type="button" disabled={offset + limit >= total} onClick={() => onChange(offset + limit)} className="grid h-8 w-8 place-items-center rounded-[9px] border border-black/10 disabled:opacity-35" aria-label="Next page"><ChevronRight size={15} /></button></div></div>;
}

export function LoadingState() { return <div className="grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-[20px] bg-[var(--surface-2)]" /><div className="h-32 animate-pulse rounded-[20px] bg-[var(--surface-2)]" /><div className="h-32 animate-pulse rounded-[20px] bg-[var(--surface-2)]" /></div>; }
export function ErrorState({ message = 'No pudimos cargar esta vista.' }: { message?: string }) { return <div className="rounded-[20px] border border-[#b85d48]/30 bg-[#f5e2dd] p-5 text-[14px] text-[#713b31]">{message}</div>; }
export function RefreshButton({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-[12px] border border-black/10 bg-[var(--surface)] px-3 py-2 text-[12px] font-semibold text-[var(--text-secondary)] hover:border-black/25"><RefreshCw size={14} /> Refresh</button>; }
