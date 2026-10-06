'use client';

import { useEffect, useRef, useState } from 'react';
import { COUNTRY_OPTIONS, countryByCode } from '@/lib/locale';
import { normalizeNationalPhone } from '@/lib/phone';

export type WhatsAppConnectionState = {
  status: 'connected' | 'connecting' | 'not_connected' | 'conflict' | 'not_configured' | 'unavailable';
  phone_number?: string | null;
  deep_link?: string | null;
  message?: string;
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

type LinkResponse = { code?: string; deep_link?: string; nia_number?: string | null; expires_at?: string; status?: string; message?: string };

export function WhatsAppConnectionPanel({ value, defaultCountryCode = 'CO', onChange, onError, onSendTest, onDisconnect, showTest = true, showDisconnect = true }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [phoneCountry, setPhoneCountry] = useState(defaultCountryCode);
  const [nationalPhone, setNationalPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  async function refreshConnection() {
    const response = await fetch('/api/whatsapp/connection', { cache: 'no-store' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'connection_unavailable');
    const next = (result.connection ?? result) as WhatsAppConnectionState;
    onChange(next);
    return next;
  }

  function beginPolling() {
    stopPolling();
    setWaiting(true);
    pollRef.current = setInterval(async () => {
      try {
        const next = await refreshConnection();
        if (next.status === 'connected') {
          stopPolling();
          setWaiting(false);
          setOpen(false);
        }
      } catch {
        // A transient poll failure should not erase a valid pending code.
      }
    }, 3000);
  }

  async function startLink(expectedPhone: string): Promise<string | null> {
    setBusy(true);
    setLocalError('');
    try {
      const response = await fetch('/api/whatsapp/link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expected_phone: expectedPhone }) });
      const result = await response.json().catch(() => ({})) as LinkResponse;
      if (!response.ok || !result.code || !result.deep_link) {
        if (result.status === 'not_configured') onChange({ status: 'not_configured', message: result.message });
        throw new Error(result.message || 'link_unavailable');
      }
      onChange({ status: 'connecting', deep_link: result.deep_link });
      beginPolling();
      return result.deep_link;
    } catch {
      setLocalError('No pudimos preparar la conexión. Inténtalo de nuevo.');
      onError('No pudimos preparar la conexión de WhatsApp. Inténtalo de nuevo.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  function openPanel() {
    setOpen(true);
    setLocalError('');
    setPhoneError('');
    if (value.status !== 'connecting') setConfirmedPhone('');
  }

  function continueWithPhone() {
    const normalized = normalizeNationalPhone(nationalPhone, phoneCountry);
    if (!normalized) { setPhoneError('Escribe un número móvil válido.'); return; }
    setPhoneError('');
    setConfirmedPhone(normalized);
  }

  function confirmWhatsApp() {
    if (!confirmedPhone) return;
    const popup = window.open('about:blank', '_blank');
    void startLink(confirmedPhone).then(link => {
      if (link && popup) popup.location.href = link;
      else if (link) window.location.href = link;
      else popup?.close();
    });
  }

  useEffect(() => () => stopPolling(), []);

  if (value.status === 'connected') {
    return <div className="whatsapp-connection-panel-connected mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5">
      <p className="whatsapp-connected-label text-[12px] font-bold uppercase tracking-[.12em] text-[var(--accent)]">Conectado</p>
      <p className="whatsapp-connected-copy mt-3 text-[16px]">Este es el número en el que recibirás tus mensajes de NIA.</p>
      {value.phone_number && <p className="whatsapp-connected-phone mt-2 text-[14px] text-[var(--text-secondary)]">{value.phone_number}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {showTest && onSendTest && <button type="button" disabled={testBusy} onClick={async () => { setTestBusy(true); try { await onSendTest(); } finally { setTestBusy(false); } }} className="min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)] disabled:opacity-50">{testBusy ? 'Enviando…' : 'Enviar mensaje de prueba'}</button>}
        {showDisconnect && <button type="button" onClick={async () => { if (window.confirm('¿Quieres desconectar este número de NIA?')) await onDisconnect(); }} className="min-h-12 rounded-[var(--radius-button)] border border-black/15 px-5 text-[14px] font-semibold">Cambiar WhatsApp</button>}
      </div>
      {value.message && <p role="status" className="mt-3 text-[13px] text-[var(--accent)]">{value.message}</p>}
    </div>;
  }

  return <>
    {value.status === 'not_configured' ? <div className="mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><p className="text-[15px]">WhatsApp todavía no está configurado.</p><p className="mt-2 text-[13px] text-[var(--text-secondary)]">La conexión estará disponible cuando terminemos de configurar el proveedor.</p></div> : value.status === 'conflict' ? <p className="mt-4 text-[15px]">Este WhatsApp ya está conectado a otra cuenta de NIA.</p> : <>
      <p className="mt-3 text-[15px]">Aquí recibirás tus mensajes de NIA.</p>
      <p className="mt-2 text-[14px] text-[var(--text-secondary)]">Para recibir tus mensajes de NIA, primero necesitamos saber desde qué número quieres recibirlos.</p>
      <button type="button" onClick={openPanel} className="mt-5 min-h-12 rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Conectar mi WhatsApp →</button>
      {value.status === 'connecting' && <p className="mt-3 text-[13px] text-[var(--text-secondary)]">Estamos esperando tu mensaje de WhatsApp.</p>}
    </>}
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="whatsapp-connect-title" className="whatsapp-connect-dialog max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] p-6 shadow-2xl sm:rounded-[28px] sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><h3 id="whatsapp-connect-title" className="text-[34px] leading-[.98] tracking-[-.04em] [font-family:var(--font-display)]">{waiting || value.status === 'connecting' ? 'Esperando tu confirmación…' : 'Confirma tu WhatsApp'}</h3>{!waiting && value.status !== 'connecting' && <p className="whatsapp-dialog-intro">{confirmedPhone ? 'Vamos a abrir WhatsApp con un mensaje listo para enviar.' : 'Primero confirma el número en el que recibirás tus mensajes de NIA.'}</p>}</div><button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="text-2xl leading-none text-[var(--text-secondary)]">×</button></div>
        {!waiting && value.status !== 'connecting' && !confirmedPhone && <div className="whatsapp-phone-step"><label htmlFor="whatsapp-phone-country" className="whatsapp-field-label">País del número<select id="whatsapp-phone-country" value={phoneCountry} onChange={event => setPhoneCountry(event.target.value)} className="whatsapp-dialog-select">{COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.code}>{country.flag} {country.callingCode} · {country.name}</option>)}</select></label><label htmlFor="whatsapp-national-number" className="whatsapp-field-label">Número móvil<div className="whatsapp-phone-input"><span>{countryByCode(phoneCountry)?.callingCode}</span><input id="whatsapp-national-number" inputMode="tel" autoComplete="tel-national" value={nationalPhone} onChange={event => setNationalPhone(event.target.value)} placeholder="3228204878" /></div></label><p className="whatsapp-dialog-helper">Escribe solo tu número, sin el código del país.</p>{phoneError && <p role="alert" className="whatsapp-dialog-error">{phoneError}</p>}<button type="button" disabled={busy || !nationalPhone.trim()} onClick={continueWithPhone} className="whatsapp-dialog-primary">Continuar</button></div>}
        {!waiting && value.status !== 'connecting' && confirmedPhone && <div className="whatsapp-confirm-step"><p className="whatsapp-dialog-emphasis">Solo toca Enviar. No cambies el mensaje.</p>{localError && <p role="alert" className="whatsapp-dialog-error">{localError}</p>}<button type="button" disabled={busy} onClick={confirmWhatsApp} className="whatsapp-dialog-primary">{busy ? 'Abriendo WhatsApp…' : 'Confirmar WhatsApp'}</button></div>}
        {(waiting || value.status === 'connecting') && <div className="mt-6 rounded-[18px] border border-[var(--accent)]/30 bg-[var(--chip-bg)] p-4"><p className="font-semibold">Esperando tu confirmación…</p><p className="mt-1 text-[14px] text-[var(--text-secondary)]">En cuanto envíes el mensaje, conectaremos tu WhatsApp automáticamente.</p></div>}
      </section>
    </div>}
  </>;
}
