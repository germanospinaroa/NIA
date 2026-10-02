/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';
import { createClient } from '@/lib/supabase/client';

export default function AccessPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const state = readFunnelState(); if (state.email) setEmail(state.email); if (state.firstName) setName(state.firstName); trackFunnel('account_started'); trackFunnel('access_started'); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); saveFunnelState({ email }); trackFunnel('account_completed'); trackFunnel('email_submitted'); trackFunnel('magic_link_requested'); trackFunnel('magic_link_sent');
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback?next=/onboarding' } });
    if (error) setError('No pudimos enviar el acceso. Revisa el email e inténtalo de nuevo.'); else setSent(true); setBusy(false);
  }
  return <FunnelFrame step="TU ACCESO"><section className="funnel-screen"><div className="funnel-content narrow">{sent ? <><h1>Revisa tu correo.</h1><p className="funnel-copy">Te enviamos un enlace para entrar a NIA.</p><button type="button" className="funnel-button" onClick={() => { setSent(false); setError(''); trackFunnel('magic_link_retry'); }}>Volver a intentarlo <ArrowRight size={17} /></button></> : <><h1>Ya casi estamos, {name || 'mucho gusto'}.</h1><p className="funnel-copy">Déjame un correo para enviarte tu acceso.</p><form onSubmit={submit} className="mt-9"><label htmlFor="funnel-email" className="sr-only">Tu correo</label><div className="email-field"><Mail size={18} /><input id="funnel-email" required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Tu correo" /></div><button className="funnel-button" disabled={busy}>{busy ? 'Enviando…' : 'Continuar'} <ArrowRight size={17} /></button></form>{error && <p className="funnel-error" role="alert">{error}</p>}</>}</div></section></FunnelFrame>;
}
