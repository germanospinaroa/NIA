'use client';

import { useEffect, useState } from 'react';
import { MvpShell } from '@/components/app/MvpShell';
import { invalidIntention } from '@/lib/intention';
import { hasInterventionValue } from '@/lib/intervention-quality';
import { trackMvp } from '@/lib/mvp';
import { formatNextMessageSlot, getNextMessageSlot } from '@/lib/next-message';

type Profile = { first_name?: string; direction_key?: string | null; direction_text?: string | null; desired_change_original?: string | null; message_frequency?: number | null; message_time_1?: string | null; message_time_2?: string | null; timezone?: string | null };
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
  const hasIntention = Boolean(rawDirection && !invalidIntention(rawDirection) && profile?.direction_key !== 'intention_unclear');
  const nextMessage = profile ? formatNextMessageSlot(getNextMessageSlot({ message_frequency: profile.message_frequency, message_time_1: profile.message_time_1, message_time_2: profile.message_time_2, timezone: profile.timezone })) : null;
  const connected = connection?.status === 'connected';

  return <MvpShell title="Hoy"><section className="pt-8"><h1 className="max-w-[650px] text-[clamp(39px,7vw,76px)] leading-[.94] tracking-[-.06em] [font-family:var(--font-display)]">{firstName ? `Hola, ${firstName}.` : 'NIA está lista para empezar contigo.'}</h1>{error && <p role="alert" className="mt-6 border-l-2 border-red-700 pl-4 text-[14px] text-red-800">No pudimos cargar el estado de NIA. Vuelve a intentarlo.</p>}{!hasIntention ? <section className="mt-10 rounded-[var(--radius-card)] border border-black/10 bg-[var(--surface)] p-6"><h2 className="text-[28px] [font-family:var(--font-display)]">Primero elijamos qué quieres trabajar.</h2><p className="mt-3 max-w-[560px] text-[15px] text-[var(--text-secondary)]">Cuando tengamos esto claro, NIA podrá empezar a preparar mensajes realmente pensados para ti.</p><a href="/app/tu" className="mt-6 inline-flex min-h-12 items-center rounded-[var(--radius-button)] bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--bg)]">Elegir ahora</a></section> : <><section className="mt-12 border-l-2 border-[var(--accent)] pl-5 sm:pl-7"><p className="max-w-[700px] whitespace-pre-line text-[20px] leading-[1.45] [font-family:var(--font-display)]">{latest?.content || 'Tu próximo mensaje aparecerá aquí.'}</p></section><div className="mt-8 flex flex-col gap-2 border-t border-black/10 pt-4 text-[12px] text-[var(--text-tertiary)] sm:flex-row sm:items-center sm:gap-5"><span>Siguiente mensaje · {nextMessage || 'Configúralo en Tú.'}</span><span>WhatsApp · {connected ? 'Conectado' : 'No conectado'}</span></div></>}</section></MvpShell>;
}
