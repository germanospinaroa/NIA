'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [phase, setPhase] = useState<'email' | 'code' | 'password'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sendCode(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const result = await createClient().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: false } });
    if (result.error) setError('Si existe una cuenta con ese correo, podrás recibir un código. Inténtalo de nuevo en unos minutos.');
    else setPhase('code');
    setBusy(false);
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const result = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: 'email' });
    if (result.error) setError('Ese código no es válido o ya expiró. Solicita uno nuevo.');
    else setPhase('password');
    setBusy(false);
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirmation) { setError('Usa al menos 8 caracteres y repite la misma contraseña.'); return; }
    setBusy(true); setError('');
    const result = await createClient().auth.updateUser({ password });
    if (result.error) setError('No pudimos actualizar la contraseña. Solicita un código nuevo.');
    else router.push('/app');
    setBusy(false);
  }

  return <main className="min-h-dvh bg-[var(--bg)] px-5 py-8 [font-family:var(--font-body)] sm:px-8"><div className="mx-auto max-w-[520px]"><Link href="/login" className="text-[15px] font-semibold">← Volver a entrar</Link><section className="pt-24"><h1 className="text-[clamp(42px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">Recupera tu acceso.</h1>{phase === 'email' && <form onSubmit={sendCode} className="mt-10"><label htmlFor="recovery-email" className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]">Correo electrónico</label><input required id="recovery-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-3 h-14 w-full border-b-2 border-black/20 bg-transparent text-[20px] outline-none focus:border-[var(--accent)]" /><button disabled={busy} className="mt-8 min-h-[54px] w-full rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-50">{busy ? 'Enviando…' : 'Enviar código'}</button></form>}{phase === 'code' && <form onSubmit={verifyCode} className="mt-10"><p className="text-[16px] leading-6 text-[var(--text-secondary)]">Revisa tu correo. Te enviamos un código de 6 dígitos.</p><label htmlFor="recovery-code" className="sr-only">Código</label><input required id="recovery-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="mt-6 h-14 w-full border-b-2 border-black/20 bg-transparent text-center text-[24px] tracking-[.3em] outline-none focus:border-[var(--accent)]" /><button disabled={busy || code.length !== 6} className="mt-8 min-h-[54px] w-full rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-50">{busy ? 'Comprobando…' : 'Confirmar código'}</button></form>}{phase === 'password' && <form onSubmit={savePassword} className="mt-10 space-y-5"><label htmlFor="new-password" className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]">Nueva contraseña</label><input required minLength={8} id="new-password" type="password" value={password} onChange={event => setPassword(event.target.value)} className="h-14 w-full border-b-2 border-black/20 bg-transparent text-[20px] outline-none focus:border-[var(--accent)]" /><label htmlFor="confirm-password" className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]">Repite la contraseña</label><input required minLength={8} id="confirm-password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="h-14 w-full border-b-2 border-black/20 bg-transparent text-[20px] outline-none focus:border-[var(--accent)]" /><button disabled={busy} className="min-h-[54px] w-full rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar contraseña'}</button></form>}{error && <p role="alert" className="mt-5 text-[14px] text-red-700">{error}</p>}</section></div></main>;
}
