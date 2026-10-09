'use client';

import { AlertTriangle, CheckCircle2, FlaskConical, Send } from 'lucide-react';
import { useState } from 'react';

type CandidateSummary = { id?: string; topic: string | null; concept: string | null; angle: string | null; intervention_type: string | null; depth: string | null; candidate_text?: string | null; validation?: string; rejection_reason?: string | null };
type QaTraceStage = { stage: string; status: string; evidence: string[] };
type Result = {
  status: string;
  editorial_status?: string;
  downstream_status?: string;
  synthetic_downstream?: boolean;
  execution_run_id?: string;
  generation?: { calls?: number; candidates?: number; approved?: number; rejected?: number; candidate_summaries?: CandidateSummary[] };
  editorial?: { strategy?: string | null; topic?: string | null; intervention_type?: string | null; depth?: string | null } | null;
  psychological_contract?: { situation?: string; observable_pattern?: string; mechanism_id?: string; psychological_move?: string; expected_movement?: string; sufficient?: boolean; why_now?: string } | null;
  failure_stage?: string;
  intervention_id?: string | null;
  delivery_id?: string | null;
  evolution?: { accepted?: boolean; provider_message_id_present?: boolean };
  qa_trace?: { execution_id?: string; status?: string; failure_code?: string | null; error?: string | null; editorial_status?: string; downstream_status?: string; stages?: QaTraceStage[]; provider_calls?: string[] };
};
type ButtonsResult = { status?: string; provider_message_id?: string | null; provider_message_id_present?: boolean; reason?: string; error?: string };

function readableError(code: string) {
  if (code === 'whatsapp_not_connected') return 'Este usuario no tiene WhatsApp conectado y habilitado.';
  if (code === 'qa_execution_in_progress') return 'Ya hay una prueba QA ejecutándose para este usuario. Espera a que termine.';
  if (code === 'forbidden') return 'No tienes permisos para ejecutar esta prueba.';
  const safeCodes = new Set(['invalid_json', 'invalid_user_id', 'user_not_found', 'qa_execution_unavailable', 'qa_execution_failed']);
  return safeCodes.has(code) ? 'La prueba no pudo ejecutarse. Código: ' + code + '.' : 'La prueba no pudo ejecutarse. Revisa el detalle técnico del administrador.';
}

function readableButtonsError(code: string) {
  if (code === 'whatsapp_not_connected') return 'Este usuario no tiene WhatsApp conectado y habilitado.';
  if (code === 'forbidden') return 'No tienes permisos para ejecutar esta prueba.';
  if (code === 'not_configured') return 'El proveedor de WhatsApp no está configurado en Production.';
  return `La prueba de botones no pudo ejecutarse. Código: ${code}.`;
}

function QaTraceView({ trace }: { trace?: Result['qa_trace'] }) {
  if (!trace) return null;
  return <div className="mt-4 rounded-[12px] border border-black/10 bg-[var(--bg)] p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[var(--text-tertiary)]">Cadena y evidencia</p>
    <p className="mt-2 text-[12px] text-[var(--text-secondary)]">Execution <span className="font-mono">{trace.execution_id || 'NOT AVAILABLE'}</span> · status <strong>{trace.status || 'NOT AVAILABLE'}</strong> · editorial <strong>{trace.editorial_status || 'NOT AVAILABLE'}</strong> · downstream <strong>{trace.downstream_status || 'NOT AVAILABLE'}</strong> · failure <span className="font-mono">{trace.failure_code || 'none'}</span></p>
    {trace.error && <p className="mt-2 text-[12px] text-[#813e31]">{trace.error}</p>}
    <div className="mt-3 overflow-x-auto rounded-[10px] border border-black/10">
      <table className="w-full min-w-[640px] text-left text-[12px]"><thead className="bg-[var(--surface)] text-[10px] uppercase tracking-[.1em] text-[var(--text-tertiary)]"><tr><th className="px-3 py-2">Etapa</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Evidencia</th></tr></thead><tbody className="divide-y divide-black/10">{(trace.stages ?? []).map(stage => <tr key={stage.stage}><td className="px-3 py-2 font-semibold">{stage.stage}</td><td className="px-3 py-2">{stage.status}</td><td className="px-3 py-2 text-[var(--text-secondary)]">{stage.evidence.length ? stage.evidence.join(' · ') : 'NOT AVAILABLE'}</td></tr>)}</tbody></table>
    </div>
  </div>;
}

