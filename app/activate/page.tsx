'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ActivatePage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setReady(Boolean(data.user)));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Usa una contraseña de al menos 8 caracteres.');
    if (password !== confirmation) return setError('Las contraseñas no coinciden.');
    setBusy(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError('No pudimos crear tu contraseña. Solicita un enlace de activación nuevo.');
      setBusy(false);
      return;
    }
    const response = await fetch('/api/activation/complete', { method: 'POST' });
    if (!response.ok) {
      setError('La contraseña se creó, pero no pudimos terminar la activación. Inténtalo de nuevo.');
      setBusy(false);
      return;
    }
    router.push('/app');
  }

  return <main className="min-h-dvh bg-[var(--bg)] px-5 py-8 [font-family:var(--font-body)] sm:px-8"><div className="mx-auto max-w-[560px]"><Link href="/" className="flex items-center gap-2 text-[15px] font-semibold"><span className="size-2 rounded-full bg-[var(--accent)]" />NIA</Link><section className="pt-24"><h1 className="text-[clamp(40px,7vw,74px)] font-semibold leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">Crea tu contraseña.</h1><p className="mt-8 text-[18px] leading-[1.6] text-[var(--text-secondary)]">Tu cuenta ya está lista. Solo falta que elijas una contraseña para entrar a NIA.</p>{ready === false && <p role="alert" className="mt-6 border-l-2 border-red-700 pl-4 text-[14px] text-red-800">Este enlace ya no es válido. Solicita un enlace de activación nuevo.</p>}{ready && <form onSubmit={submit} className="mt-10 space-y-5"><label className="block text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]" htmlFor="activation-password">Nueva contraseña</label><input id="activation-password" required minLength={8} type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="h-14 w-full border-b-2 border-black/20 bg-transparent text-[20px] outline-none focus:border-[var(--accent)]" /><label className="block text-[12px] font-bold uppercase tracking-[.15em] text-[var(--text-tertiary)]" htmlFor="activation-confirmation">Confirmar contraseña</label><input id="activation-confirmation" required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="h-14 w-full border-b-2 border-black/20 bg-transparent text-[20px] outline-none focus:border-[var(--accent)]" />{error && <p role="alert" className="text-[14px] text-red-700">{error}</p>}<button disabled={busy} className="min-h-[54px] w-full rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-50">{busy ? 'Activando…' : 'Entrar a NIA'}</button></form>}</section></div></main>;
}
