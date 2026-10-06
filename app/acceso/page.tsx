/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';
import { createClient } from '@/lib/supabase/client';

export default function AccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => { const state = readFunnelState(); if (state.email) setEmail(state.email); trackFunnel('account_started'); trackFunnel('access_started'); }, []);
  useEffect(() => { if (!cooldown) return; const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [cooldown]);
  async function requestCode() {
    setBusy(true); setError('');
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const eligibility = await fetch('/api/auth/access/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: normalizedEmail }) });
      if (!eligibility.ok) throw new Error('access_unavailable');
      saveFunnelState({ email: normalizedEmail }); trackFunnel('account_completed'); trackFunnel('email_submitted'); trackFunnel('access_code_sent'); setSent(true); setCooldown(30);
    } catch (cause) {
      console.error('[auth] access code request failed', { reason: cause instanceof Error ? cause.message : 'unknown' });
      setError('No pudimos enviar el código ahora. Inténtalo de nuevo en unos minutos.');
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) { event.preventDefault(); void requestCode(); }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const result = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
    if (result.error) setError('Ese código no es válido o ya expiró. Solicita uno nuevo.');
    else { trackFunnel('access_code_verified'); router.push('/activate'); }
    setBusy(false);
  }
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow">{sent ? <><h1>Revisa tu correo.</h1><p className="funnel-copy">Te enviamos un código de 6 dígitos para confirmar tu correo.</p><form onSubmit={verify} className="mt-9"><label htmlFor="access-code" className="sr-only">Código de 6 dígitos</label><input id="access-code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="funnel-input text-center tracking-[.3em]" /><button className="funnel-button" disabled={busy || code.length !== 6}>{busy ? 'Comprobando…' : 'Confirmar correo'} <ArrowRight size={17} /></button></form><button type="button" disabled={busy || cooldown > 0} className="mt-5 text-[14px] font-semibold underline disabled:opacity-40" onClick={() => { setCode(''); void requestCode(); }}>{cooldown ? `Enviar otro código en ${cooldown}s` : 'Enviar otro código'}</button>{error && <p className="funnel-error" role="alert">{error}</p>}</> : <><h1>¿Con qué correo hiciste tu compra?</h1><p className="funnel-copy">Lo usaremos para encontrar tu acceso a NIA y enviarte un código de confirmación.</p><form onSubmit={submit} className="mt-9"><label htmlFor="funnel-email" className="sr-only">Correo de compra</label><div className="email-field"><Mail size={18} /><input id="funnel-email" required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Tu correo" /></div><button className="funnel-button" disabled={busy}>{busy ? 'Comprobando…' : 'Continuar'} <ArrowRight size={17} /></button></form>{error && <p className="funnel-error" role="alert">{error}</p>}</>}</div></section></FunnelFrame>;
}
