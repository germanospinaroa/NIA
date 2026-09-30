/* eslint-disable react-hooks/set-state-in-effect -- load the authenticated product state after browser session hydration. */
'use client';
import { useEffect, useState } from 'react';
import { MvpShell } from '@/components/app/MvpShell';
import { defaultMvpState, trackMvp, type MvpState } from '@/lib/mvp';

export default function AppHomePage() {
  const [state, setState] = useState<MvpState>(defaultMvpState); const [daily, setDaily] = useState(''); const [error, setError] = useState(false); const [greeting, setGreeting] = useState('Buenos días');
  useEffect(() => { const hour = new Date().getHours(); setGreeting(hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'); trackMvp('app_home_viewed'); Promise.all([fetch('/api/profile').then(async r => { if (!r.ok) throw new Error('profile'); return r.json(); }), fetch('/api/daily').then(async r => { if (!r.ok) throw new Error('daily'); return r.json(); })]).then(([profile, dailyPayload]) => { if (profile?.profile) setState(s => ({ ...s, ...profile.profile, firstName: profile.profile.first_name || s.firstName, email: profile.email || s.email })); if (dailyPayload?.interaction) setDaily(dailyPayload.interaction.content); }).catch(() => setError(true)); }, []);
  return <MvpShell title="Hoy"><section className="pt-8">{error && <p role="alert" className="mb-6 border-l-2 border-red-700 pl-4 text-[14px] text-red-800">No pudimos cargar tu NIA. Vuelve a intentarlo.</p>}<p className="text-[clamp(23px,4vw,38px)] leading-none [font-family:var(--font-display)]">{greeting}, {state.firstName || 'Laura'}.</p>{daily && <div className="mt-12 border-l-2 border-[var(--accent)] pl-5"><h1 className="max-w-[760px] text-[clamp(35px,6vw,68px)] leading-[.98] tracking-[-.04em] [font-family:var(--font-display)]">{daily}</h1></div>}</section></MvpShell>;
}
