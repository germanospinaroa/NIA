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
    router.push('/descubre/dia');
  }
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><p className="eyebrow">Y HAY ALGO IMPORTANTE</p><h1>NIA no debería hablarte como le habla a todo el mundo.</h1><p className="funnel-copy">Si vamos a acompañarte, queremos hacerlo contigo.</p><p className="funnel-copy">Por eso queremos empezar por conocerte.</p><label className="field-label" htmlFor="discover-name">¿Cómo te llamas?</label><input autoFocus id="discover-name" className="funnel-input" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') continueNext(); }} placeholder="Tu nombre" autoComplete="given-name" /><button className="funnel-button" disabled={!name.trim()} onClick={continueNext}>Continuar <ArrowRight size={17} /></button></div></section></FunnelFrame>;
}
