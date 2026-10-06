'use client';

import { useEffect, useRef, useState } from 'react';

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
  showTest?: boolean;
  showDisconnect?: boolean;
};

type LinkResponse = { code?: string; deep_link?: string; nia_number?: string | null; expires_at?: string; status?: string; message?: string };

export function WhatsAppConnectionPanel({ value, onChange, onError, onSendTest, onDisconnect, showTest = true, showDisconnect = true }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const [code, setCode] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [niaNumber, setNiaNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [localError, setLocalError] = useState('');
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
    setTimedOut(false);
    let checks = 0;
    pollRef.current = setInterval(async () => {
      checks += 1;
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
      if (checks >= 20) {
        stopPolling();
        setWaiting(false);
        setTimedOut(true);
      }
    }, 3000);
  }

  async function startLink() {
    setBusy(true);
    setLocalError('');
    setTimedOut(false);
    try {
      const response = await fetch('/api/whatsapp/link', { method: 'POST' });
      const result = await response.json().catch(() => ({})) as LinkResponse;
      if (!response.ok || !result.code || !result.deep_link) {
        if (result.status === 'not_configured') onChange({ status: 'not_configured', message: result.message });
        throw new Error(result.message || 'link_unavailable');
      }
      setCode(result.code);
      setDeepLink(result.deep_link);
      setNiaNumber(result.nia_number || '');
      setExpiresAt(result.expires_at || null);
      onChange({ status: 'connecting', deep_link: result.deep_link });
      beginPolling();
    } catch {
      setLocalError('No pudimos preparar la conexión. Inténtalo de nuevo.');
      onError('No pudimos preparar la conexión de WhatsApp. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  function openPanel() {
    setOpen(true);
    setLocalError('');
    if (value.status !== 'connecting') void startLink();
    else if (!code) { setTimedOut(false); void startLink(); }
  }

  useEffect(() => () => stopPolling(), []);

  if (value.status === 'connected') {
    return <div className="mt-6 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5">
      <p className="text-[12px] font-bold uppercase tracking-[.12em] text-[var(--accent)]">Conectado</p>
      <p className="mt-3 text-[16px]">Este es el número en el que recibirás tus mensajes de NIA.</p>
      {value.phone_number && <p className="mt-2 text-[14px] text-[var(--text-secondary)]">{value.phone_number}</p>}
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
      <section role="dialog" aria-modal="true" aria-labelledby="whatsapp-connect-title" className="max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[28px] bg-[var(--bg)] p-6 shadow-2xl sm:rounded-[28px] sm:p-8">
        <div className="flex items-start justify-between gap-4"><h3 id="whatsapp-connect-title" className="text-[34px] leading-[.98] tracking-[-.04em] [font-family:var(--font-display)]">Conecta tu WhatsApp</h3><button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="text-2xl leading-none text-[var(--text-secondary)]">×</button></div>
        <p className="mt-5 text-[15px] leading-6">Es muy sencillo. Escríbele primero a NIA desde el número que quieres usar.</p>
        <ol className="mt-6 space-y-5"><li><p className="font-semibold">1. Abre WhatsApp</p><p className="mt-1 text-[14px] text-[var(--text-secondary)]">Usa el número en el que quieres recibir tus mensajes de NIA.</p></li><li><p className="font-semibold">2. Escríbele a NIA</p><p className="mt-2 rounded-[16px] border border-black/10 bg-[var(--surface)] px-4 py-3 text-center text-[20px] font-semibold tracking-[.04em]">{niaNumber || 'Cargando número…'}</p><button type="button" disabled={!deepLink || busy} onClick={() => window.open(deepLink, '_blank', 'noopener,noreferrer')} className="mt-3 min-h-11 w-full rounded-[var(--radius-button)] border border-black/15 px-4 text-[14px] font-semibold disabled:opacity-40">Escribir a NIA →</button></li><li><p className="font-semibold">3. Envía este mensaje</p><p className="mt-2 rounded-[16px] bg-[var(--chip-bg)] px-4 py-3 text-center text-xl font-bold tracking-[.08em] text-[var(--accent)]">{busy ? 'Generando…' : code || 'NIA-XXXX'}</p><p className="mt-2 text-[14px] text-[var(--text-secondary)]">Envíalo tal cual. Cuando recibamos el mensaje, reconoceremos automáticamente tu número.</p></li></ol>
        {(waiting || value.status === 'connecting') && <div className="mt-6 rounded-[18px] border border-[var(--accent)]/30 bg-[var(--chip-bg)] p-4"><p className="font-semibold">Estamos esperando tu mensaje.</p><p className="mt-1 text-[14px] text-[var(--text-secondary)]">Cuando llegue, conectaremos automáticamente este número con tu cuenta.</p>{expiresAt && <p className="mt-2 text-[12px] text-[var(--text-secondary)]">Este código es válido durante unos minutos.</p>}</div>}
        {timedOut && <div className="mt-5 rounded-[18px] border border-black/10 bg-[var(--surface)] p-4"><p className="text-[14px]">Todavía no hemos recibido tu mensaje. Comprueba que lo enviaste desde el número que quieres usar con NIA.</p><button type="button" onClick={() => void startLink()} className="mt-3 font-semibold text-[var(--accent)]">Intentar de nuevo</button></div>}
        {localError && <p role="alert" className="mt-5 text-[14px] text-red-800">{localError}</p>}
        <button type="button" disabled={!code || busy} onClick={() => { setWaiting(true); beginPolling(); }} className="mt-6 min-h-12 w-full rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)] disabled:opacity-40">Ya envié el mensaje</button>
      </section>
    </div>}
  </>;
}
