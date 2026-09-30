'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { const hash = new URLSearchParams(window.location.hash.slice(1)); const accessToken = hash.get('access_token'); const refreshToken = hash.get('refresh_token'); if (accessToken && refreshToken) supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }); else supabase.auth.getSession(); const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setError(''); }); return () => data.subscription.unsubscribe(); }, [supabase.auth]);
  async function submit(event: FormEvent) { event.preventDefault(); if (password.length < 8 || password !== confirm) { setError('Usa al menos 8 caracteres y repite la misma contraseña.'); return; } setBusy(true); await supabase.auth.getSession(); const { error: updateError } = await supabase.auth.updateUser({ password }); if (updateError) setError('No pudimos actualizar la contraseña. Solicita un enlace nuevo.'); else router.push('/app'); setBusy(false); }
  return <main className="min-h-dvh bg-[var(--bg)] px-5 py-8 [font-family:var(--font-body)]"><div className="mx-auto max-w-[520px]"><p className="font-semibold">NIA</p><section className="pt-24"><h1 className="text-[clamp(42px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">Vuelve a entrar con calma.</h1><form onSubmit={submit} className="mt-10 space-y-5"><label htmlFor="new-password" className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]">Nueva contraseña</label><input required minLength={8} id="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="h-14 w-full border-b-2 border-[color-mix(in_oklab,var(--text-primary)_22%,transparent)] bg-transparent text-[20px] outline-none focus:border-[var(--accent)]"/><label htmlFor="confirm-password" className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]">Repite la contraseña</label><input required minLength={8} id="confirm-password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="h-14 w-full border-b-2 border-[color-mix(in_oklab,var(--text-primary)_22%,transparent)] bg-transparent text-[20px] outline-none focus:border-[var(--accent)]"/>{error&&<p role="alert" className="text-[14px] text-red-700">{error}</p>}<button disabled={busy} className="min-h-[54px] w-full rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-50">{busy?'Guardando…':'Guardar contraseña'}</button></form></section></div></main>;
}
