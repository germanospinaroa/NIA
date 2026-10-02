/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelTiming } from '@/lib/funnel';
import { defaultMvpState, saveMvpState, trackMvp, type DirectionKey } from '@/lib/mvp';

const timingOptions: Array<[FunnelTiming, string, string]> = [['morning', 'Por la mañana', '08:00'], ['midday', 'Al mediodía', '12:30'], ['afternoon', 'Por la tarde', '17:30'], ['night', 'Por la noche', '21:00']];
type CalibrationOption = { id: string; label: string; context_value: string };
type CalibrationPrompt = { question: string; options: CalibrationOption[] };
const directionKey: DirectionKey = 'trust_own_judgment';

function keyForContext(value: string | undefined): DirectionKey {
  if (value === 'conversation') return 'say_what_i_mean';
  if (value === 'limit') return 'hold_boundaries';
  return directionKey;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro' | 'direction' | 'timing' | 'calibration' | 'first_intervention'>('intro');
  const [name, setName] = useState('');
  const [direction, setDirection] = useState('');
  const [intervention, setIntervention] = useState('');
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [calibration, setCalibration] = useState<CalibrationPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const state = readFunnelState();
    setName(state.firstName || '');
    setDirection(state.directionText || '');
    const restoredStage = state.onboardingStage;
    const nextStage = state.directionText ? (restoredStage === 'calibration' ? 'calibration' : restoredStage === 'first_intervention' ? 'first_intervention' : state.timing ? 'timing' : 'timing') : 'intro';
    setStage(nextStage);
    saveFunnelState({ onboardingStage: nextStage });
    trackFunnel('onboarding_started');
    if (nextStage === 'calibration') {
      fetch('/api/calibration').then(response => response.json()).then(payload => { if (payload.status === 'calibration_required' && payload.calibration) setCalibration(payload.calibration); else setStage('timing'); }).catch(() => setError('No pudimos cargar esta parte. Inténtalo de nuevo.'));
    }
  }, []);

  function go(next: typeof stage) {
    setStage(next);
    saveFunnelState({ onboardingStage: next });
  }

  function begin() { trackFunnel('onboarding_intro_viewed'); go('direction'); }

  function submitDirection() {
    const value = direction.trim();
    if (!value) return;
    saveFunnelState({ directionText: value });
    trackFunnel('intention_submitted');
    go('timing');
  }

  async function loadDaily() {
    const daily = await fetch('/api/daily');
    const result = await daily.json().catch(() => ({}));
    if (daily.status === 401) { router.push('/acceso?error=auth_failed'); return; }
    if (result.status === 'calibration_required' && result.calibration) { setCalibration(result.calibration); go('calibration'); return; }
    if (!daily.ok || !result.interaction?.content) throw new Error(result.error || 'daily');
    setIntervention(result.interaction.content);
    setInteractionId(result.interaction.id);
    trackFunnel('first_intervention_received');
    go('first_intervention');
  }

  async function submitTiming(value: FunnelTiming) {
    trackFunnel('timing_selected', { timing: value });
    setLoading(true);
    setError('');
    const state = readFunnelState();
    const context = state.discoverContext === 'conversation' ? 'Voy a tener una conversación.' : state.discoverContext === 'limit' ? 'Poner límites.' : 'Estoy dudando de mí.';
    const chosenDirection = keyForContext(state.discoverContext);
    const time = timingOptions.find(item => item[0] === value)?.[2] || '08:00';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const profilePayload = { first_name: name || state.firstName || 'Laura', direction_key: chosenDirection, direction_text: direction || state.directionText || 'Quiero confiar más en mi criterio.', voice_style: 'grounded', message_frequency: 1, message_time_1: time, timezone, desired_change_original: direction || state.directionText || 'Quiero confiar más en mi criterio.', current_context_original: context };
    try {
      const profileResponse = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profilePayload) });
      const profileResult = await profileResponse.json().catch(() => ({}));
      if (profileResponse.status === 401) { router.push('/acceso?error=auth_failed'); return; }
      if (!profileResponse.ok) { console.error('[onboarding] profile save failed', { status: profileResponse.status, error: profileResult.error }); throw new Error('profile'); }
      saveFunnelState({ timing: value });
      saveMvpState({ ...defaultMvpState, firstName: profilePayload.first_name, directionKey: chosenDirection, directionText: profilePayload.direction_text, desiredChangeOriginal: profilePayload.desired_change_original, currentContextOriginal: context, voiceStyle: 'grounded', messageTime1: time, onboardingComplete: true });
      await loadDaily();
    } catch { setError('No pudimos guardar tu elección. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitCalibration(option: CalibrationOption) {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/calibration', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selected_option: option.id }) });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push('/acceso?error=auth_failed'); return; }
      if (!response.ok) throw new Error(result.error || 'calibration');
      await loadDaily();
    } catch { setError('No pudimos guardar tu elección. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function giveFeedback(feedback: 'serves' | 'different' | 'not_me') {
    saveFunnelState({ firstInterventionFeedback: feedback });
    trackFunnel('first_intervention_feedback', { feedback });
    if (interactionId) await fetch('/api/daily', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ feedback_type: feedback }) });
    trackFunnel('onboarding_completed');
    trackFunnel('app_entered');
    trackMvp('onboarding_completed');
    saveFunnelState({ onboardingStage: 'ready' });
    router.push('/app');
  }

  return <FunnelFrame><section className="funnel-screen onboarding-story-screen"><div className="funnel-content narrow onboarding-stage" key={stage}>
    {stage === 'intro' && <><h1>Ahora sí, vamos a hacerlo tuyo.</h1><p className="funnel-copy">Quiero empezar con una sola cosa.</p><button className="funnel-button" onClick={begin}>Empezar <ArrowRight size={17} /></button></>}
    {stage === 'direction' && <><h1>¿Qué te gustaría hacer diferente cuando vuelva a aparecer ese momento?</h1><p className="funnel-copy">No tienes que escribirlo bonito. Escríbelo como te salga.</p><textarea autoFocus className="funnel-input textarea" value={direction} onChange={event => setDirection(event.target.value)} placeholder={'Ejemplo: «Quiero decir lo que pienso sin empezar a dudar de mí.»'} maxLength={180} /><button className="funnel-button" disabled={!direction.trim()} onClick={submitDirection}>Esto es lo que quiero trabajar <ArrowRight size={17} /></button></>}
    {stage === 'timing' && <><p className="funnel-eyebrow">PARA EMPEZAR</p><h1>¿En qué momento del día te gustaría recibir tu mensaje de NIA?</h1><p className="funnel-copy">Elige el momento del día en el que te resultaría más fácil leerlo y tomarte unos minutos para ti.</p><div className="option-list">{timingOptions.map(([value, label]) => <button key={value} className="option-button" disabled={loading} onClick={() => submitTiming(value)}>{label}<ArrowRight size={16} /></button>)}</div>{loading && <p className="funnel-note">Guardando tu elección…</p>}{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'calibration' && calibration && <><p className="funnel-eyebrow">PARA SEGUIR</p><h1>{calibration.question}</h1><div className="option-list">{calibration.options.map(option => <button key={option.id} className="option-button" disabled={loading} onClick={() => submitCalibration(option)}>{option.label}<ArrowRight size={16} /></button>)}</div>{loading && <p className="funnel-note">Guardando tu elección…</p>}{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'first_intervention' && <><h1>Esto es para ti, {name || 'hoy'}.</h1><div className="nia-response-card"><p>{intervention}</p></div><p className="funnel-copy">¿Cómo te sirve?</p><div className="option-list"><button className="option-button" onClick={() => giveFeedback('serves')}>Sí, esto me sirve.<ArrowRight size={16} /></button><button className="option-button" onClick={() => giveFeedback('different')}>Quiero otra forma de verlo.<ArrowRight size={16} /></button><button className="option-button" onClick={() => giveFeedback('not_me')}>No, esto no me representa.<ArrowRight size={16} /></button></div></>}
  </div></section></FunnelFrame>;
}