export default function QaRealControl({ userId, userEmail, whatsappStatus }: { userId: string; userEmail: string | null; whatsappStatus: string }) {
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [buttonsConfirming, setButtonsConfirming] = useState(false);
  const [buttonsRunning, setButtonsRunning] = useState(false);
  const [buttonsResult, setButtonsResult] = useState<ButtonsResult | null>(null);
  const [buttonsError, setButtonsError] = useState('');

  async function runOnce() {
    if (running) return;
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/admin/qa/daily-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const body = await response.json() as Result & { error?: string };
      setResult({ ...body, editorial_status: body.editorial_status ?? 'NOT AVAILABLE' });
      if (!response.ok) throw new Error(body.error || 'qa_execution_failed');
      setConfirming(false);
    } catch (reason) {
      setError(readableError(reason instanceof Error ? reason.message : 'qa_execution_failed'));
      setConfirming(false);
    } finally {
      setRunning(false);
    }
  }

  async function testButtons() {
    if (buttonsRunning || buttonsResult) return;
    setButtonsRunning(true);
    setButtonsError('');
    try {
      const response = await fetch('/api/admin/qa/whatsapp-buttons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId }) });
      const body = await response.json() as ButtonsResult;
      if (!response.ok) throw new Error(body.error || body.reason || 'whatsapp_buttons_failed');
      setButtonsResult(body);
      setButtonsConfirming(false);
    } catch (reason) {
      setButtonsError(readableButtonsError(reason instanceof Error ? reason.message : 'whatsapp_buttons_failed'));
      setButtonsConfirming(false);
    } finally {
      setButtonsRunning(false);
    }
  }

  const candidates = result?.generation?.candidate_summaries ?? [];
  return <section className="rounded-[20px] border border-[var(--accent)]/30 bg-[color-mix(in_oklab,var(--accent)_6%,var(--surface))] p-5" aria-labelledby="qa-real-title">
    <div className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--accent)]/12 text-[var(--accent)]"><FlaskConical size={19} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[var(--accent)]">QA interna</p>
        <h2 id="qa-real-title" className="mt-2 text-[24px] tracking-[-.02em] [font-family:var(--font-display)]">Ejecutar QA completa</h2>
        <p className="mt-2 max-w-[680px] text-[13px] leading-5 text-[var(--text-secondary)]">Recorre el carril editorial para {userEmail || 'este usuario'} y, si no hay una candidata aprobada, comprueba el downstream con un fixture QA claramente marcado. Puede enviar un WhatsApp. Solo se ejecuta una generación y no prueba el segundo slot.</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--text-secondary)]"><span>Usuario: <strong className="font-mono text-[11px]">{userId}</strong></span><span>WhatsApp: <strong>{whatsappStatus}</strong></span></div>
        {!confirming && <button type="button" disabled={running || whatsappStatus !== 'connected'} onClick={() => setConfirming(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[12px] bg-[var(--text-primary)] px-4 py-3 text-[13px] font-semibold text-[var(--bg)] transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-45"><Send size={15} /> {result ? 'Ejecutar otra QA completa' : 'Ejecutar QA completa'}</button>}
        {whatsappStatus !== 'connected' && !result && <p className="mt-3 text-[12px] text-[var(--text-secondary)]">La prueba queda deshabilitada hasta que el usuario tenga WhatsApp conectado.</p>}
      </div>
    </div>
    {confirming && <div className="mt-5 rounded-[14px] border border-black/10 bg-[var(--surface)] p-4" role="alertdialog" aria-label="Confirmar prueba real"><div className="flex gap-3"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" /><p className="text-[13px] leading-5">Esta prueba generará una intervención real y puede enviar un mensaje a WhatsApp.<br />Solo se ejecutará una generación y no se probará el segundo slot.<br /><strong>¿Quieres continuar?</strong></p></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setConfirming(false)} className="min-h-11 rounded-[12px] border border-black/10 px-4 py-3 text-[13px] font-semibold text-[var(--text-secondary)]">Cancelar</button><button type="button" onClick={runOnce} disabled={running} className="inline-flex min-h-11 items-center gap-2 rounded-[12px] bg-[var(--text-primary)] px-4 py-3 text-[13px] font-semibold text-[var(--bg)] disabled:opacity-50">{running ? 'Ejecutando prueba…' : 'Ejecutar prueba'}</button></div></div>}
    {error && <div className="mt-5 rounded-[14px] border border-[#b85d48]/30 bg-[#f5e2dd] p-4 text-[13px] text-[#713b31]" role="alert">{error}</div>}
    {result?.qa_trace && <QaTraceView trace={result.qa_trace} />}
    {result && (result.failure_stage || result.psychological_contract) && <div className="mt-4 rounded-[12px] border border-black/10 bg-[var(--bg)] p-3 text-[12px]"><p className="font-semibold">Trazabilidad editorial</p>{result.failure_stage && <p className="mt-1 text-[#813e31]">Primera etapa fallida: <strong>{result.failure_stage}</strong></p>}{result.psychological_contract && <><p className="mt-1">Contrato: <strong>{result.psychological_contract.sufficient ? 'sufficient' : 'insufficient'}</strong> · mecanismo: {result.psychological_contract.mechanism_id || 'NOT AVAILABLE'}</p><p className="mt-1 text-[var(--text-secondary)]">Movimiento: {result.psychological_contract.psychological_move || 'NOT AVAILABLE'} · expected: {result.psychological_contract.expected_movement || 'NOT AVAILABLE'}</p></>}</div>}
    {result && <div className="mt-5 space-y-4 rounded-[14px] border border-black/10 bg-[var(--surface)] p-4"><div className="flex items-center gap-2 text-[13px] font-semibold"><CheckCircle2 size={16} className="text-[#345238]" />Resultado de la QA completa</div><p className="text-[12px] text-[var(--text-secondary)]">Carril editorial: <strong>{result.editorial_status || 'approved'}</strong> · Downstream: <strong>{result.downstream_status || (result.evolution?.accepted ? 'completed' : result.status === 'success' ? 'completed' : 'not_reached')}</strong>{result.synthetic_downstream ? ' · fixture QA, no aprobación editorial' : ''}</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-[13px]"><div><p className="text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]">Planner</p><p className="mt-1">{result.editorial?.strategy || 'NOT AVAILABLE'}</p><p className="text-[12px] text-[var(--text-secondary)]">{result.editorial?.topic || 'Topic no disponible'}</p></div><div><p className="text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]">Generación</p><p className="mt-1">{result.generation?.calls ?? 0} llamadas · {result.generation?.candidates ?? 0} candidatas</p><p className="text-[12px] text-[var(--text-secondary)]">{result.generation?.approved ?? 0} aprobadas · {result.generation?.rejected ?? 0} rechazadas</p></div><div><p className="text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]">Intervention / persistencia</p><p className="mt-1 break-all font-mono text-[11px]">{result.intervention_id || 'NOT AVAILABLE'}</p><p className="text-[12px] text-[var(--text-secondary)]">Editorial y guardado QA</p></div><div><p className="text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]">Delivery</p><p className="mt-1 break-all font-mono text-[11px]">{result.delivery_id || 'NOT AVAILABLE'}</p><p className="text-[12px] text-[var(--text-secondary)]">Estado: {result.status === 'success' ? 'sent' : result.status}</p></div></div>{candidates.length > 0 && <div><p className="text-[11px] uppercase tracking-[.1em] text-[var(--text-tertiary)]">Candidatas / resumen</p><div className="mt-2 grid gap-2 md:grid-cols-3">{candidates.map((candidate, index) => <div key={candidate.id || (candidate.concept || 'candidate') + '-' + index} className="rounded-[10px] bg-[var(--bg)] p-3 text-[12px]"><p className="font-semibold">{candidate.intervention_type || 'Formato no disponible'} · {candidate.depth || 'profundidad no disponible'}</p><p className="mt-1 text-[var(--text-secondary)]">{candidate.topic || 'Topic no disponible'} · {candidate.angle || 'Ángulo no disponible'}</p><p className="mt-1 text-[#8b4b3e]">{candidate.validation}{candidate.rejection_reason ? ` · ${candidate.rejection_reason}` : ''}</p></div>)}</div></div>}<p className="text-[12px] text-[var(--text-secondary)]">Evolution accepted: <strong>{result.evolution?.accepted ? 'YES' : 'NO'}</strong> · WhatsApp delivery: <strong>{result.evolution?.accepted ? 'SENT' : 'NOT REACHED / FAILED'}</strong></p></div>}
    <div className="mt-6 border-t border-black/10 pt-6" aria-labelledby="qa-buttons-title">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--bg)] text-[var(--text-secondary)]"><Send size={17} /></div>
        <div className="min-w-0 flex-1">
          <h2 id="qa-buttons-title" className="text-[20px] tracking-[-.02em] [font-family:var(--font-display)]">Prueba de botones WhatsApp</h2>
          <p className="mt-2 max-w-[680px] text-[13px] leading-5 text-[var(--text-secondary)]">Envía un único mensaje de prueba a WhatsApp con hasta 3 botones. No genera una intervención de NIA ni consume OpenAI.</p>
          {!buttonsConfirming && !buttonsResult && <button type="button" disabled={buttonsRunning || whatsappStatus !== 'connected'} onClick={() => setButtonsConfirming(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-black/15 bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-45"><Send size={15} /> Probar botones WhatsApp</button>}
          {whatsappStatus !== 'connected' && !buttonsResult && <p className="mt-3 text-[12px] text-[var(--text-secondary)]">La prueba queda deshabilitada hasta que el usuario tenga WhatsApp conectado.</p>}
        </div>
      </div>
      {buttonsConfirming && <div className="mt-5 rounded-[14px] border border-black/10 bg-[var(--surface)] p-4" role="alertdialog" aria-label="Confirmar prueba de botones"><div className="flex gap-3"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" /><p className="text-[13px] leading-5">Se enviará un único mensaje de prueba a tu WhatsApp. No generará una intervención ni consumirá OpenAI.<br /><strong>¿Continuar?</strong></p></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setButtonsConfirming(false)} className="min-h-11 rounded-[12px] border border-black/10 px-4 py-3 text-[13px] font-semibold text-[var(--text-secondary)]">Cancelar</button><button type="button" onClick={testButtons} disabled={buttonsRunning} className="min-h-11 rounded-[12px] bg-[var(--text-primary)] px-4 py-3 text-[13px] font-semibold text-[var(--bg)] disabled:opacity-50">{buttonsRunning ? 'Enviando prueba…' : 'Continuar'}</button></div></div>}
      {buttonsError && <div className="mt-5 rounded-[14px] border border-[#b85d48]/30 bg-[#f5e2dd] p-4 text-[13px] text-[#713b31]" role="alert">{buttonsError}</div>}
      {buttonsResult && <div className="mt-5 rounded-[14px] border border-[#9ab39b]/40 bg-[#edf4ec] p-4 text-[13px]" role="status"><div className="flex items-center gap-2 font-semibold text-[#345238]"><CheckCircle2 size={16} /> Enviado a Evolution</div><p className="mt-2 text-[var(--text-secondary)]">Estado: {buttonsResult.status || 'accepted'}</p><p className="mt-1 break-all font-mono text-[11px] text-[var(--text-secondary)]">provider_message_id: {buttonsResult.provider_message_id || 'NOT AVAILABLE'}</p><p className="mt-3 text-[13px] text-[var(--text-primary)]">Revisa tu WhatsApp. Los botones deberían aparecer en el mensaje.</p></div>}
    </div>
  </section>;
}
