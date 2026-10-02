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
  useEffect(() => { const state = readFunnelState(); if (state.email) setEmail(state.email); trackFunnel('account_started'); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); saveFunnelState({ email }); trackFunnel('account_completed');
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/onboarding' } });
    setSent(!error); setBusy(false);
  }
  return <FunnelFrame step="TU ACCESO"><section className="funnel-screen"><div className="funnel-content narrow">{sent ? <><p className="eyebrow">REVISA TU CORREO</p><h1>Te enviamos tu acceso.</h1><p className="funnel-copy">Abre el enlace de acceso que enviamos a {email}. Cuando vuelvas, conservarás el plan y lo que ya probaste.</p><a className="funnel-button" href="/onboarding">Continuar con mi configuración <ArrowRight size={17} /></a></> : <><p className="eyebrow">GUARDAR Y CONTINUAR</p><h1>¿A dónde te enviamos tu acceso?</h1><form onSubmit={submit} className="mt-9"><label htmlFor="funnel-email" className="sr-only">Tu email</label><div className="email-field"><Mail size={18} /><input id="funnel-email" required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Tu email" /></div><button className="funnel-button" disabled={busy}>{busy ? 'Enviando…' : 'Continuar'} <ArrowRight size={17} /></button></form><p className="funnel-note">Usaremos tu email solo para guardar tu acceso y ayudarte a entrar.</p></>}</div></section></FunnelFrame>;
}
