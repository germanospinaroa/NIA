/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { WhatsAppConnectionPanel, type WhatsAppConnectionState } from '@/components/app/WhatsAppConnectionPanel';
import { readFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';
import { readMvpState, saveMvpState } from '@/lib/mvp';
import { isInvalidPreferredName, safePreferredName } from '@/lib/profile-name';
import { hasConfirmedOnboardingIdentity } from '@/lib/onboarding-identity';
import { COUNTRY_OPTIONS, countryByCode, countryFromBrowserLocale, timeLabel, timezoneFromBrowser, timezoneLabel } from '@/lib/locale';
import {
  CONTEXT_OPTIONS,
  DESIRED_CHANGE_DIRECTION_KEYS,
  DESIRED_CHANGE_OPTIONS,
  SUPPORT_OPTIONS,
  buildContextOriginal,
  buildContextSummary,
  normalizeChoiceText,
  optionLabel,
  type ContextChoiceKey,
  type DesiredChangeKey,
  type SupportChoiceKey,
} from '@/lib/onboarding-choices';

type Stage = 'identity' | 'desired_change' | 'context' | 'personalization' | 'timing' | 'whatsapp';
type LearningProfile = Record<string, unknown>;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function onboardingRecord(profile: LearningProfile) {
  return record(profile.onboarding);
}

function answeredSection(profile: LearningProfile, key: string) {
  const section = record(onboardingRecord(profile)[key]);
  return section.status === 'answered' || section.status === 'skipped' ? section : null;
}

function isOptionKey(options: readonly { key: string }[], value: unknown): value is string {
  return typeof value === 'string' && options.some(option => option.key === value);
}

function validDesiredAnswer(profile: LearningProfile) {
  const section = answeredSection(profile, 'desired_change');
  if (!section || !isOptionKey(DESIRED_CHANGE_OPTIONS, section.key)) return false;
  return section.key !== 'other' || Boolean(normalizeChoiceText(section.custom_text));
}

function validContextAnswer(profile: LearningProfile) {
  const section = answeredSection(profile, 'context');
  const selections = Array.isArray(section?.selections) ? section.selections : [];
  const keys = selections.map(selection => typeof selection === 'string' ? selection : record(selection).key).filter(key => isOptionKey(CONTEXT_OPTIONS, key));
  return Boolean(section) && keys.length >= 1 && keys.length <= 4 && (!keys.includes('other') || Boolean(normalizeChoiceText(section?.custom_text)));
}

function validPersonalizationAnswer(profile: LearningProfile) {
  const section = answeredSection(profile, 'personalization');
  const selections = Array.isArray(section?.selections) ? section.selections : [];
  const keys = selections.map(selection => typeof selection === 'string' ? selection : record(selection).key).filter(key => isOptionKey(SUPPORT_OPTIONS, key));
  return Boolean(section) && keys.length >= 1 && keys.length <= 2 && (!keys.includes('other') || Boolean(normalizeChoiceText(section?.custom_text)));
}

function restoreKeys(section: Record<string, unknown> | null, options: readonly { key: string }[]) {
  const selections = Array.isArray(section?.selections) ? section.selections : [];
  return selections.map(selection => typeof selection === 'string' ? selection : record(selection).key).filter((key): key is string => isOptionKey(options, key));
}

function stageForCompletionError(error: unknown): Stage | null {
  if (error === 'identity_required') return 'identity';
  if (error === 'desired_change_required') return 'desired_change';
  if (error === 'current_context_required') return 'context';
  if (error === 'personalization_required') return 'personalization';
  if (error === 'timing_required') return 'timing';
  return null;
}

function ChoiceCards({ options, selected, max, onToggle, loading }: { options: readonly { key: string; label: string }[]; selected: string[]; max: number; onToggle: (key: string) => void; loading: boolean }) {
  return <div className="onboarding-choice-list" role="group">
    {options.map(option => {
      const isSelected = selected.includes(option.key);
      const atLimit = max > 1 && selected.length >= max && !isSelected;
      return <button key={option.key} type="button" className={`onboarding-choice ${isSelected ? 'is-selected' : ''} ${atLimit ? 'is-limit-disabled' : ''}`} aria-pressed={isSelected} disabled={loading || atLimit} onClick={() => onToggle(option.key)}>
        <span>{option.label}</span>{isSelected && <Check size={19} aria-hidden="true" />}
      </button>;
    })}
  </div>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('identity');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [desiredChoice, setDesiredChoice] = useState<DesiredChangeKey | ''>('');
  const [desiredCustom, setDesiredCustom] = useState('');
  const [contextChoices, setContextChoices] = useState<ContextChoiceKey[]>([]);
  const [contextCustom, setContextCustom] = useState('');
  const [supportChoices, setSupportChoices] = useState<SupportChoiceKey[]>([]);
  const [supportCustom, setSupportCustom] = useState('');
  const [learningProfile, setLearningProfile] = useState<LearningProfile>({});
  const [time, setTime] = useState('08:00');
  const [countryCode, setCountryCode] = useState('');
  const [timezone, setTimezone] = useState('');
  const [whatsapp, setWhatsapp] = useState<WhatsAppConnectionState>({ status: 'not_connected' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completionRetry, setCompletionRetry] = useState(false);

  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [stage]);

  const completeOnboarding = useCallback(async () => {
    setLoading(true); setError(''); setCompletionRetry(false);
    try {
      const response = await fetch('/api/onboarding/complete', { method: 'POST' });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (response.ok || result.error === 'already_completed') { router.replace('/app'); return; }
      const missingStage = stageForCompletionError(result.error);
      if (response.status === 422 && missingStage) {
        setStage(missingStage); saveFunnelState({ onboardingStage: missingStage }); return;
      }
      setError('No pudimos terminar tu configuración ahora. Inténtalo de nuevo.');
      setCompletionRetry(true);
    } catch {
      setError('No pudimos terminar tu configuración ahora. Inténtalo de nuevo.');
      setCompletionRetry(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const funnel = readFunnelState();
    const funnelPreferred = funnel.preferredNameConfirmed === true ? safePreferredName(funnel.preferredName) : '';
    const detectedCountry = countryFromBrowserLocale() || 'CO';
    const detectedTimezone = timezoneFromBrowser();
    setCountryCode(detectedCountry); setTimezone(detectedTimezone);
    fetch('/api/profile', { cache: 'no-store' }).then(async response => {
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push('/acceso'); return; }
      const profile = (result.profile ?? {}) as Record<string, unknown>;
      if (profile.onboarding_completed) { router.push('/app'); return; }
      const nextFirst = safePreferredName(profile.first_name);
      const nextLast = safePreferredName(profile.last_name);
      const profilePreferred = safePreferredName(profile.preferred_name);
      const nextPreferred = profilePreferred || funnelPreferred;
      const nextLearning = record(profile.learning_profile);
      const desired = record(onboardingRecord(nextLearning).desired_change);
      const context = record(onboardingRecord(nextLearning).context);
      const personalization = record(onboardingRecord(nextLearning).personalization);
      const restoredDesired = isOptionKey(DESIRED_CHANGE_OPTIONS, desired.key) ? desired.key as DesiredChangeKey : '';
      const restoredContext = restoreKeys(context, CONTEXT_OPTIONS).slice(0, 4) as ContextChoiceKey[];
      const restoredSupport = restoreKeys(personalization, SUPPORT_OPTIONS).slice(0, 2) as SupportChoiceKey[];
      setFirstName(nextFirst); setLastName(nextLast); setPreferredName(nextPreferred);
      setDesiredChoice(restoredDesired); setDesiredCustom(normalizeChoiceText(desired.custom_text));
      setContextChoices(restoredContext); setContextCustom(normalizeChoiceText(context.custom_text));
      setSupportChoices(restoredSupport); setSupportCustom(normalizeChoiceText(personalization.custom_text)); setLearningProfile(nextLearning);
      const nextCountry = normalizeChoiceText(profile.country_code) || detectedCountry;
      const nextTimezone = normalizeChoiceText(profile.timezone) || detectedTimezone || countryByCode(nextCountry)?.defaultTimezone || '';
      setTime(normalizeChoiceText(profile.message_time_1) || '08:00'); setCountryCode(nextCountry); setTimezone(nextTimezone);
      const connectionResponse = await fetch('/api/whatsapp/connection', { cache: 'no-store' });
      const connectionResult = await connectionResponse.json().catch(() => ({}));
      const nextWhatsapp = (connectionResult.connection ?? connectionResult) as WhatsAppConnectionState;
      setWhatsapp(nextWhatsapp);
      const nextStage: Stage | null = !hasConfirmedOnboardingIdentity(nextLearning) ? 'identity' : !validDesiredAnswer(nextLearning) ? 'desired_change' : !validContextAnswer(nextLearning) ? 'context' : !validPersonalizationAnswer(nextLearning) ? 'personalization' : (!normalizeChoiceText(profile.message_time_1) || !normalizeChoiceText(profile.country_code)) ? 'timing' : nextWhatsapp.status === 'connected' ? null : 'whatsapp';
      if (nextStage) {
        setStage(nextStage);
        saveFunnelState({ onboardingStage: nextStage });
      } else {
        setStage('whatsapp');
        saveFunnelState({ onboardingStage: 'whatsapp' });
        await completeOnboarding();
      }
    }).catch(() => setError('No pudimos cargar tu configuración. Vuelve a intentarlo.'));
    trackFunnel('onboarding_started');
  }, [completeOnboarding, router]);

  async function saveProfile(values: Record<string, unknown>) {
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
    if (!response.ok) throw new Error('PROFILE_SAVE_ERROR');
    const result = await response.json().catch(() => ({}));
    return (result.profile ?? {}) as Record<string, unknown>;
  }

  function mergeOnboarding(section: string, value: unknown) { return { ...learningProfile, onboarding: { ...onboardingRecord(learningProfile), [section]: value } }; }
  function move(next: Stage) { setStage(next); saveFunnelState({ onboardingStage: next }); }

  async function submitIdentity() {
    const nextFirst = normalizeChoiceText(firstName); const nextLast = normalizeChoiceText(lastName); const nextPreferred = safePreferredName(preferredName);
    if (isInvalidPreferredName(nextFirst) || isInvalidPreferredName(nextLast)) return;
    if (!nextFirst || !nextLast || !nextPreferred) return;
    setLoading(true); setError('');
    try {
      const nextLearningProfile = { ...learningProfile, onboarding: { ...onboardingRecord(learningProfile), identity: { status: 'answered', confirmed_at: new Date().toISOString() } } };
      await saveProfile({ first_name: nextFirst, last_name: nextLast, preferred_name: nextPreferred, learning_profile: nextLearningProfile });
      setLearningProfile(nextLearningProfile);
      saveFunnelState({ preferredName: nextPreferred, preferredNameConfirmed: true });
      const nextStage: Stage | null = !validDesiredAnswer(nextLearningProfile) ? 'desired_change' : !validContextAnswer(nextLearningProfile) ? 'context' : !validPersonalizationAnswer(nextLearningProfile) ? 'personalization' : (!time || !countryCode || !timezone) ? 'timing' : whatsapp.status === 'connected' ? null : 'whatsapp';
      if (nextStage) {
        move(nextStage);
      } else {
        setStage('whatsapp');
        saveFunnelState({ onboardingStage: 'whatsapp' });
        await completeOnboarding();
      }
    }
    catch { setError('No pudimos guardar tus datos. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitDesiredChange() {
    if (!desiredChoice) return;
    const option = DESIRED_CHANGE_OPTIONS.find(item => item.key === desiredChoice);
    const customText = desiredChoice === 'other' ? normalizeChoiceText(desiredCustom) : '';
    if (!option || (desiredChoice === 'other' && !customText)) return;
    const label = desiredChoice === 'other' ? 'Otro' : option.label;
    const directionText = desiredChoice === 'other' ? customText : option.label;
    const directionKey = desiredChoice === 'other' ? 'custom' : DESIRED_CHANGE_DIRECTION_KEYS[desiredChoice];
    setLoading(true); setError('');
    try { const nextLearningProfile = mergeOnboarding('desired_change', { status: 'answered', key: desiredChoice, label, custom_text: desiredChoice === 'other' ? customText : null }); await saveProfile({ direction_key: directionKey, direction_text: directionText, desired_change_original: directionText, desired_change_summary: directionText.slice(0, 180), desired_change_status: 'active', learning_profile: nextLearningProfile }); setLearningProfile(nextLearningProfile); move('context'); }
    catch { setError('No pudimos guardar lo que quieres cambiar. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitContext() {
    const labels = contextChoices.map(key => optionLabel(CONTEXT_OPTIONS, key));
    const customText = contextChoices.includes('other') ? normalizeChoiceText(contextCustom) : '';
    if (!labels.length || (contextChoices.includes('other') && !customText)) return;
    const now = new Date().toISOString(); const original = buildContextOriginal(labels, customText); const summary = buildContextSummary(labels, customText);
    setLoading(true); setError('');
    try { const nextLearningProfile = mergeOnboarding('context', { status: 'answered', selections: contextChoices.map(key => ({ key, label: optionLabel(CONTEXT_OPTIONS, key) })), custom_text: contextChoices.includes('other') ? customText : null }); await saveProfile({ current_context_original: original, current_context_summary: summary, current_context_domain: 'decision_doubt', current_context_started_at: now, current_context_last_confirmed_at: now, current_context_status: 'active', learning_profile: nextLearningProfile }); setLearningProfile(nextLearningProfile); move('personalization'); }
    catch { setError('No pudimos guardar estas situaciones. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitPersonalization() {
    if (!supportChoices.length) return;
    const customText = supportChoices.includes('other') ? normalizeChoiceText(supportCustom) : '';
    if (supportChoices.includes('other') && !customText) return;
    const discoverWithMe = supportChoices.includes('discover_with_me'); const labels = supportChoices.map(key => optionLabel(SUPPORT_OPTIONS, key));
    const nextSection = discoverWithMe ? { status: 'skipped', selections: ['discover_with_me'], custom_text: null, response: null } : { status: 'answered', selections: supportChoices.map(key => ({ key, label: optionLabel(SUPPORT_OPTIONS, key) })), custom_text: supportChoices.includes('other') ? customText : null, response: [...labels.filter(label => label !== 'Otro'), ...(customText ? [customText] : [])].join('. ') };
    setLoading(true); setError('');
    try { const nextLearningProfile = mergeOnboarding('personalization', nextSection); await saveProfile({ learning_profile: nextLearningProfile }); setLearningProfile(nextLearningProfile); move('timing'); }
    catch { setError('No pudimos guardar esta preferencia. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  async function submitTiming() {
    const selectedTimezone = timezone || countryByCode(countryCode)?.defaultTimezone || '';
    if (!countryCode || !selectedTimezone || !time) return;
    const desiredText = desiredChoice === 'other'
      ? normalizeChoiceText(desiredCustom)
      : desiredChoice ? optionLabel(DESIRED_CHANGE_OPTIONS, desiredChoice) : '';
    const contextText = buildContextOriginal(contextChoices.map(key => optionLabel(CONTEXT_OPTIONS, key)), contextCustom);
    setLoading(true); setError('');
    try { await saveProfile({ message_frequency: 1, message_time_1: time, message_time_2: null, timezone: selectedTimezone, country_code: countryCode, voice_style: 'grounded' }); saveMvpState({ ...readMvpState(), firstName, directionKey: 'trust_own_judgment', directionText: desiredText, desiredChangeOriginal: desiredText, currentContextOriginal: contextText, messageTime1: time, timezone: selectedTimezone }); saveFunnelState({ onboardingStage: 'whatsapp', preferredName }); move('whatsapp'); }
    catch { setError('No pudimos guardar tu horario. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  }

  function toggleContext(key: string) {
    const typedKey = key as ContextChoiceKey;
    setContextChoices(current => current.includes(typedKey) ? current.filter(item => item !== typedKey) : current.length < 4 ? [...current, typedKey] : current);
    if (typedKey === 'other' && contextChoices.includes('other')) setContextCustom('');
  }

  function toggleSupport(key: string) {
    const typedKey = key as SupportChoiceKey;
    setSupportChoices(current => { if (typedKey === 'discover_with_me') return current.includes(typedKey) ? [] : ['discover_with_me']; const withoutDiscover = current.filter(item => item !== 'discover_with_me'); return withoutDiscover.includes(typedKey) ? withoutDiscover.filter(item => item !== typedKey) : withoutDiscover.length < 2 ? [...withoutDiscover, typedKey] : withoutDiscover; });
    if (typedKey === 'discover_with_me' || (supportChoices.includes('other') && typedKey !== 'other') || (typedKey === 'other' && supportChoices.includes('other'))) setSupportCustom('');
  }

  async function handleWhatsappChange(next: WhatsAppConnectionState) {
    setWhatsapp(next);
    if (next.status !== 'connected') return;
    await completeOnboarding();
  }

  const canContextContinue = contextChoices.length > 0 && (!contextChoices.includes('other') || Boolean(contextCustom.trim()));
  const canSupportContinue = supportChoices.length > 0 && (!supportChoices.includes('other') || Boolean(supportCustom.trim()));

  return <FunnelFrame><section className="funnel-screen onboarding-story-screen"><div className="funnel-content narrow onboarding-stage" key={stage}>
    {stage === 'identity' && <><h1>Quiero conocerte un poco mejor.</h1><p className="funnel-copy">Solo necesito un par de datos para completar tu perfil.</p><label className="field-label" htmlFor="onboarding-first-name">Nombre(s)</label><input id="onboarding-first-name" autoFocus className="funnel-input" value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={120} /><label className="field-label" htmlFor="onboarding-last-name">Apellido(s)</label><input id="onboarding-last-name" className="funnel-input" value={lastName} onChange={event => setLastName(event.target.value)} maxLength={120} /><label className="field-label" htmlFor="onboarding-preferred-name">¿Cómo quieres que te llame?</label><input id="onboarding-preferred-name" className="funnel-input" value={preferredName} onChange={event => setPreferredName(event.target.value)} placeholder="Tu nombre" maxLength={80} /><button className="funnel-button" disabled={loading || !firstName.trim() || !lastName.trim() || !preferredName.trim()} onClick={() => void submitIdentity()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'desired_change' && <><h1>¿Qué te gustaría empezar a cambiar primero?</h1><p className="funnel-copy">Elige una opción.</p><ChoiceCards options={DESIRED_CHANGE_OPTIONS} selected={desiredChoice ? [desiredChoice] : []} max={1} loading={loading} onToggle={key => { const next = key as DesiredChangeKey; setDesiredChoice(next); if (next !== 'other') setDesiredCustom(''); }} />{desiredChoice === 'other' && <label className="onboarding-custom-field" htmlFor="onboarding-desired-other">Cuéntame qué quieres trabajar<input id="onboarding-desired-other" className="funnel-input" value={desiredCustom} onChange={event => setDesiredCustom(event.target.value)} maxLength={300} /></label>}<button className="funnel-button" disabled={loading || !desiredChoice || (desiredChoice === 'other' && !desiredCustom.trim())} onClick={() => void submitDesiredChange()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'context' && <><h1>¿En qué momentos te cuesta más actuar como quieres?</h1><p className="funnel-copy">Puedes elegir varias.</p><p className="onboarding-selection-helper">Elige hasta 4.</p><ChoiceCards options={CONTEXT_OPTIONS} selected={contextChoices} max={4} loading={loading} onToggle={toggleContext} />{contextChoices.includes('other') && <label className="onboarding-custom-field" htmlFor="onboarding-context-other">¿En qué otro momento te pasa?<input id="onboarding-context-other" className="funnel-input" value={contextCustom} onChange={event => setContextCustom(event.target.value)} maxLength={300} /></label>}<button className="funnel-button" disabled={loading || !canContextContinue} onClick={() => void submitContext()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'personalization' && <><h1>Cuando empiezas a dudar, ¿qué crees que podría ayudarte más?</h1><p className="funnel-copy">Puedes elegir hasta dos.</p><ChoiceCards options={SUPPORT_OPTIONS} selected={supportChoices} max={2} loading={loading} onToggle={toggleSupport} />{supportChoices.includes('other') && <label className="onboarding-custom-field" htmlFor="onboarding-support-other">¿Qué suele ayudarte?<input id="onboarding-support-other" className="funnel-input" value={supportCustom} onChange={event => setSupportCustom(event.target.value)} maxLength={300} /></label>}<button className="funnel-button" disabled={loading || !canSupportContinue} onClick={() => void submitPersonalization()}>Continuar <ArrowRight size={17} /></button></>}
    {stage === 'timing' && <><h1>¿A qué hora quieres recibir tu mensaje?</h1><p className="onboarding-locale-intro">Tu hora local en {countryByCode(countryCode)?.name || 'tu país'} · {timezone ? timezoneLabel(timezone) : 'elige una zona horaria'}. Puedes cambiarla más adelante.</p><div className="onboarding-locale-fields"><label htmlFor="onboarding-country">País<select id="onboarding-country" value={countryCode} onChange={event => { const next = event.target.value; setCountryCode(next); setTimezone(countryByCode(next)?.defaultTimezone || ''); }}><option value="">Elige tu país</option>{COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select></label><label htmlFor="onboarding-timezone">Zona horaria<select id="onboarding-timezone" value={timezone} onChange={event => setTimezone(event.target.value)}><option value="">Elige tu zona horaria</option>{Array.from(new Set([timezone, ...COUNTRY_OPTIONS.map(country => country.defaultTimezone)].filter(Boolean))).map(option => <option key={option} value={option}>{timezoneLabel(option)}</option>)}</select></label><label htmlFor="onboarding-time">Hora de tu mensaje<input id="onboarding-time" type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div><p className="onboarding-timezone-note"><strong>Recibirás tu mensaje a las {timeLabel(time)}</strong> según esta zona horaria.</p><button className="funnel-button" disabled={loading || !time || !countryCode || !timezone} onClick={() => void submitTiming()}>{loading ? 'Guardando…' : 'Continuar'} <ArrowRight size={17} /></button></>}
    {stage === 'whatsapp' && <><h1>Conecta tu WhatsApp</h1><p className="funnel-copy">Aquí recibirás tu mensaje diario. La configuración termina cuando reconozcamos tu número.</p><WhatsAppConnectionPanel value={whatsapp} defaultCountryCode={countryCode || 'CO'} onChange={value => void handleWhatsappChange(value)} onError={setError} onDisconnect={async () => {}} showTest={false} showDisconnect={false} />{error && <p className="funnel-error" role="alert">{error}</p>}{completionRetry && <button type="button" className="funnel-button" disabled={loading} onClick={() => void completeOnboarding()}>{loading ? 'Continuando…' : 'Continuar'} <ArrowRight size={17} /></button>}</>}
  </div></section></FunnelFrame>;
}
