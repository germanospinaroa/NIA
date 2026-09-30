'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MvpShell } from '@/components/app/MvpShell';
import { contextLabels, defaultMvpState, trackMvp, type ContextKey, type MvpState } from '@/lib/mvp';
import { learningFromFeedback } from '@/lib/intervention-engine';

type FeedbackOption = { key: string; label: string };

export default function PuntoPage() {
  const [state, setState] = useState<MvpState>(defaultMvpState);
  const [context, setContext] = useState<ContextKey | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [interactionId, setInteractionId] = useState<string | null>(null); const [interventionId, setInterventionId] = useState<string | null>(null);
  const [intervention, setIntervention] = useState('');
  const [feedbackQuestion, setFeedbackQuestion] = useState(''); const [feedbackDimension, setFeedbackDimension] = useState<'relevance'|'specificity'|'angle'|'context'|'moment'>('relevance');
  const [feedbackOptions, setFeedbackOptions] = useState<FeedbackOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch('/api/profile').then(response => response.ok ? response.json() : null).then(result => { if (result?.profile) setState(current => ({ ...current, ...result.profile, firstName: result.profile.first_name || current.firstName })); }); }, []);
  async function start(key: ContextKey) { setContext(key); setLoading(true); trackMvp('nia_point_started', { context: key }); const response = await fetch('/api/interactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ interaction_type: 'nia_point', context_key: key, direction_key: state.directionKey }) }); const result = await response.json(); setLoading(false); if (response.ok) { setInteractionId(result.interaction.id); setInterventionId(result.intervention_id); setIntervention(result.intervention.text); setFeedbackQuestion(result.feedback.question); setFeedbackDimension(result.feedback.dimension); setFeedbackOptions(result.feedback.options); } }
  async function choose(option: FeedbackOption) { setFeedback(option.key); if (interactionId) await fetch('/api/interactions', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ interaction_id: interactionId, intervention_id: interventionId, feedback_type: option.key, question: feedbackQuestion, dimension: feedbackDimension, options: feedbackOptions, learning_signal: learningFromFeedback(feedbackDimension, option.key) }) }); }
  return <MvpShell title="Punto NIA"><section className="pt-10">{!context ? <><Link href="/app" className="inline-flex items-center gap-2 text-[13px] text-[var(--text-tertiary)]"><ArrowLeft size={15}/>Volver a Hoy</Link><h1 className="max-w-[680px] text-[clamp(39px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">{state.firstName || 'Laura'}, ¿qué está apareciendo ahora?</h1><div className="mt-10 grid gap-3 sm:grid-cols-2">{(Object.keys(contextLabels) as ContextKey[]).map(key => <button key={key} type="button" disabled={loading} onClick={() => start(key)} className="min-h-16 rounded-[var(--radius-card)] border border-black/15 bg-[var(--surface)] p-5 text-left text-[16px] font-semibold">{contextLabels[key]}</button>)}</div></> : loading ? <p className="text-[var(--text-secondary)]">Preparando algo específico para este momento…</p> : <><h1 className="max-w-[760px] text-[clamp(35px,6vw,68px)] leading-[.96] tracking-[-.05em] [font-family:var(--font-display)]">{intervention}</h1>{!feedback ? <><p className="mt-10 max-w-[580px] text-[18px] text-[var(--text-secondary)]">{feedbackQuestion}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{feedbackOptions.map(option => <button key={option.key} type="button" onClick={() => choose(option)} className="min-h-20 rounded-[var(--radius-card)] border border-black/15 p-5 text-left text-[14px] font-semibold">{option.label}</button>)}</div></> : <div className="mt-10"><p className="border-l-2 border-[var(--accent)] pl-5 text-[18px] text-[var(--text-secondary)]">Esta señal queda asociada a esta intervención para orientar lo siguiente. Este Punto NIA termina aquí.</p><Link href="/app" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Volver a Hoy <ArrowRight size={16}/></Link></div>}</>}</section></MvpShell>;
}
