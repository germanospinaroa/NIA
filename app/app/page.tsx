'use client';

import { useEffect, useState } from 'react';
import { MvpShell } from '@/components/app/MvpShell';
import { invalidIntention } from '@/lib/intention';
import { hasInterventionValue } from '@/lib/intervention-quality';
import { trackMvp } from '@/lib/mvp';

type Profile = { first_name?: string; direction_key?: string | null; direction_text?: string | null; desired_change_original?: string | null; message_time_1?: string | null };
type Interaction = { content?: string | null };

function usableMessage(content: unknown) {
  if (typeof content !== 'string') return false;
  return hasInterventionValue(content);
}

export default function AppHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connection, setConnection] = useState<{ status: string } | null>(null);
  const [latest, setLatest] = useState<Interaction | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    trackMvp('app_home_viewed');
    Promise.all([
      fetch('/api/profile').then(async response => { if (!response.ok) throw new Error('profile'); return response.json(); }),
      fetch('/api/whatsapp/connection').then(response => response.json()),
      fetch('/api/interactions').then(response => response.ok ? response.json() : null),
    ]).then(([profilePayload, connectionPayload, interactionsPayload]) => {
      setProfile(profilePayload?.profile ?? null);
      setConnection(connectionPayload?.connection ?? { status: connectionPayload?.status ?? 'not_connected' });
      const candidate = interactionsPayload?.interactions?.find((item: Interaction) => usableMessage(item.content));
      setLatest(candidate ?? null);
    }).catch(() => setError(true));
  }, []);

  const firstName = typeof profile?.first_name === 'string' ? profile.first_name : '';
  const rawDirection = typeof profile?.desired_change_original === 'string' ? profile.desired_change_original : typeof profile?.direction_text === 'string' ? profile.direction_text : '';
  const direction = invalidIntention(rawDirection) ? '' : rawDirection;
  const hasIntention = Boolean(direction && profile?.direction_key !== 'intention_unclear');
  const time = typeof profile?.message_time_1 === 'string' ? profile.message_time_1 : '';
  const connected = connection?.status === 'connected';

  return <MvpShell title="Hoy"><section className="pt-8"><p className="text-[13px] font-semibold uppercase tracking-[.14em] text-[var(--accent)]">HOY</p><h1 className="mt-5 max-w-[650px] text-[clamp(39px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">{firstName ? `Hola, ${firstName}.` : 'NIA está lista para empezar contigo.'}</h1>{error && <p role="alert" className="mt-6 border-l-2 border-red-700 pl-4 text-[14px] text-red-800">No pudimos cargar el estado de NIA. Vuelve a intentarlo.</p>}{!hasIntention ? <section className="mt-10 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-6"><h2 className="text-[28px] [font-family:var(--font-display)]">Primero elijamos qué quieres trabajar.</h2><p className="mt-3 max-w-[560px] text-[15px] text-[var(--text-secondary)]">Cuando tengamos esto claro, NIA podrá empezar a preparar mensajes realmente pensados para ti.</p><a href="/app/tu" className="mt-6 inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Elegir ahora</a></section> : <div className="mt-10 grid gap-3 sm:grid-cols-3"><article className="rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]">Estás trabajando en</p><p className="mt-4 text-[21px] leading-[1.08] [font-family:var(--font-display)]">{direction}</p></article><article className="rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]">Próximo mensaje</p><p className="mt-4 text-[21px] leading-[1.08] [font-family:var(--font-display)]">{time || 'Configúralo en Tú.'}</p></article><article className="rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-5"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]">WhatsApp</p><p className="mt-4 text-[21px] leading-[1.08] [font-family:var(--font-display)]">{connected ? 'Conectado' : 'Aún no conectado'}</p></article></div>}{latest?.content && hasIntention && <section className="mt-10 border-l-2 border-[var(--accent)] pl-5"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[var(--text-tertiary)]">Último mensaje disponible</p><p className="mt-4 max-w-[700px] whitespace-pre-line text-[20px] leading-[1.45] [font-family:var(--font-display)]">{latest.content}</p></section>}</section></MvpShell>;
}
