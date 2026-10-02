/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';
import { createClient } from '@/lib/supabase/client';

export default function AccessPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { const state = readFunnelState(); if (state.email) setEmail(state.email); trackFunnel('account_started'); trackFunnel('access_started'); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); saveFunnelState({ email }); trackFunnel('account_completed'); trackFunnel('email_submitted'); trackFunnel('magic_link_requested');
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback?next=/onboarding' } });
    if (error) setError('No pudimos enviar el acceso. Revisa el email e inténtalo de nuevo.'); else setSent(true); setBusy(false);
  }
  return <FunnelFrame step="TU ACCESO"><section className="funnel-screen"><div className="funnel-content narrow">{sent ? <><h1>Te enviamos tu acceso.</h1><p className="funnel-copy">Abre el enlace que enviamos a {email}. Cuando vuelvas, conservarás el plan y lo que ya probaste.</p><a className="funnel-button" href="/onboarding">Continuar con mi configuración <ArrowRight size={17} /></a></> : <><h1>Perfecto. Solo falta una cosa para guardar lo que acabamos de construir contigo.</h1><p className="funnel-copy">¿A qué correo quieres que te enviemos tu acceso?</p><form onSubmit={submit} className="mt-9"><label htmlFor="funnel-email" className="sr-only">Tu email</label><div className="email-field"><Mail size={18} /><input id="funnel-email" required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Tu email" /></div><button className="funnel-button" disabled={busy}>{busy ? 'Enviando…' : 'Quiero entrar a NIA'} <ArrowRight size={17} /></button></form>{error && <p className="funnel-error" role="alert">{error}</p>}<p className="funnel-note">Usaremos tu correo para enviarte el acceso.</p></>}</div></section></FunnelFrame>;
}
