'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/forgot-password'); }, [router]);
  return <main className="grid min-h-dvh place-items-center bg-[var(--bg)] px-5"><p className="text-[16px] text-[var(--text-secondary)]">Te llevamos al flujo seguro para cambiar tu contraseña…</p></main>;
}
