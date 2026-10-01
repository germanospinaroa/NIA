'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminHeader, EmptyState, ErrorState, LoadingState, PeriodFilter, RefreshButton, StatusBadge, TablePager } from '../ui';

// The operations endpoint returns different projections per selected resource.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Operation = Record<string, any>;
type Payload = { data: Operation[]; pagination: { limit: number; offset: number; total: number }; period: { label: string }; resource: string };
const date = (v?: string) => v ? new Date(v).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function Head({ resource }: { resource: string }) {
  if (resource === 'execution_runs') return <><th>Execution</th><th>Trigger</th><th>Channel</th><th>Status</th><th>Started</th><th>Duration</th><th>Failure</th></>;
  if (resource === 'event_log') return <><th>Time</th><th>Event</th><th>User</th><th>Execution</th><th>Metadata</th></>;
  if (resource === 'generation_attempts') return <><th>Attempt</th><th>Type</th><th>Model</th><th>Status</th><th>Candidates</th><th>Tokens</th><th>Duration</th></>;
  return <><th>Operation</th><th>Provider</th><th>Model</th><th>Status</th><th>Tokens</th><th>Latency</th><th>Error</th></>;
}

function Row({ resource, row }: { resource: string; row: Operation }) {
  if (resource === 'execution_runs') return <tr className="hover:bg-[var(--bg)]"><td><Link href={row.intervention_id ? `/admin/interventions/${row.intervention_id}` : `/admin/operations?execution=${row.id}`} className="font-mono text-[12px] hover:text-[var(--accent)]">{String(row.id).slice(0, 12)}…</Link><span className="mt-1 block font-mono text-[10px] text-[var(--text-tertiary)]">req {String(row.request_id).slice(0, 12)}…</span></td><td>{row.trigger_source}</td><td>{row.channel}</td><td><StatusBadge value={row.status} /></td><td>{date(row.started_at)}</td><td>{row.duration_ms ? `${row.duration_ms} ms` : '—'}</td><td className="max-w-[180px] truncate text-[#813e31]">{row.failure_code || '—'}</td></tr>;
  if (resource === 'event_log') return <tr className="hover:bg-[var(--bg)]"><td>{date(row.occurred_at)}</td><td className="font-semibold capitalize">{String(row.event_type).replaceAll('_', ' ')}</td><td className="font-mono text-[11px]">{row.user_id ? String(row.user_id).slice(0, 12) : 'System'}</td><td className="font-mono text-[11px]">{row.execution_run_id ? String(row.execution_run_id).slice(0, 12) : '—'}</td><td className="max-w-[300px] truncate">{JSON.stringify(row.metadata)}</td></tr>;
  if (resource === 'generation_attempts') return <tr className="hover:bg-[var(--bg)]"><td className="font-semibold">#{row.attempt_number}</td><td>{row.attempt_type}</td><td>{row.model || '—'}</td><td><StatusBadge value={row.status} /></td><td>{row.candidate_count} / {row.approved_candidate_count}</td><td>{row.total_tokens || '—'}</td><td>{row.duration_ms ? `${row.duration_ms} ms` : '—'}</td></tr>;
  return <tr className="hover:bg-[var(--bg)]"><td className="font-semibold">{row.operation}</td><td>{row.provider}</td><td>{row.model || '—'}</td><td><StatusBadge value={row.status} /></td><td>{row.total_tokens || '—'}</td><td>{row.latency_ms ? `${row.latency_ms} ms` : '—'}</td><td className="text-[#813e31]">{row.error_code || '—'}</td></tr>;
}

export default function AdminOperationsPage() {
  const [period, setPeriod] = useState('7d');
  const [resource, setResource] = useState('execution_runs');
  const [status, setStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [userId, setUserId] = useState('');
  const [executionId, setExecutionId] = useState('');
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams({ period, resource, limit: '25', offset: String(offset) });
    if (status && resource === 'execution_runs') query.set('status', status);
    if (eventType && resource === 'event_log') query.set('event_type', eventType);
    if (userId && (resource === 'execution_runs' || resource === 'event_log')) query.set('user_id', userId);
    if (executionId && resource !== 'execution_runs') query.set('execution_run_id', executionId);
    fetch(`/api/admin/operations?${query}`).then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); return body; }).then(setData).catch(() => setError('No pudimos cargar operaciones.')).finally(() => setLoading(false));
  }, [period, resource, status, eventType, userId, executionId, offset]);
  // Data loading is intentionally kicked off after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
  const changeResource = (value: string) => { setResource(value); setOffset(0); setStatus(''); setEventType(''); };
  return <div><AdminHeader eyebrow="NIA Control / Operations" title="Sigue cada ejecución." description={data ? `Periodo: ${data.period.label}. Execution IDs, intentos, proveedor y eventos operativos.` : 'Una lectura técnica de lo que ocurrió dentro del motor.'} actions={<><RefreshButton onClick={load} /><PeriodFilter value={period} onChange={value => { setPeriod(value); setOffset(0); }} /></>} /><div className="mb-5 flex flex-wrap gap-3"><select value={resource} onChange={event => changeResource(event.target.value)} className="rounded-[12px] border border-black/10 bg-[var(--surface)] px-3 py-2 text-[13px]"><option value="execution_runs">Executions</option><option value="event_log">Events</option><option value="generation_attempts">Attempts</option><option value="execution_provider_calls">Provider calls</option></select>{resource === 'execution_runs' && <select value={status} onChange={event => { setStatus(event.target.value); setOffset(0); }} className="rounded-[12px] border border-black/10 bg-[var(--surface)] px-3 py-2 text-[13px]"><option value="">All statuses</option><option value="started">Started</option><option value="generating">Generating</option><option value="auditing">Auditing</option><option value="approved">Approved</option><option value="no_approved_intervention">No approved</option><option value="failed">Failed</option></select>}{resource === 'event_log' && <select value={eventType} onChange={event => { setEventType(event.target.value); setOffset(0); }} className="rounded-[12px] border border-black/10 bg-[var(--surface)] px-3 py-2 text-[13px]"><option value="">All events</option><option value="intervention_approved">Approved</option><option value="no_approved_intervention">No approved</option><option value="candidate_rejected">Candidate rejected</option><option value="intervention_failed">Failed</option><option value="generation_technical_retry">Technical retry</option></select>}{resource === 'execution_runs' || resource === 'event_log' ? <input value={userId} onChange={event => { setUserId(event.target.value); setOffset(0); }} placeholder="User ID" className="w-[180px] rounded-[12px] border border-black/10 bg-[var(--surface)] px-3 py-2 text-[13px] outline-none" /> : <input value={executionId} onChange={event => { setExecutionId(event.target.value); setOffset(0); }} placeholder="Execution ID" className="w-[180px] rounded-[12px] border border-black/10 bg-[var(--surface)] px-3 py-2 text-[13px] outline-none" />}</div>{error ? <ErrorState message={error} /> : loading && !data ? <LoadingState /> : data?.data.length ? <div className="overflow-hidden rounded-[20px] border border-black/10 bg-[var(--surface)]"><div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-[13px]"><thead className="border-b border-black/10 bg-[var(--bg)] text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]"><tr><Head resource={resource} /></tr></thead><tbody className="divide-y divide-black/10">{data.data.map(row => <Row key={String(row.id)} resource={resource} row={row} />)}</tbody></table></div><TablePager offset={data.pagination.offset} limit={data.pagination.limit} total={data.pagination.total} onChange={setOffset} /></div> : <EmptyState title="No operational records" detail="Cambia el periodo o los filtros." />}</div>;
}
