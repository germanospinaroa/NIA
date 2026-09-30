/* eslint-disable react-hooks/set-state-in-effect -- hydrate local preview name after the browser is available. */
'use client';

import Link from 'next/link';
import { Compass, Heart, Home, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const items = [
  { href: '/app', label: 'Hoy', icon: Home },
  { href: '/app/punto', label: 'Punto NIA', icon: Compass },
  { href: '/app/evidencia', label: 'Evidencia', icon: Heart },
  { href: '/app/tu', label: 'Tú', icon: UserRound },
];

export function MvpShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Laura');
  useEffect(() => { fetch('/api/profile').then(response => response.ok ? response.json() : null).then(payload => { if (payload?.profile?.first_name) setName(payload.profile.first_name); }); }, []);
  return <div className="min-h-dvh bg-[var(--bg)] pb-24 text-[var(--text-primary)] [font-family:var(--font-body)]"><header className="mx-auto flex max-w-[920px] items-center justify-between px-5 py-6 sm:px-8"><Link href="/app" className="flex items-center gap-2 text-[15px] font-semibold"><span className="size-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />NIA</Link><div className="flex items-center gap-4 text-right"><div><p className="text-[12px] text-[var(--text-tertiary)]">{title ?? 'Tu espacio'}</p><p className="text-[13px] font-semibold">{name}</p></div><button type="button" onClick={async()=>{await createClient().auth.signOut();router.push('/login');}} className="text-[12px] underline underline-offset-4">Salir</button></div></header><main className="mx-auto max-w-[920px] px-5 sm:px-8">{children}</main><nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-[color-mix(in_oklab,var(--text-primary)_12%,transparent)] bg-[color-mix(in_oklab,var(--bg)_94%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur"><div className="mx-auto grid max-w-[620px] grid-cols-4 px-2 py-2">{items.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${active ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}><Icon size={18} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span></Link>; })}</div></nav></div>;
}

export function PreviewGate({ children }: { children: ReactNode }) { return <div className="mb-8 border-l-2 border-[var(--accent)] pl-4 text-[13px] leading-[1.5] text-[var(--text-secondary)]">{children}</div>; }
