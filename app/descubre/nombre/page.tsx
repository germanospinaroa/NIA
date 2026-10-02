'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel } from '@/lib/funnel';

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  useEffect(() => { const state = readFunnelState(); if (state.firstName) setName(state.firstName); }, []);
  function continueNext() {
    const firstName = name.trim();
    if (!firstName) return;
    saveFunnelState({ firstName });
    trackFunnel('discover_name_entered');
    trackFunnel('name_submitted');
    trackFunnel('name_completed');
    router.push('/descubre/agradecimiento');
  }
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><h1>Quiero conocerte un poco antes de seguir.</h1><p className="funnel-copy">Nos tomamos muy en serio este proceso.</p><p className="funnel-copy">Lo que tú quieres trabajar, cómo lo vives y qué forma de apoyo te ayuda no tiene por qué ser igual a lo que necesita otra persona.</p><p className="funnel-copy">Por eso quiero personalizar esta experiencia para ti desde el principio.</p><label className="field-label" htmlFor="discover-name">¿Cómo te llamas?</label><input autoFocus id="discover-name" className="funnel-input" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') continueNext(); }} placeholder="Nombre" autoComplete="given-name" /><button className="funnel-button" disabled={!name.trim()} onClick={continueNext}>Continuar <ArrowRight size={17} /></button></div></section></FunnelFrame>;
}
