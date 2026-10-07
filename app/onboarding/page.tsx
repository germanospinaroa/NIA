/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { WhatsAppConnectionPanel, type WhatsAppConnectionState } from '@/components/app/WhatsAppConnectionPanel';
import { readFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';
import { readMvpState, saveMvpState } from '@/lib/mvp';
import { COUNTRY_OPTIONS, countryByCode, countryFromBrowserLocale, timeLabel, timezoneFromBrowser, timezoneLabel } from '@/lib/locale';

type Stage = 'identity' | 'desired_change' | 'context' | 'personalization' | 'timing' | 'whatsapp';
type LearningProfile = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function personalizationStatus(profile: Record<string, unknown>) {
  const learning = profile.learning_profile && typeof profile.learning_profile === 'object' ? profile.learning_profile as LearningProfile : {};
  const onboarding = learning.onboarding && typeof learning.onboarding === 'object' ? learning.onboarding as LearningProfile : {};
  const personalization = onboarding.personalization && typeof onboarding.personalization === 'object' ? onboarding.personalization as LearningProfile : {};
  return personalization.status === 'answered' || personalization.status === 'skipped';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('identity');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [desiredChange, setDesiredChange] = useState('');
  const [context, setContext] = useState('');
  const [personalization, setPersonalization] = useState('');
  const [learningProfile, setLearningProfile] = useState<LearningProfile>({});
  const [time, setTime] = useState('08:00');
  const [countryCode, setCountryCode] = useState('');
  const [timezone, setTimezone] = useState('');
  const [whatsapp, setWhatsapp] = useState<WhatsAppConnectionState>({ status: 'not_connected' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const funnel = readFunnelState();
    const funnelPreferred = cleanText(funnel.preferredName || funnel.firstName);
    const detectedCountry = countryFromBrowserLocale() || 'CO';
    const detectedTimezone = timezoneFromBrowser();
    setPreferredName(funnelPreferred);
    setCountryCode(detectedCountry);
    setTimezone(detectedTimezone);
    fetch('/api/profile', { cache: 'no-store' }).then(async response => {
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push('/acceso'); return; }
      const profile = (result.profile ?? {}) as Record<string, unknown>;
      if (profile.onboarding_completed) { router.push('/app'); return; }
      const nextFirst = cleanText(profile.first_name);
      const nextLast = cleanText(profile.last_name);
      const nextPreferred = cleanText(profile.preferred_name) || funnelPreferred;
      const nextDesired = cleanText(profile.desired_change_original);
      const nextContext = cleanText(profile.current_context_original);
      const nextCountry = cleanText(profile.country_code) || detectedCountry;
      const nextTimezone = cleanText(profile.timezone) || detectedTimezone || countryByCode(nextCountry)?.defaultTimezone || '';
      setFirstName(nextFirst); setLastName(nextLast); setPreferredName(nextPreferred); setDesiredChange(nextDesired); setContext(nextContext);
      setLearningProfile(profile.learning_profile && typeof profile.learning_profile === 'object' ? profile.learning_profile as LearningProfile : {});
      setTime(cleanText(profile.message_time_1) || '08:00'); setCountryCode(nextCountry); setTimezone(nextTimezone);
      const connectionResponse = await fetch('/api/whatsapp/connection', { cache: 'no-store' });
      const connectionResult = await connectionResponse.json().catch(() => ({}));
      setWhatsapp((connectionResult.connection ?? connectionResult) as WhatsAppConnectionState);
      const nextStage: Stage = !nextFirst || !nextLast || !nextPreferred ? 'identity' : !nextDesired ? 'desired_change' : !nextContext ? 'context' : !personalizationStatus(profile) ? 'personalization' : (!cleanText(profile.message_time_1) || !cleanText(profile.country_code)) ? 'timing' : 'whatsapp';
      setStage(nextStage);
      saveFunnelState({ onboardingStage: nextStage, preferredName: nextPreferred });
    }).catch(() => setError('No pudimos cargar tu configuración. Vuelve a intentarlo.'));
    trackFunnel('onboarding_started');
  }, [router]);

  async function saveProfile(values: Record<string, unknown>) {
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
    if (!response.ok) throw new Error('PROFILE_SAVE_ERROR');
    const result = await response.json().catch(() => ({}));
    return (result.profile ?? {}) as Record<string, unknown>;
  }

  function move(next: Stage) { setStage(next); saveFunnelState({ onboardingStage: next }); }

  async function submitIdentity() {
    const nextFirst = cleanText(firstName); const nextLast = cleanText(lastName); const nextPreferred = cleanText(preferredName);
    if (!nextFirst || !nextLast || !nextPreferred) return;
    setLoading(true); setError('');
    try { await saveProfile({ first_name: nextFirst, last_name: nextLast, preferred_name: nextPreferred }); saveFunnelState({ preferredName: nextPreferred, onboardingStage: 'desired_change' }); move('desired_change'); }
    catch { setError('No pudimos guardar tus datos. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitDesiredChange() {
    const value = cleanText(desiredChange); if (!value) return;
    setLoading(true); setError('');
    try { await saveProfile({ direction_key: 'custom', direction_text: value, desired_change_original: value, desired_change_summary: value.slice(0, 180), desired_change_status: 'active' }); move('context'); }
    catch { setError('No pudimos guardar lo que quieres cambiar. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitContext() {
    const value = cleanText(context); if (!value) return;
    setLoading(true); setError('');
    const now = new Date().toISOString();
    try { await saveProfile({ current_context_original: value, current_context_summary: value.slice(0, 180), current_context_started_at: now, current_context_last_confirmed_at: now, current_context_status: 'active' }); move('personalization'); }
    catch { setError('No pudimos guardar estas situaciones. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitPersonalization(status: 'answered' | 'skipped') {
    const value = cleanText(personalization);
    if (status === 'answered' && !value) return;
    setLoading(true); setError('');
    const nextLearningProfile: LearningProfile = { ...learningProfile, onboarding: { ...(learningProfile.onboarding as LearningProfile | undefined), personalization: { status, response: status === 'answered' ? value : null } } };
    try { await saveProfile({ learning_profile: nextLearningProfile }); setLearningProfile(nextLearningProfile); move('timing'); }
    catch { setError('No pudimos guardar esta preferencia. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitTiming() {
    const selectedTimezone = timezone || countryByCode(countryCode)?.defaultTimezone || '';
    if (!countryCode || !selectedTimezone || !time) return;
    setLoading(true); setError('');
    try {
      await saveProfile({ message_frequency: 1, message_time_1: time, message_time_2: null, timezone: selectedTimezone, country_code: countryCode, voice_style: 'grounded' });
      saveMvpState({ ...readMvpState(), firstName, directionKey: 'trust_own_judgment', directionText: desiredChange, desiredChangeOriginal: desiredChange, currentContextOriginal: context, messageTime1: time, timezone: selectedTimezone });
      saveFunnelState({ onboardingStage: 'whatsapp', preferredName });
      move('whatsapp');
    } catch { setError('No pudimos guardar tu horario. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function handleWhatsappChange(next: WhatsAppConnectionState) {
    setWhatsapp(next);
    if (next.status !== 'connected') return;
    const response = await fetch('/api/profile', { cache: 'no-store' });
    const result = await response.json().catch(() => ({}));
    if (result.profile?.onboarding_completed) router.push('/app');
  }

  return <FunnelFrame><section className="funnel-screen onboarding-story-screen"><div className="funnel-content narrow onboarding-stage" key={stage}>
    {stage === 'identity' && <><h1>Quiero conocerte un poco mejor.</h1><p className="funnel-copy">Ya sé cómo te gusta que te llame. Ahora cuéntame un poco más de ti.</p><label className="field-label" htmlFor="onboarding-first-name">Nombre(s)</label><input id="onboarding-first-name" autoFocus className="funnel-input" value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={120} /><label className="field-label" htmlFor="onboarding-last-name">Apellido(s)</label><input id="onboarding-last-name" className="funnel-input" value={lastName} onChange={event => setLastName(event.target.value)} maxLength={120} /><label className="field-label" htmlFor="onboarding-preferred-name">¿Cómo quieres que NIA te llame?</label><input id="onboarding-preferred-name" className="funnel-input" value={preferredName} onChange={event => setPreferredName(event.target.value)} maxLength={80} /><button className="funnel-button" disabled={loading || !firstName.trim() || !lastName.trim() || !preferredName.trim()} onClick={() => void submitIdentity()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'desired_change' && <><h1>¿Qué quieres cambiar, mejorar o vivir de forma diferente?</h1><p className="funnel-copy">Escríbelo con tus palabras.</p><textarea autoFocus className="funnel-input textarea" value={desiredChange} onChange={event => setDesiredChange(event.target.value)} maxLength={500} /><button className="funnel-button" disabled={loading || !desiredChange.trim()} onClick={() => void submitDesiredChange()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'context' && <><h1>¿En qué situaciones te cuesta actuar como quieres?</h1><p className="funnel-copy">Piensa en esos momentos en los que normalmente vuelves a dudar, te frenas o terminas actuando diferente a como querías.</p><textarea autoFocus className="funnel-input textarea" value={context} onChange={event => setContext(event.target.value)} maxLength={500} /><button className="funnel-button" disabled={loading || !context.trim()} onClick={() => void submitContext()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'personalization' && <><h1>¿Qué tendría que decirte NIA para que realmente te sirva?</h1><p className="funnel-copy">Puede ser una forma de hablarte, algo que quieras recordar o algo que definitivamente no te ayuda.</p><textarea autoFocus className="funnel-input textarea" value={personalization} onChange={event => setPersonalization(event.target.value)} maxLength={500} /><button className="funnel-button" disabled={loading || !personalization.trim()} onClick={() => void submitPersonalization('answered')}>Continuar <ArrowRight size={17} /></button><button className="funnel-button secondary" disabled={loading} onClick={() => void submitPersonalization('skipped')}>Prefiero que NIA lo descubra conmigo</button></>}
    {stage === 'timing' && <><h1>¿A qué hora quieres recibir tu mensaje de NIA?</h1><p className="onboarding-locale-intro">Tu hora local en {countryByCode(countryCode)?.name || 'tu país'} · {timezone ? timezoneLabel(timezone) : 'elige una zona horaria'}. Puedes cambiarla más adelante.</p><div className="onboarding-locale-fields"><label htmlFor="onboarding-country">País<select id="onboarding-country" value={countryCode} onChange={event => { const next = event.target.value; setCountryCode(next); setTimezone(countryByCode(next)?.defaultTimezone || ''); }}><option value="">Elige tu país</option>{COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select></label><label htmlFor="onboarding-timezone">Zona horaria<select id="onboarding-timezone" value={timezone} onChange={event => setTimezone(event.target.value)}><option value="">Elige tu zona horaria</option>{Array.from(new Set([timezone, ...COUNTRY_OPTIONS.map(country => country.defaultTimezone)].filter(Boolean))).map(option => <option key={option} value={option}>{timezoneLabel(option)}</option>)}</select></label><label htmlFor="onboarding-time">Hora de tu mensaje<input id="onboarding-time" type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div><p className="onboarding-timezone-note"><strong>Recibirás tu mensaje a las {timeLabel(time)}</strong> según esta zona horaria.</p><button className="funnel-button" disabled={loading || !time || !countryCode || !timezone} onClick={() => void submitTiming()}>{loading ? 'Guardando…' : 'Continuar'} <ArrowRight size={17} /></button></>}
    {stage === 'whatsapp' && <><h1>Conecta tu WhatsApp</h1><p className="funnel-copy">Aquí llegará tu mensaje diario de NIA. La configuración termina cuando reconozcamos tu número.</p><WhatsAppConnectionPanel value={whatsapp} defaultCountryCode={countryCode || 'CO'} onChange={value => void handleWhatsappChange(value)} onError={setError} onDisconnect={async () => {}} showTest={false} showDisconnect={false} />{error && <p className="funnel-error" role="alert">{error}</p>}</>}
  </div></section></FunnelFrame>;
}
