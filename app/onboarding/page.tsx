/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelTiming } from '@/lib/funnel';
import { readMvpState, saveMvpState, trackMvp, type DirectionKey } from '@/lib/mvp';

const timingOptions: Array<[FunnelTiming, string, string]> = [
  ['morning', 'Por la mañana', '08:00'],
  ['midday', 'Al mediodía', '12:30'],
  ['afternoon', 'Por la tarde', '17:30'],
  ['night', 'Por la noche', '21:00'],
];
const contextOptions = [
  ['decision', 'Cuando tengo que tomar una decisión.'],
  ['opinion', 'Cuando alguien cuestiona lo que decidí.'],
  ['conversation', 'Cuando tengo que expresar lo que pienso.'],
] as const;
type Stage = 'name' | 'intro' | 'direction' | 'context' | 'timing' | 'calibration' | 'first_intervention' | 'ready';
type CalibrationOption = { id: string; label: string; context_value: string };
type CalibrationPrompt = { question: string; options: CalibrationOption[] };

function directionKeyForContext(value: string | undefined): DirectionKey {
  if (value === 'conversation') return 'say_what_i_mean';
  if (value === 'limit') return 'hold_boundaries';
  return 'trust_own_judgment';
}

function contextFromState(state: ReturnType<typeof readFunnelState>) {
  if (state.onboardingContext?.trim()) return state.onboardingContext.trim();
  if (state.discoverContext === 'opinion') return 'Cuando alguien cuestiona lo que decidí.';
  if (state.discoverContext === 'conversation') return 'Cuando tengo que expresar lo que pienso.';
  if (state.discoverContext === 'limit') return 'Cuando tengo que poner un límite.';
  return '';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('name');
  const [name, setName] = useState('');
  const [direction, setDirection] = useState('');
  const [context, setContext] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [editingDirection, setEditingDirection] = useState(false);
  const [intervention, setIntervention] = useState('');
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [calibration, setCalibration] = useState<CalibrationPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const state = readFunnelState();
    const persistedName = state.firstName?.trim() || '';
    const persistedDirection = state.directionText?.trim() || '';
    const persistedContext = contextFromState(state);
    setName(persistedName);
    setDirection(persistedDirection);
    setContext(persistedContext);
    const restoredStage = state.onboardingStage;
    const nextStage: Stage = !persistedName ? 'name' : !persistedDirection ? 'intro' : restoredStage === 'ready' ? 'ready' : restoredStage === 'first_intervention' && state.firstInterventionContent ? 'first_intervention' : restoredStage === 'calibration' ? 'calibration' : restoredStage === 'timing' && persistedContext ? 'timing' : restoredStage === 'timing' ? 'context' : 'intro';
    setStage(nextStage);
    saveFunnelState({ onboardingStage: nextStage });
    trackFunnel('onboarding_started');
    if (nextStage === 'calibration') {
      fetch('/api/calibration').then(async response => {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) { router.push('/acceso?error=auth_failed'); return; }
        if (!response.ok) throw new Error('CALIBRATION_ERROR');
        if (payload.status === 'calibration_required' && payload.calibration) setCalibration(payload.calibration);
        else setStage('timing');
      }).catch(() => setError('No pudimos cargar esta parte. Inténtalo de nuevo.'));
    }
    if (nextStage === 'first_intervention') setIntervention(state.firstInterventionContent || '');
  }, [router]);

  function go(next: Stage) {
    setStage(next);
    saveFunnelState({ onboardingStage: next });
  }

  function submitName() {
    const value = name.trim();
    if (!value) return;
    saveFunnelState({ firstName: value });
    trackFunnel('name_completed');
    go('intro');
  }

  function begin() { trackFunnel('onboarding_intro_viewed'); go('direction'); }

  function submitDirection(value = direction) {
    const nextDirection = value.trim();
    if (!nextDirection) return;
    setDirection(nextDirection);
    saveFunnelState({ directionText: nextDirection });
    trackFunnel('intention_submitted');
    go('context');
  }

  function submitContext(value: string) {
    if (value === 'other') { setContext('other'); return; }
    const nextContext = value.trim();
    if (!nextContext) return;
    setContext(nextContext);
    saveFunnelState({ onboardingContext: nextContext });
    trackFunnel('context_selected', { context: nextContext });
    go('timing');
  }

  function submitCustomContext() {
    const value = customContext.trim();
    if (!value) return;
    setContext(value);
    saveFunnelState({ onboardingContext: value });
    trackFunnel('context_selected', { context: 'other' });
    go('timing');
  }

  async function loadDaily() {
    let response: Response;
    let result: { status?: string; calibration?: CalibrationPrompt; interaction?: { id: string; content: string }; error?: string };
    try {
      response = await fetch('/api/daily');
      result = await response.json().catch(() => ({}));
    } catch { throw new Error('DAILY_GENERATION_ERROR'); }
    if (response.status === 401) { router.push('/acceso?error=auth_failed'); return; }
    if (result.status === 'calibration_required' && result.calibration) { setCalibration(result.calibration); go('calibration'); return; }
    if (!response.ok || !result.interaction?.content) throw new Error(result.error || 'DAILY_GENERATION_ERROR');
    setIntervention(result.interaction.content);
    setInteractionId(result.interaction.id);
    saveFunnelState({ firstInterventionContent: result.interaction.content });
    trackFunnel('first_intervention_received');
    go('first_intervention');
  }

  async function submitTiming(value: FunnelTiming) {
    const state = readFunnelState();
    const firstName = name.trim() || state.firstName?.trim() || '';
    const desiredChange = direction.trim() || state.directionText?.trim() || '';
    const currentContext = context.trim() || contextFromState(state);
    if (!firstName || !desiredChange || !currentContext || currentContext === 'other') { setError('Antes de continuar, completa lo que quieres trabajar y dónde te pasa.'); return; }
    trackFunnel('timing_selected', { timing: value });
    setLoading(true);
    setError('');
    const time = timingOptions.find(item => item[0] === value)?.[2];
    if (!time) { setError('No pudimos reconocer ese horario. Inténtalo de nuevo.'); setLoading(false); return; }
    const now = new Date().toISOString();
    const profilePayload = {
      first_name: firstName,
      direction_key: directionKeyForContext(state.discoverContext),
      direction_text: desiredChange,
      voice_style: 'grounded',
      message_frequency: 1,
      message_time_1: time,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      desired_change_original: desiredChange,
      desired_change_summary: desiredChange.slice(0, 180),
      current_context_original: currentContext,
      current_context_summary: currentContext.slice(0, 180),
      current_context_started_at: now,
      current_context_last_confirmed_at: now,
      current_context_status: 'active',
    };
    try {
      const profileResponse = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profilePayload) });
      const profileResult = await profileResponse.json().catch(() => ({}));
      if (profileResponse.status === 401) { router.push('/acceso?error=auth_failed'); return; }
      if (!profileResponse.ok) { console.error('[onboarding] PROFILE_SAVE_ERROR', { status: profileResponse.status, error: profileResult.error }); throw new Error('PROFILE_SAVE_ERROR'); }
      saveFunnelState({ timing: value, firstName, directionText: desiredChange, onboardingContext: currentContext });
      const mvp = readMvpState();
      saveMvpState({ ...mvp, firstName, directionKey: profilePayload.direction_key, directionText: desiredChange, desiredChangeOriginal: desiredChange, currentContextOriginal: currentContext, messageTime1: time, timezone: profilePayload.timezone, onboardingComplete: true });
    } catch (cause) {
      console.error('[onboarding] PROFILE_SAVE_ERROR', cause);
      setError('No pudimos guardar tu información. Inténtalo de nuevo.');
      setLoading(false);
      return;
    }
    try { await loadDaily(); }
    catch (cause) { console.error('[onboarding] DAILY_GENERATION_ERROR', cause); setError('No pudimos preparar tu primer mensaje todavía. Tu información ya quedó guardada. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitCalibration(option: CalibrationOption) {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/calibration', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selected_option: option.id }) });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push('/acceso?error=auth_failed'); return; }
      if (!response.ok) throw new Error(result.error || 'CALIBRATION_ERROR');
      await loadDaily();
    } catch (cause) { console.error('[onboarding] CALIBRATION_ERROR', cause); setError('No pudimos guardar esta respuesta. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function giveFeedback(feedback: 'serves' | 'different' | 'not_me') {
    setLoading(true); setError('');
    try {
      if (interactionId) {
        const response = await fetch('/api/daily', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ feedback_type: feedback }) });
        if (!response.ok) throw new Error('FEEDBACK_SAVE_ERROR');
      }
      saveFunnelState({ firstInterventionFeedback: feedback, onboardingStage: 'ready' });
      trackFunnel('first_intervention_feedback', { feedback });
      trackFunnel('onboarding_completed');
      trackMvp('onboarding_completed');
      go('ready');
    } catch (cause) { console.error('[onboarding] FEEDBACK_SAVE_ERROR', cause); setError('No pudimos guardar tu respuesta. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  return <FunnelFrame><section className="funnel-screen onboarding-story-screen"><div className="funnel-content narrow onboarding-stage" key={stage}>
    {stage === 'name' && <><h1>¿Cómo quieres que te llame?</h1><input autoFocus className="funnel-input" value={name} onChange={event => setName(event.target.value)} placeholder="Tu nombre" maxLength={80} /><button className="funnel-button" disabled={!name.trim()} onClick={submitName}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'intro' && <><h1>Hola, {name}.</h1><p className="funnel-copy">Ya estás dentro.</p><p className="funnel-copy">Ahora sí quiero que NIA empiece a trabajar contigo.</p><p className="funnel-copy">No voy a llenarte de preguntas. Primero vamos a dejar claro qué quieres trabajar y después vamos a empezar contigo desde ahí.</p><button className="funnel-button" onClick={begin}>Empecemos <ArrowRight size={17} /></button></>}
    {stage === 'direction' && <>{direction && !editingDirection ? <><h1>Por lo que me contaste, creo que hay algo que quieres trabajar:</h1><div className="nia-response-card"><p>{direction}</p></div><p className="funnel-copy">¿Sí va por ahí?</p><div className="option-list"><button className="option-button" onClick={() => submitDirection()}>Sí, eso es <ArrowRight size={16} /></button><button className="option-button" onClick={() => setEditingDirection(true)}>Quiero decirlo de otra manera <ArrowRight size={16} /></button></div></> : <><h1>¿Qué quieres trabajar?</h1><p className="funnel-copy">Escríbelo con tus palabras.</p><textarea autoFocus className="funnel-input textarea" value={direction} onChange={event => setDirection(event.target.value)} placeholder="Quiero..." maxLength={180} /><button className="funnel-button" disabled={!direction.trim()} onClick={() => submitDirection()}>Guardar lo que quiero trabajar <ArrowRight size={17} /></button></>}</>}
    {stage === 'context' && <><h1>Perfecto.</h1><p className="funnel-copy">Ahora quiero ubicar un poquito mejor dónde te pasa.</p><p className="funnel-copy">¿Dónde notas más esa duda?</p><div className="option-list">{contextOptions.map(([value, label]) => <button key={value} className="option-button" onClick={() => submitContext(value)}>{label}<ArrowRight size={16} /></button>)}<button className="option-button" onClick={() => submitContext('other')}>En otra situación <ArrowRight size={16} /></button></div>{context === 'other' && <><input autoFocus className="funnel-input" value={customContext} onChange={event => setCustomContext(event.target.value)} placeholder="Cuéntame brevemente dónde te pasa" maxLength={180} /><button className="funnel-button" disabled={!customContext.trim()} onClick={submitCustomContext}>Guardar esta situación <ArrowRight size={17} /></button></>}{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'timing' && <><p className="funnel-eyebrow">PARA EMPEZAR</p><h1>¿En qué momento del día te gustaría recibir tu mensaje de NIA?</h1><p className="funnel-copy">Elige el momento del día en el que te resultaría más fácil leerlo y tomarte unos minutos para ti.</p><div className="option-list">{timingOptions.map(([value, label]) => <button key={value} className="option-button" disabled={loading} onClick={() => submitTiming(value)}>{label}<ArrowRight size={16} /></button>)}</div>{loading && <p className="funnel-note">Guardando tu elección…</p>}{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'calibration' && calibration && <><p className="funnel-eyebrow">PARA SEGUIR</p><h1>{calibration.question}</h1><div className="option-list">{calibration.options.map(option => <button key={option.id} className="option-button" disabled={loading} onClick={() => submitCalibration(option)}>{option.label}<ArrowRight size={16} /></button>)}</div>{loading && <p className="funnel-note">Guardando tu elección…</p>}{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'first_intervention' && <><h1>{name}, este es tu primer mensaje de NIA.</h1><div className="nia-response-card"><p>{intervention}</p></div><p className="funnel-copy">¿Cómo te sirve?</p><div className="option-list"><button className="option-button" disabled={loading} onClick={() => giveFeedback('serves')}>Sí, esto me sirve. <ArrowRight size={16} /></button><button className="option-button" disabled={loading} onClick={() => giveFeedback('different')}>Quiero otra forma de verlo. <ArrowRight size={16} /></button><button className="option-button" disabled={loading} onClick={() => giveFeedback('not_me')}>No, esto no me representa. <ArrowRight size={16} /></button></div>{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'ready' && <><h1>Ya tienes tu primer mensaje de NIA.</h1><p className="funnel-copy">A partir de ahora, NIA trabajará sobre lo que elegiste y sobre las situaciones que decidiste compartir.</p><button className="funnel-button" onClick={() => router.push('/app')}>Entrar a NIA <ArrowRight size={17} /></button></>}
  </div></section></FunnelFrame>;
}
