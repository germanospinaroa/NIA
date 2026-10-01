'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminHeader, EmptyState, ErrorState, LoadingState, PeriodFilter, RefreshButton, StatusBadge, TablePager } from '../ui';

// The operations endpoint intentionally returns resource-specific rows.
// Keep this page tolerant of those server-side projections without weakening the API contract.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
export default function AdminErrorsPage() {
  const [period, setPeriod] = useState('7d'); const [data, setData] = useState<{ data: Row[]; pagination: { limit: number; offset: number; total: number }; period: { label: string } } | null>(null); const [offset, setOffset] = useState(0); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); fetch(`/api/admin/operations?resource=execution_runs&period=${period}&status=failed&limit=25&offset=${offset}`).then(async r => { const b = await r.json(); if (!r.ok) throw new Error(b.error); return b; }).then(setData).catch(() => setError('No pudimos cargar los errores.')).finally(() => setLoading(false)); }, [period, offset]);
  // Data loading is intentionally kicked off after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  return <div><AdminHeader eyebrow="NIA Control / Errors" title="Errores que merecen atención." description={data ? `Periodo: ${data.period.label}. Los no approved se mantienen fuera de esta lista.` : 'Fallos técnicos separados de intervenciones sin aprobación.'} actions={<><RefreshButton onClick={load} /><PeriodFilter value={period} onChange={value => { setPeriod(value); setOffset(0); }} /></>} />{error ? <ErrorState message={error} /> : loading && !data ? <LoadingState /> : data?.data.length ? <div className="overflow-hidden rounded-[20px] border border-black/10 bg-[var(--surface)]"><table className="w-full text-left text-[13px]"><thead className="border-b border-black/10 bg-[var(--bg)] text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]"><tr><th className="px-5 py-4">Started</th><th className="px-4 py-4">Execution</th><th className="px-4 py-4">Failure</th><th className="px-4 py-4">Trigger</th><th className="px-4 py-4">Status</th></tr></thead><tbody className="divide-y divide-black/10">{data.data.map(row => <tr key={row.id}><td className="px-5 py-4 text-[var(--text-secondary)]">{new Date(row.started_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td><td className="px-4 py-4"><Link href={`/admin/operations?execution=${row.id}`} className="font-mono text-[11px] hover:text-[var(--accent)]">{row.id}</Link></td><td className="px-4 py-4 font-semibold text-[#813e31]">{row.failure_code || 'unknown'}</td><td className="px-4 py-4 text-[var(--text-secondary)]">{row.trigger_source}</td><td className="px-4 py-4"><StatusBadge value={row.status} /></td></tr>)}</tbody></table><TablePager offset={data.pagination.offset} limit={data.pagination.limit} total={data.pagination.total} onChange={setOffset} /></div> : <EmptyState title="No technical failures" detail="No hay fallos de ejecución en este periodo." />}</div>;
}
