'use client';

import { useEffect, useRef, useState } from 'react';
import { COUNTRY_OPTIONS, countryByCode } from '@/lib/locale';
import { normalizeNationalPhone } from '@/lib/phone';

type ReplacementState = { status: 'none' | 'pending' | 'conflict' | 'succeeded'; attempt_id?: string | null };

export type WhatsAppConnectionState = {
  status: 'connected' | 'connecting' | 'not_connected' | 'conflict' | 'not_configured' | 'unavailable';
  phone_number?: string | null;
  deep_link?: string | null;
  message?: string;
  replacement?: ReplacementState;
};

type Props = {
  value: WhatsAppConnectionState;
  onChange: (value: WhatsAppConnectionState) => void;
  onError: (message: string) => void;
  onSendTest?: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  defaultCountryCode?: string;
  showTest?: boolean;
  showDisconnect?: boolean;
};

type LinkResponse = { attempt_id?: string; code?: string; deep_link?: string; status?: string; message?: string };
type LinkMode = 'connect' | 'replace';

export function WhatsAppConnectionPanel({ value, defaultCountryCode = 'CO', onChange, onError, onSendTest, onDisconnect, showTest = true, showDisconnect = true }: Props) {
  const [open, setOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [mode, setMode] = useState<LinkMode>('connect');
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [disconnectBusy, setDisconnectBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const [phoneCountry, setPhoneCountry] = useState(defaultCountryCode);
  const [nationalPhone, setNationalPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() { if (pollRef.current) clearInterval(pollRef.current); pollRef.current = null; }

  async function refreshConnection(attemptId?: string) {
    const query = attemptId ? `?attempt_id=${encodeURIComponent(attemptId)}` : '';
    const response = await fetch(`/api/whatsapp/connection${query}`, { cache: 'no-store' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'connection_unavailable');
    const next = (result.connection ?? result) as WhatsAppConnectionState;
    onChange(next);
    return next;
  }

  function beginPolling(attemptId: string, linkMode: LinkMode) {
    stopPolling(); setWaiting(true);
    pollRef.current = setInterval(async () => {
      try {
        const next = await refreshConnection(attemptId);
        const replacementStatus = next.replacement?.status;
        if (linkMode === 'replace') {
          if (replacementStatus === 'succeeded') { stopPolling(); setWaiting(false); setOpen(false); setConfirmedPhone(''); }
          else if (replacementStatus === 'conflict') { stopPolling(); setWaiting(false); setLocalError('Ese número ya está conectado a otra cuenta de NIA.'); }
        } else if (next.status === 'connected') { stopPolling(); setWaiting(false); setOpen(false); }
        else if (next.status === 'conflict') { stopPolling(); setWaiting(false); setLocalError('Este número ya está conectado a otra cuenta de NIA. Usa otro número para continuar.'); }
      } catch { /* Keep the current state during transient polling failures. */ }
    }, 3000);
  }

  async function startLink(expectedPhone: string): Promise<string | null> {
    setBusy(true); setLocalError('');
    try {
      const response = await fetch('/api/whatsapp/link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expected_phone: expectedPhone, mode }) });
      const result = await response.json().catch(() => ({})) as LinkResponse;
      if (!response.ok || !result.code || !result.deep_link || !result.attempt_id) {
        if (result.status === 'not_configured') onChange({ ...value, status: 'not_configured', message: result.message });
        throw new Error(result.message || 'link_unavailable');
      }
      onChange(mode === 'replace' ? { ...value, replacement: { status: 'pending', attempt_id: result.attempt_id }, message: undefined } : { status: 'connecting', deep_link: result.deep_link, replacement: { status: 'none' } });
      beginPolling(result.attempt_id, mode);
      return result.deep_link;
    } catch { setLocalError('No pudimos preparar la conexión. Inténtalo de nuevo.'); onError('No pudimos preparar la conexión de WhatsApp. Inténtalo de nuevo.'); return null; }
    finally { setBusy(false); }
  }

  function resetAttempt(nextMode: LinkMode) { stopPolling(); setWaiting(false); setBusy(false); setLocalError(''); setPhoneError(''); setNationalPhone(''); setConfirmedPhone(''); setPhoneCountry(defaultCountryCode); setMode(nextMode); }
  function openPanel(nextMode: LinkMode) { resetAttempt(nextMode); if (nextMode === 'replace' && value.status === 'connected') onChange({ ...value, replacement: { status: 'none' } }); setOpen(true); }
  function closePanel() { resetAttempt('connect'); setOpen(false); }
  function continueWithPhone() { const normalized = normalizeNationalPhone(nationalPhone, phoneCountry); if (!normalized) { setPhoneError('Escribe un número móvil válido.'); return; } setPhoneError(''); setConfirmedPhone(normalized); }
  function confirmWhatsApp() { if (!confirmedPhone) return; const popup = window.open('about:blank', '_blank'); void startLink(confirmedPhone).then(link => { if (link && popup) popup.location.href = link; else if (link) window.location.href = link; else popup?.close(); }); }
  async function confirmDisconnect() { setDisconnectBusy(true); try { await onDisconnect(); setDisconnectOpen(false); } finally { setDisconnectBusy(false); } }

  useEffect(() => () => stopPolling(), []);

  const replacementConflict = value.status === 'connected' && value.replacement?.status === 'conflict';
  const initialConflict = value.status === 'conflict' && mode === 'connect';
  const title = mode === 'replace' ? 'Cambia tu número de WhatsApp' : 'Confirma tu WhatsApp';
  function renderConnectionDialog() {
    if (!open) return null;
    return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closePanel(); }}><section role="dialog" aria-modal="true" aria-labelledby="whatsapp-connect-title" className="whatsapp-connect-dialog max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] p-6 shadow-2xl sm:rounded-[28px] sm:p-8"><div className="flex items-start justify-between gap-4"><div><h3 id="whatsapp-connect-title">{waiting || value.status === 'connecting' ? 'Esperando tu confirmación…' : replacementConflict || initialConflict ? 'Este número ya está conectado a otra cuenta de NIA.' : title}</h3>{!waiting && value.status !== 'connecting' && <p className="whatsapp-dialog-intro">{replacementConflict ? 'Tu número actual sigue conectado. Prueba con otro número.' : initialConflict ? 'Usa otro número para continuar.' : mode === 'replace' ? 'Tu número actual seguirá conectado hasta que confirmes el nuevo.' : confirmedPhone ? 'Vamos a abrir WhatsApp con un mensaje listo para enviar.' : 'Primero confirma el número en el que recibirás tus mensajes de NIA.'}</p>}</div><button type="button" aria-label="Cerrar" onClick={closePanel} className="whatsapp-dialog-close">×</button></div>{replacementConflict || initialConflict ? <button type="button" onClick={() => { onChange({ ...value, status: 'not_connected', replacement: { status: 'none' }, message: undefined }); resetAttempt('connect'); }} className="whatsapp-dialog-primary">Cambiar número</button> : !waiting && value.status !== 'connecting' && !confirmedPhone ? <div className="whatsapp-phone-step"><label htmlFor="whatsapp-phone-country" className="whatsapp-field-label">País del número<select id="whatsapp-phone-country" value={phoneCountry} onChange={event => setPhoneCountry(event.target.value)} className="whatsapp-dialog-select">{COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.code}>{country.flag} {country.callingCode} · {country.name}</option>)}</select></label><label htmlFor="whatsapp-national-number" className="whatsapp-field-label">Número móvil<div className="whatsapp-phone-input"><span>{countryByCode(phoneCountry)?.callingCode}</span><input id="whatsapp-national-number" inputMode="tel" autoComplete="tel-national" value={nationalPhone} onChange={event => setNationalPhone(event.target.value)} placeholder="3228204878" /></div></label><p className="whatsapp-dialog-helper">Escribe solo tu número, sin el código del país.</p>{phoneError && <p role="alert" className="whatsapp-dialog-error">{phoneError}</p>}<button type="button" disabled={busy || !nationalPhone.trim()} onClick={continueWithPhone} className="whatsapp-dialog-primary">Continuar</button></div> : !waiting && value.status !== 'connecting' && confirmedPhone ? <div className="whatsapp-confirm-step"><p className="whatsapp-dialog-emphasis">Solo toca Enviar. No cambies el mensaje.</p>{localError && <p role="alert" className="whatsapp-dialog-error">{localError}</p>}<button type="button" disabled={busy} onClick={confirmWhatsApp} className="whatsapp-dialog-primary">{busy ? 'Abriendo WhatsApp…' : 'Confirmar WhatsApp'}</button></div> : <div className="whatsapp-dialog-waiting"><p className="whatsapp-dialog-emphasis">Esperando tu confirmación…</p><p className="whatsapp-dialog-helper">En cuanto envíes el mensaje, conectaremos tu WhatsApp automáticamente.</p></div>}</section></div>;
  }

  if (value.status === 'connected') return <>
    <div className="whatsapp-connection-panel-connected mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5">
      <p className="whatsapp-connected-label text-[12px] font-bold uppercase tracking-[.12em] text-[var(--accent)]">Conectado</p>
      <p className="whatsapp-connected-copy mt-3 text-[16px]">Este es el número en el que recibirás tus mensajes de NIA.</p>
      {value.phone_number && <p className="whatsapp-connected-phone mt-2 text-[14px] text-[var(--text-secondary)]">{value.phone_number}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {showTest && onSendTest && <button type="button" disabled={testBusy} onClick={async () => { setTestBusy(true); try { await onSendTest(); } finally { setTestBusy(false); } }} className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)] disabled:opacity-50">{testBusy ? 'Enviando…' : 'Enviar mensaje de prueba'}</button>}
        <button type="button" onClick={() => openPanel('replace')} className="min-h-12 rounded-[var(--radius-button)] border border-black/15 px-5 text-[14px] font-semibold">Cambiar número</button>
        {showDisconnect && <button type="button" onClick={() => setDisconnectOpen(true)} className="min-h-12 rounded-[var(--radius-button)] border border-black/15 px-5 text-[14px] font-semibold">Desconectar WhatsApp</button>}
      </div>
      {value.message && <p role="status" className="mt-3 text-[13px] text-[var(--accent)]">{value.message}</p>}
    </div>
    {disconnectOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="whatsapp-disconnect-title" className="whatsapp-connect-dialog w-full max-w-[560px] rounded-t-[28px] p-6 shadow-2xl sm:rounded-[28px] sm:p-8"><div className="flex items-start justify-between gap-4"><h3 id="whatsapp-disconnect-title">¿Quieres desconectar este WhatsApp de NIA?</h3><button type="button" aria-label="Cerrar" onClick={() => setDisconnectOpen(false)} className="whatsapp-dialog-close">×</button></div><p className="whatsapp-dialog-intro">Dejarás de recibir tus mensajes en este número hasta que conectes otro.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse"><button type="button" disabled={disconnectBusy} onClick={() => void confirmDisconnect()} className="whatsapp-dialog-primary">{disconnectBusy ? 'Desconectando…' : 'Desconectar'}</button><button type="button" onClick={() => setDisconnectOpen(false)} className="whatsapp-dialog-secondary">Cancelar</button></div></section></div>}
    {renderConnectionDialog()}
  </>;

  return <>
    {value.status === 'not_configured' ? <div className="mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><p className="text-[15px]">WhatsApp todavía no está configurado.</p><p className="mt-2 text-[13px] text-[var(--text-secondary)]">La conexión estará disponible cuando terminemos de configurar el proveedor.</p></div> : value.status === 'conflict' ? <div className="mt-6"><h2 className="text-[22px] [font-family:var(--font-display)]">Este número ya está conectado a otra cuenta de NIA.</h2><p className="mt-2 text-[14px] text-[var(--text-secondary)]">Usa otro número para continuar.</p><button type="button" onClick={() => openPanel('connect')} className="mt-5 min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Cambiar número</button></div> : <><p className="mt-3 text-[15px]">Aquí recibirás tus mensajes de NIA.</p><p className="mt-2 text-[14px] text-[var(--text-secondary)]">Para recibir tus mensajes de NIA, primero necesitamos saber desde qué número quieres recibirlos.</p><button type="button" onClick={() => openPanel('connect')} className="mt-5 min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Conectar mi WhatsApp →</button>{value.status === 'connecting' && <p className="mt-3 text-[13px] text-[var(--text-secondary)]">Estamos esperando tu mensaje de WhatsApp.</p>}</>}
    {renderConnectionDialog()}
  </>;
}
