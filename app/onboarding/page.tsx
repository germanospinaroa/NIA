/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { WhatsAppConnectionPanel, type WhatsAppConnectionState } from '@/components/app/WhatsAppConnectionPanel';
import { readFunnelState, saveFunnelState, trackFunnel, type CommunicationPreference } from '@/lib/funnel';
import { readMvpState, saveMvpState, trackMvp, type DirectionKey } from '@/lib/mvp';
import { COUNTRY_OPTIONS, countryByCode, countryFromBrowserLocale, timeLabel, timezoneFromBrowser, timezoneLabel } from '@/lib/locale';

type Stage = 'name' | 'intro' | 'direction' | 'context' | 'communication' | 'timing' | 'calibration' | 'whatsapp' | 'ready';
type CalibrationOption = { id: string; label: string; context_value: string };
type CalibrationPrompt = { question: string; options: CalibrationOption[] };

const contextOptions = [
  ['decision', 'Cuando tengo que tomar una decisión.'],
  ['opinion', 'Cuando alguien cuestiona lo que decidí.'],
  ['conversation', 'Cuando tengo que expresar lo que pienso.'],
] as const;

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
  const [communicationPreference, setCommunicationPreference] = useState<CommunicationPreference>('adaptive');
  const [customContext, setCustomContext] = useState('');
  const [editingDirection, setEditingDirection] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationPrompt | null>(null);
  const [time, setTime] = useState('08:00');
  const [countryCode, setCountryCode] = useState('');
  const [timezone, setTimezone] = useState('');
  const [whatsapp, setWhatsapp] = useState<WhatsAppConnectionState>({ status: 'not_connected' });
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');

  async function loadCalibration() {
    const response = await fetch('/api/calibration', { cache: 'no-store' });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.status === 'calibration_required') setCalibration(payload.calibration);
    else setStage('whatsapp');
  }

  useEffect(() => {
    const state = readFunnelState();
    const persistedName = state.firstName?.trim() || '';
    const persistedDirection = state.directionText?.trim() || '';
    const persistedContext = contextFromState(state);
    setName(persistedName); setDirection(persistedDirection); setContext(persistedContext);
    const detectedCountry = countryFromBrowserLocale();
    const detectedTimezone = timezoneFromBrowser();
    setCountryCode(detectedCountry || 'CO');
    setTimezone(detectedTimezone);
    if (state.communicationPreference) setCommunicationPreference(state.communicationPreference);
    fetch('/api/profile', { cache: 'no-store' }).then(async response => {
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push('/acceso'); return; }
      const profile = result.profile ?? {};
      const profileName = profile.first_name?.trim() || persistedName;
      const profileDirection = profile.direction_text?.trim() || profile.desired_change_original?.trim() || persistedDirection;
      const profileContext = profile.current_context_original?.trim() || persistedContext;
      const profileCountry = typeof profile.country_code === 'string' ? profile.country_code : '';
      const nextCountry = profileCountry || detectedCountry || 'CO';
      const nextTimezone = profile.timezone || detectedTimezone || countryByCode(nextCountry)?.defaultTimezone || '';
      setName(profileName); setDirection(profileDirection); setContext(profileContext); setTime(profile.message_time_1 || '08:00'); setCountryCode(nextCountry); setTimezone(nextTimezone);
      if (profile.communication_preference) setCommunicationPreference(profile.communication_preference);
      if (profile.onboarding_completed) { router.push('/app'); return; }
      const connectionResponse = await fetch('/api/whatsapp/connection', { cache: 'no-store' });
      const connectionResult = await connectionResponse.json().catch(() => ({}));
      setWhatsapp((connectionResult.connection ?? connectionResult) as WhatsAppConnectionState);
      const nextStage: Stage = !profileName ? 'name' : !profileDirection ? 'direction' : !profileContext ? 'context' : (!profile.message_time_1 || !profile.country_code) ? 'timing' : connectionResult.connection?.status === 'connected' ? 'whatsapp' : (state.onboardingStage === 'calibration' ? 'calibration' : 'whatsapp');
      setStage(nextStage); saveFunnelState({ onboardingStage: nextStage, firstName: profileName, directionText: profileDirection, onboardingContext: profileContext });
      if (nextStage === 'calibration') void loadCalibration();
    }).catch(() => setError('No pudimos cargar tu configuración. Vuelve a intentarlo.'));
    trackFunnel('onboarding_started');
  }, [router]);

  function go(next: Stage) { setStage(next); saveFunnelState({ onboardingStage: next }); }
  function submitName() { const value = name.trim(); if (!value) return; saveFunnelState({ firstName: value }); trackFunnel('name_completed'); go('intro'); }
  function submitDirection(value = direction) { const next = value.trim(); if (!next) return; setDirection(next); saveFunnelState({ directionText: next }); trackFunnel('intention_submitted'); go('context'); }
  function submitContext(value: string) { if (value === 'other') { setContext('other'); return; } const next = value.trim(); if (!next) return; setContext(next); saveFunnelState({ onboardingContext: next }); trackFunnel('context_selected'); go('communication'); }
  function submitCustomContext() { const value = customContext.trim(); if (!value) return; setContext(value); saveFunnelState({ onboardingContext: value }); go('communication'); }
  function submitCommunication(value: CommunicationPreference) { setCommunicationPreference(value); saveFunnelState({ communicationPreference: value }); go('timing'); }

  async function submitTiming() {
    const firstName = name.trim(); const desiredChange = direction.trim(); const currentContext = context.trim();
    if (!firstName || !desiredChange || !currentContext || currentContext === 'other') { setError('Antes de continuar, completa lo que quieres trabajar y dónde te pasa.'); return; }
    setLoading(true); setError('');
    const now = new Date().toISOString();
    const selectedTimezone = timezone || countryByCode(countryCode)?.defaultTimezone || '';
    if (!countryCode || !selectedTimezone) { setError('Elige tu país y zona horaria antes de continuar.'); return; }
    const profilePayload = { first_name: firstName, direction_key: directionKeyForContext(readFunnelState().discoverContext), direction_text: desiredChange, voice_style: 'grounded', communication_preference: communicationPreference, message_frequency: 1, message_time_1: time || '08:00', message_time_2: null, timezone: selectedTimezone, country_code: countryCode, desired_change_original: desiredChange, desired_change_summary: desiredChange.slice(0, 180), current_context_original: currentContext, current_context_summary: currentContext.slice(0, 180), current_context_started_at: now, current_context_last_confirmed_at: now, current_context_status: 'active' };
    try {
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profilePayload) });
      if (!response.ok) throw new Error('PROFILE_SAVE_ERROR');
      saveFunnelState({ firstName, directionText: desiredChange, onboardingContext: currentContext, onboardingStage: 'whatsapp' });
      saveMvpState({ ...readMvpState(), firstName, directionKey: profilePayload.direction_key, directionText: desiredChange, desiredChangeOriginal: desiredChange, currentContextOriginal: currentContext, messageTime1: profilePayload.message_time_1, timezone: profilePayload.timezone });
      const calibrationResponse = await fetch('/api/calibration', { cache: 'no-store' });
      const calibrationResult = await calibrationResponse.json().catch(() => ({}));
      if (calibrationResult.status === 'calibration_required') { setCalibration(calibrationResult.calibration); go('calibration'); } else go('whatsapp');
    } catch { setError('No pudimos guardar tu configuración. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitCalibration(option: CalibrationOption) {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/calibration', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selected_option: option.id }) });
      if (!response.ok) throw new Error('CALIBRATION_ERROR');
      go('whatsapp');
    } catch { setError('No pudimos guardar esta respuesta. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  const finalizeOnboarding = useCallback(async () => {
    if (finalizing || whatsapp.status !== 'connected') return;
    setFinalizing(true); setLoading(true); setError('');
    try {
      const response = await fetch('/api/onboarding/complete', { method: 'POST' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'ONBOARDING_COMPLETE_ERROR');
      trackFunnel('onboarding_completed'); trackMvp('onboarding_completed'); saveFunnelState({ onboardingStage: 'ready' }); go('ready');
    } catch (cause) { console.error('[onboarding] completion failed', cause); setError('WhatsApp ya está conectado, pero todavía estamos preparando tu primer mensaje. Inténtalo de nuevo.'); }
    finally { setFinalizing(false); setLoading(false); }
  }, [finalizing, whatsapp.status]);

  useEffect(() => { if (stage === 'whatsapp' && whatsapp.status === 'connected') void finalizeOnboarding(); }, [stage, whatsapp.status, finalizeOnboarding]);

  return <FunnelFrame><section className="funnel-screen onboarding-story-screen"><div className="funnel-content narrow onboarding-stage" key={stage}>
    {stage === 'name' && <><h1>¿Cómo quieres que te llame?</h1><input autoFocus className="funnel-input" value={name} onChange={event => setName(event.target.value)} placeholder="Tu nombre" maxLength={80} /><button className="funnel-button" disabled={!name.trim()} onClick={submitName}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'intro' && <><h1>Hola, {name}.</h1><p className="funnel-copy">Ya estás dentro.</p><p className="funnel-copy">Vamos a dejar claro qué quieres trabajar y en qué situaciones te pasa.</p><button className="funnel-button" onClick={() => go('direction')}>Empecemos <ArrowRight size={17} /></button></>}
    {stage === 'direction' && <>{direction && !editingDirection ? <><h1>Por lo que me contaste, creo que hay algo que quieres trabajar:</h1><div className="nia-response-card"><p>{direction}</p></div><p className="funnel-copy">¿Sí va por ahí?</p><div className="option-list"><button className="option-button" onClick={() => submitDirection()}>Sí, eso es <ArrowRight size={16} /></button><button className="option-button" onClick={() => setEditingDirection(true)}>Quiero decirlo de otra manera <ArrowRight size={16} /></button></div></> : <><h1>¿Qué quieres trabajar?</h1><p className="funnel-copy">Escríbelo con tus palabras.</p><textarea autoFocus className="funnel-input textarea" value={direction} onChange={event => setDirection(event.target.value)} placeholder="Quiero…" maxLength={180} /><button className="funnel-button" disabled={!direction.trim()} onClick={() => submitDirection()}>Guardar lo que quiero trabajar <ArrowRight size={17} /></button></>}</>}
    {stage === 'context' && <><h1>¿En qué situación te pasa más?</h1><div className="option-list">{contextOptions.map(([value, label]) => <button key={value} className="option-button" onClick={() => submitContext(value)}>{label}<ArrowRight size={16} /></button>)}<button className="option-button" onClick={() => submitContext('other')}>En otra situación <ArrowRight size={16} /></button></div>{context === 'other' && <><input autoFocus className="funnel-input" value={customContext} onChange={event => setCustomContext(event.target.value)} placeholder="Cuéntame brevemente dónde te pasa" maxLength={180} /><button className="funnel-button" disabled={!customContext.trim()} onClick={submitCustomContext}>Guardar esta situación <ArrowRight size={17} /></button></>}{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'communication' && <><h1>¿Cómo te gusta que NIA te ayude?</h1><p className="funnel-copy">Es una preferencia. NIA también cuidará que sus mensajes no se vuelvan repetitivos.</p><div className="option-list">{([['idea','Una idea clara','Una idea que me haga pensar, sin darle tantas vueltas.'],['practical','Algo práctico','Algo que pueda llevar a mi vida.'],['structured','Paso a paso cuando haga falta','Cuando el tema lo requiera, prefiero que me muestre cómo hacerlo.'],['adaptive','Prefiero que varíe','Quiero que NIA decida según el momento.']] as const).map(([value,label,detail]) => <button key={value} className="option-button" onClick={() => submitCommunication(value)}><span><strong className="block">{label}</strong><small className="mt-1 block opacity-70">{detail}</small></span><ArrowRight size={16} /></button>)}</div></>}
    {stage === 'timing' && <><h1>¿A qué hora quieres recibir tu mensaje de NIA?</h1><div className="onboarding-locale-fields"><label htmlFor="onboarding-country">País<select id="onboarding-country" value={countryCode} onChange={event => { const next = event.target.value; setCountryCode(next); setTimezone(countryByCode(next)?.defaultTimezone || ''); }}><option value="">Elige tu país</option>{COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select></label><label htmlFor="onboarding-timezone">Zona horaria<select id="onboarding-timezone" value={timezone} onChange={event => setTimezone(event.target.value)}><option value="">Elige tu zona horaria</option>{Array.from(new Set([timezone, ...COUNTRY_OPTIONS.map(country => country.defaultTimezone)].filter(Boolean))).map(option => <option key={option} value={option}>{timezoneLabel(option)}</option>)}</select></label><label htmlFor="onboarding-time">Hora de tu mensaje<input id="onboarding-time" type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div><p className="onboarding-timezone-note"><strong>Recibirás tu mensaje a las {timeLabel(time)}</strong> según esta zona horaria.</p><button className="funnel-button" disabled={loading || !time || !countryCode || !timezone} onClick={() => void submitTiming()}>{loading ? 'Guardando…' : 'Continuar'} <ArrowRight size={17} /></button>{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'calibration' && calibration && <><h1>{calibration.question}</h1><div className="option-list">{calibration.options.map(option => <button key={option.id} className="option-button" disabled={loading} onClick={() => void submitCalibration(option)}>{option.label}<ArrowRight size={16} /></button>)}</div>{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'whatsapp' && <><h1>Conecta tu WhatsApp</h1><p className="funnel-copy">Aquí llegará tu mensaje diario de NIA. La configuración termina cuando reconozcamos tu número.</p><WhatsAppConnectionPanel value={whatsapp} defaultCountryCode={countryCode || 'CO'} onChange={setWhatsapp} onError={setError} onDisconnect={async () => {}} showTest={false} showDisconnect={false} /><p className="onboarding-finalization-status mt-5 text-[13px]">{loading ? 'Estamos terminando tu configuración…' : 'No podrás terminar la configuración hasta conectar WhatsApp.'}</p>{error && <p className="funnel-error" role="alert">{error}</p>}</>}
    {stage === 'ready' && <><h1>Ya está. NIA quedó lista.</h1><p className="funnel-copy">WhatsApp está conectado. NIA te escribirá allí y tu primer mensaje psicológico llegará a la hora que elegiste.</p><button className="funnel-button" onClick={() => router.push('/app')}>Entrar a NIA <ArrowRight size={17} /></button></>}
  </div></section></FunnelFrame>;
}
