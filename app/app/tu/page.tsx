'use client';

import { useEffect, useRef, useState } from 'react';
import { MvpShell } from '@/components/app/MvpShell';

type Profile = { first_name?: string; email?: string; direction_text?: string; desired_change_original?: string; message_frequency?: number; message_time_1?: string | null; message_time_2?: string | null; timezone?: string | null };
type WhatsAppState = { status: 'connected' | 'connecting' | 'not_connected' | 'conflict' | 'not_configured' | 'unavailable'; phone_number?: string | null; deep_link?: string | null; message?: string };

export default function TuPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [direction, setDirection] = useState('');
  const [frequency, setFrequency] = useState(1);
  const [time, setTime] = useState('');
  const [secondTime, setSecondTime] = useState('');
  const [whatsapp, setWhatsapp] = useState<WhatsAppState>({ status: 'not_connected' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [changing, setChanging] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setWhatsapp(whatsappState as WhatsAppState);
      setProfile(next); setEmail(result.email ?? ''); setDirection(next.desired_change_original || next.direction_text || ''); setFrequency(next.message_frequency ?? 1); setTime(next.message_time_1 || ''); setSecondTime(next.message_time_2 || '');
    }).catch(() => setError('No pudimos cargar tu configuración. Vuelve a intentarlo.')).finally(() => setLoading(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => { if (whatsapp.status !== 'connecting') return; let checks = 0; pollRef.current = setInterval(async () => { checks += 1; setWhatsapp(await fetchWhatsApp() as WhatsAppState); if (checks >= 40 && pollRef.current) clearInterval(pollRef.current); }, 3000); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, [whatsapp.status]);

  async function save(values: Record<string, unknown>) {
    setSaving(true); setSaved(false); setError('');
    try { const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) }); if (!response.ok) throw new Error('save'); const result = await response.json(); setProfile(result.profile); setSaved(true); } catch { setError('No pudimos guardar este cambio. Inténtalo de nuevo.'); } finally { setSaving(false); }
  }

  async function connectWhatsApp() {
    setError(''); setWhatsapp({ status: 'connecting' });
    const response = await fetch('/api/whatsapp/link', { method: 'POST' }); const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.deep_link) { setWhatsapp({ status: result.status === 'not_configured' ? 'not_configured' : 'unavailable', message: result.message }); return; }
    setWhatsapp({ status: 'connecting', deep_link: result.deep_link }); window.open(result.deep_link, '_blank', 'noopener,noreferrer');
  }

  async function disconnect() { setChanging(false); setError(''); const response = await fetch('/api/whatsapp/disconnect', { method: 'POST' }); if (!response.ok) { setError('No pudimos desconectar este WhatsApp. Inténtalo de nuevo.'); return; } setWhatsapp(await fetchWhatsApp() as WhatsAppState); }

  async function sendTest() { setError(''); const response = await fetch('/api/whatsapp/test', { method: 'POST' }); const result = await response.json().catch(() => ({})); if (!response.ok) { setError(result.message || 'No pudimos enviar el mensaje de prueba.'); return; } setWhatsapp(current => ({ ...current, message: 'Mensaje de prueba enviado.' })); }

  if (loading) return <MvpShell title="Tú"><section className="pt-8"><p className="text-[var(--text-secondary)]">Cargando tu configuración…</p></section></MvpShell>;
  return <MvpShell title="Tú"><section className="pt-8 pb-10"><p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[var(--accent)]">TÚ</p><h1 className="mt-5 text-[clamp(39px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">Lo esencial para que NIA trabaje contigo.</h1>{error && <p role="alert" className="mt-6 border-l-2 border-red-700 pl-4 text-[14px] text-red-800">{error}</p>}{saved && <p className="mt-6 text-[13px] text-[var(--accent)]">Guardado.</p>}
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[23px] [font-family:var(--font-display)]">Lo que quieres trabajar</h2><textarea value={direction} onChange={event => setDirection(event.target.value)} onBlur={() => direction.trim() && save({ direction_text: direction.trim(), desired_change_original: direction.trim(), desired_change_summary: direction.trim().slice(0, 180) })} className="mt-5 min-h-28 w-full resize-none rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-4 text-[17px] leading-[1.35] outline-none focus:border-[var(--accent)]" aria-label="Lo que quieres trabajar" /><p className="mt-3 text-[13px] text-[var(--text-secondary)]">NIA usará esto para construir mensajes relacionados con lo que estás intentando cambiar.</p></section>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[23px] [font-family:var(--font-display)]">Tus mensajes</h2><p className="mt-3 text-[14px] text-[var(--text-secondary)]">Cuántas veces quieres recibirlos durante el día.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => { setFrequency(1); save({ message_frequency: 1, message_time_2: null }); }} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[14px] font-semibold ${frequency === 1 ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)]'}`}>1 vez al día</button><button type="button" onClick={() => { setFrequency(2); save({ message_frequency: 2, message_time_2: secondTime || '18:00' }); }} className={`min-h-14 rounded-[var(--radius-card)] border p-4 text-left text-[14px] font-semibold ${frequency === 2 ? 'border-[var(--accent)] bg-[var(--chip-bg)]' : 'border-black/10 bg-[var(--surface)]'}`}>2 veces al día</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]" htmlFor="message-time-1">Hora<input id="message-time-1" type="time" value={time} onChange={event => setTime(event.target.value)} onBlur={() => time && save({ message_time_1: time, timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' })} className="mt-2 block h-12 border-b-2 border-black/20 bg-transparent text-[18px] text-[var(--text-primary)]" /></label>{frequency === 2 && <label className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]" htmlFor="message-time-2">Segunda hora<input id="message-time-2" type="time" value={secondTime} onChange={event => setSecondTime(event.target.value)} onBlur={() => secondTime && save({ message_time_2: secondTime })} className="mt-2 block h-12 border-b-2 border-black/20 bg-transparent text-[18px] text-[var(--text-primary)]" /></label>}</div>{saving && <p className="mt-3 text-[13px] text-[var(--text-secondary)]">Guardando…</p>}</section>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[23px] [font-family:var(--font-display)]">WhatsApp</h2>{whatsapp.status === 'connected' ? <><p className="mt-3 text-[15px]">Tu WhatsApp ya está conectado con NIA.</p>{whatsapp.phone_number && <p className="mt-2 text-[14px] text-[var(--text-secondary)]">{whatsapp.phone_number}</p>}<button type="button" onClick={sendTest} className="mt-5 min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Enviar mensaje de prueba</button><button type="button" onClick={() => setChanging(true)} className="ml-4 mt-5 text-[13px] font-semibold underline underline-offset-4">Cambiar WhatsApp</button>{whatsapp.message && <p className="mt-3 text-[13px] text-[var(--accent)]">{whatsapp.message}</p>}</> : whatsapp.status === 'connecting' ? <><p className="mt-3 text-[15px]">Estamos esperando tu mensaje de WhatsApp.</p><p className="mt-2 text-[13px] text-[var(--text-secondary)]">Abre WhatsApp y envía el mensaje preparado. Esta pantalla se actualizará cuando lo recibamos.</p></> : whatsapp.status === 'conflict' ? <p className="mt-3 text-[15px]">Este WhatsApp ya está conectado a otra cuenta de NIA.</p> : whatsapp.status === 'not_configured' ? <><p className="mt-3 text-[15px]">La conexión de WhatsApp todavía no está disponible.</p><p className="mt-2 text-[13px] text-[var(--text-secondary)]">Falta configurar el número oficial y el proveedor de mensajes.</p></> : <><p className="mt-3 text-[15px]">Aquí recibirás tus mensajes de NIA.</p><p className="mt-2 text-[14px] text-[var(--text-secondary)]">Conecta el WhatsApp que quieres usar con NIA. Solo tienes que enviarnos un mensaje desde ese número para comprobar que todo está bien.</p><button type="button" onClick={connectWhatsApp} className="mt-5 min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Conectar mi WhatsApp →</button></>}{changing && <div className="mt-5 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-4"><p className="text-[15px]">¿Quieres cambiar el WhatsApp donde recibes tus mensajes de NIA?</p><div className="mt-4 flex gap-4"><button type="button" onClick={disconnect} className="font-semibold text-[var(--accent)]">Sí, cambiarlo</button><button type="button" onClick={() => setChanging(false)} className="font-semibold underline underline-offset-4">Cancelar</button></div></div>}</section>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[23px] [font-family:var(--font-display)]">Cuenta</h2><label className="mt-5 block text-[12px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]" htmlFor="profile-name">Nombre</label><input id="profile-name" value={profile?.first_name || ''} onChange={event => setProfile(current => ({ ...(current || {}), first_name: event.target.value }))} onBlur={() => profile?.first_name?.trim() && save({ first_name: profile.first_name.trim() })} className="mt-2 h-12 w-full border-b-2 border-black/20 bg-transparent text-[18px] outline-none focus:border-[var(--accent)]" /><p className="mt-4 text-[15px] text-[var(--text-secondary)]">{email}</p></section>
    <section className="mt-10 border-t border-black/10 pt-8"><h2 className="text-[23px] [font-family:var(--font-display)]">Privacidad</h2><p className="mt-3 text-[14px] leading-[1.5] text-[var(--text-secondary)]">NIA utiliza lo que decides compartir para hacer sus mensajes más relevantes para ti.</p></section>
  </section></MvpShell>;
}
