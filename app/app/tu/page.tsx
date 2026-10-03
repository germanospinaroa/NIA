'use client';

import { useEffect, useMemo, useState } from 'react';
import { MvpShell } from '@/components/app/MvpShell';
import { WhatsAppConnectionPanel, type WhatsAppConnectionState } from '@/components/app/WhatsAppConnectionPanel';
import { guidedSuggestions, intentionLabel, intentionOptions, type IntentionKey, unclearGuidanceOptions, validCustomIntention } from '@/lib/intention';

type Profile = { first_name?: string; direction_key?: string | null; direction_text?: string | null; desired_change_original?: string | null; message_frequency?: number; message_time_1?: string | null; message_time_2?: string | null; timezone?: string | null };
type Draft = { directionKey: IntentionKey | ''; customText: string; frequency: 1 | 2; time: string; secondTime: string; timezone: string };

function profileDraft(profile: Profile): Draft {
  const key = profile.direction_key as IntentionKey | undefined;
  const known = intentionLabel(key);
  const valid = key === 'custom' ? validCustomIntention(profile.desired_change_original || profile.direction_text) : Boolean(known);
  return {
    directionKey: valid ? key || '' : '',
    customText: key === 'custom' && valid ? (profile.desired_change_original || profile.direction_text || '') : '',
    frequency: profile.message_frequency === 2 ? 2 : 1,
    time: profile.message_time_1 || '',
    secondTime: profile.message_time_2 || '',
    timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
}

export default function TuPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [draft, setDraft] = useState<Draft>({ directionKey: '', customText: '', frequency: 1, time: '', secondTime: '', timezone: 'UTC' });
  const [savedDraft, setSavedDraft] = useState<Draft | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [guidedStep, setGuidedStep] = useState<0 | 1 | 2 | 3>(0);
  const [guidedFirst, setGuidedFirst] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppConnectionState>({ status: 'not_connected' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');

  async function fetchWhatsApp() {
    const response = await fetch('/api/whatsapp/connection');
    const result = await response.json().catch(() => ({}));
    return result.connection ?? { status: result.status ?? 'unavailable', message: result.message };
  }

  useEffect(() => {
    Promise.all([fetch('/api/profile'), fetchWhatsApp()]).then(async ([profileResponse, whatsappState]) => {
      const result = await profileResponse.json().catch(() => ({}));
      if (!profileResponse.ok || !result.profile) throw new Error('profile');
      const next = result.profile as Profile;
      const initial = profileDraft(next);
      setProfile(next); setEmail(result.email ?? ''); setDraft(initial); setSavedDraft(initial); setWhatsapp(whatsappState as WhatsAppConnectionState);
    }).catch(() => setError('No pudimos cargar tu configuración. Vuelve a intentarlo.')).finally(() => setLoading(false));
    return undefined;
  }, []);

  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedDraft), [draft, savedDraft]);
  const selectedLabel = draft.directionKey === 'custom' ? draft.customText : intentionLabel(draft.directionKey);
  const customValid = draft.directionKey !== 'custom' || validCustomIntention(draft.customText);

  function chooseIntention(key: IntentionKey) {
    setSavedMessage(''); setError('');
    if (key === 'custom') { setCustomOpen(true); setGuidedStep(0); setSuggestion(null); return; }
    if (key === 'intention_unclear') { setDraft(current => ({ ...current, directionKey: key, customText: '' })); setGuidedStep(1); setSuggestion(null); return; }
    setCustomOpen(false); setGuidedStep(0); setSuggestion(null); setDraft(current => ({ ...current, directionKey: key, customText: '' }));
  }

  function chooseGuidedFirst(value: string) { setGuidedFirst(value); setGuidedStep(2); }
  function chooseSuggestion(label: string, key: string) { setDraft(current => ({ ...current, directionKey: key as IntentionKey, customText: '' })); setSuggestion(label); setGuidedStep(3); }

  async function saveChanges() {
    if (!hasChanges || !customValid || (draft.directionKey === '' && !selectedLabel)) return;
    setSaving(true); setSavedMessage(''); setError('');
    const selectedText = draft.directionKey === 'custom' ? draft.customText.trim() : intentionLabel(draft.directionKey);
    const payload = {
      direction_key: draft.directionKey,
      direction_text: draft.directionKey === 'intention_unclear' ? null : selectedText,
      desired_change_original: draft.directionKey === 'intention_unclear' ? null : selectedText,
      desired_change_summary: draft.directionKey === 'intention_unclear' ? null : selectedText?.slice(0, 180),
      message_frequency: draft.frequency,
      message_time_1: draft.time || null,
      message_time_2: draft.frequency === 2 ? draft.secondTime || null : null,
      timezone: draft.timezone,
    };
    try {
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'PROFILE_SAVE_ERROR');
      setProfile(result.profile); setSavedDraft(draft); setSavedMessage('Cambios guardados.');
    } catch (saveError) {
      setError(saveError instanceof Error && saveError.message === 'invalid_intention' ? 'Elige una intención válida antes de guardar.' : 'No pudimos guardar tus cambios. Inténtalo de nuevo.');
    } finally { setSaving(false); }
  }

  async function disconnect() { const response = await fetch('/api/whatsapp/disconnect', { method: 'POST' }); if (!response.ok) { setError('No pudimos desconectar este WhatsApp. Inténtalo de nuevo.'); return; } setWhatsapp(await fetchWhatsApp() as WhatsAppConnectionState); }
  async function sendTest() { const response = await fetch('/api/whatsapp/test', { method: 'POST' }); const result = await response.json().catch(() => ({})); if (!response.ok) { setError(result.message || 'No pudimos enviar el mensaje de prueba.'); return; } setWhatsapp(current => ({ ...current, message: 'Mensaje enviado.' })); }

  if (loading) return <MvpShell title="Tú"><section className="pt-8"><p className="text-[var(--text-secondary)]">Cargando tu configuración…</p></section></MvpShell>;
  return <MvpShell title="Tú"><section className="pt-8 pb-12"><p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[var(--accent)]">TÚ</p><h1 className="mt-5 max-w-[720px] text-[clamp(39px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">Lo esencial para que NIA trabaje contigo.</h1>
    {error && <p role="alert" className="mt-6 border-l-2 border-red-700 pl-4 text-[14px] text-red-800">{error}</p>}
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[28px] [font-family:var(--font-display)]">¿Qué te gustaría empezar a cambiar en ti?</h2><p className="mt-3 max-w-[620px] text-[15px] text-[var(--text-secondary)]">Elige aquello en lo que quieres que NIA te apoye.</p><div className="mt-6 grid gap-2">{intentionOptions.map(option => <button key={option.key} type="button" onClick={() => chooseIntention(option.key)} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[15px] transition-colors ${draft.directionKey === option.key ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)] hover:border-[var(--accent)]/60'}`}>{option.label}</button>)}<button type="button" onClick={() => chooseIntention('custom')} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[15px] ${draft.directionKey === 'custom' ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)]'}`}>Hay algo más que quiero trabajar.</button><button type="button" onClick={() => chooseIntention('intention_unclear')} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[15px] ${draft.directionKey === 'intention_unclear' ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)]'}`}>Todavía no sé qué quiero trabajar.</button></div>
      {customOpen && <div className="mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><h3 className="text-[22px] [font-family:var(--font-display)]">Cuéntame qué quieres trabajar.</h3><p className="mt-2 text-[14px] text-[var(--text-secondary)]">No tienes que explicarlo perfecto. Escríbelo como se lo contarías a una amiga.</p><textarea value={draft.customText} onChange={event => setDraft(current => ({ ...current, directionKey: 'custom', customText: event.target.value }))} placeholder="Quiero empezar a..." className="mt-4 min-h-28 w-full resize-none rounded-[var(--radius-card)] border border-black/10 bg-[var(--bg)] p-4 text-[16px] outline-none focus:border-[var(--accent)]" /><p className="mt-4 text-[12px] text-[var(--text-secondary)]">Guarda los cambios cuando estés lista.</p></div>}
      {guidedStep > 0 && <div className="mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><h3 className="text-[22px] [font-family:var(--font-display)]">Está bien. No tienes que tenerlo claro todavía.</h3><p className="mt-2 text-[14px] text-[var(--text-secondary)]">Vamos a descubrir qué es lo que más sentido tiene para ti.</p>{guidedStep === 1 && <><p className="mt-6 text-[18px] [font-family:var(--font-display)]">Cuando algo te preocupa últimamente, ¿qué suele pasar más?</p><div className="mt-4 grid gap-2">{unclearGuidanceOptions.map(option => <button key={option} type="button" onClick={() => chooseGuidedFirst(option)} className="min-h-12 rounded-[var(--radius-card)] border border-black/10 p-3 text-left text-[14px] hover:border-[var(--accent)]">{option}</button>)}</div></>}{guidedStep === 2 && !suggestion && <><p className="mt-6 text-[18px] [font-family:var(--font-display)]">Si pudieras empezar por una sola cosa, ¿cuál te ayudaría más?</p><div className="mt-4 grid gap-2">{guidedSuggestions.map(option => <button key={option.key} type="button" onClick={() => chooseSuggestion(option.label, option.key)} className="min-h-12 rounded-[var(--radius-card)] border border-black/10 p-3 text-left text-[14px] hover:border-[var(--accent)]">{option.label}</button>)}</div><p className="mt-4 text-[12px] text-[var(--text-secondary)]">Tomo en cuenta que elegiste: {guidedFirst}</p></>}{suggestion && <><h4 className="mt-6 text-[20px] [font-family:var(--font-display)]">Creo que podríamos empezar por aquí.</h4><p className="mt-3 text-[18px] leading-[1.25] [font-family:var(--font-display)]">{suggestion}</p><p className="mt-3 text-[14px] text-[var(--text-secondary)]">Por lo que me cuentas, creo que esto puede ser un buen punto de partida.</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => { setGuidedStep(0); setSavedMessage(''); }} className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Sí, quiero trabajar esto.</button><button type="button" onClick={() => { setGuidedStep(1); setSuggestion(null); }} className="min-h-12 rounded-[var(--radius-button)] border border-black/15 px-5 text-[14px] font-semibold">Quiero elegir otra cosa.</button></div></>}</div>}
    </section>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[28px] [font-family:var(--font-display)]">Tus mensajes</h2><p className="mt-3 text-[15px] text-[var(--text-secondary)]">Elige cuántas veces y cuándo quieres recibirlos.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setDraft(current => ({ ...current, frequency: 1 }))} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[14px] font-semibold ${draft.frequency === 1 ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)]'}`}>1 vez al día</button><button type="button" onClick={() => setDraft(current => ({ ...current, frequency: 2 }))} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[14px] font-semibold ${draft.frequency === 2 ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)]'}`}>2 veces al día</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]" htmlFor="message-time-1">Hora<input id="message-time-1" type="time" value={draft.time} onChange={event => setDraft(current => ({ ...current, time: event.target.value }))} className="mt-2 block h-12 border-b-2 border-black/20 bg-transparent text-[18px] text-[var(--text-primary)]" /></label>{draft.frequency === 2 && <label className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]" htmlFor="message-time-2">Segunda hora<input id="message-time-2" type="time" value={draft.secondTime} onChange={event => setDraft(current => ({ ...current, secondTime: event.target.value }))} className="mt-2 block h-12 border-b-2 border-black/20 bg-transparent text-[18px] text-[var(--text-primary)]" /></label>}</div></section>
    <div className="sticky bottom-3 z-10 mt-8 flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-black/10 bg-[var(--bg)]/95 p-3 backdrop-blur"><button type="button" disabled={!hasChanges || !customValid || !draft.directionKey || saving} onClick={saveChanges} className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[14px] font-semibold text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40">{saving ? 'Guardando…' : 'Guardar cambios'}</button>{hasChanges && <span className="text-[13px] text-[var(--text-secondary)]">Tienes cambios sin guardar.</span>}{savedMessage && <span role="status" className="text-[13px] text-[var(--accent)]">{savedMessage}</span>}</div>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[28px] [font-family:var(--font-display)]">WhatsApp</h2><WhatsAppConnectionPanel value={whatsapp} onChange={setWhatsapp} onError={setError} onSendTest={sendTest} onDisconnect={disconnect} /></section>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[28px] [font-family:var(--font-display)]">Cuenta</h2><p className="mt-5 text-[18px]">{profile?.first_name || 'Tu cuenta'}</p><p className="mt-2 text-[15px] text-[var(--text-secondary)]">{email}</p></section><section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[28px] [font-family:var(--font-display)]">Privacidad</h2><p className="mt-3 text-[14px] leading-[1.5] text-[var(--text-secondary)]">NIA utiliza lo que decides compartir para hacer sus mensajes más relevantes para ti.</p></section>
  </section></MvpShell>;
}
