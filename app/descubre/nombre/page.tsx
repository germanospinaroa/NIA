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
    router.push('/descubre/razon');
  }
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><h1>Antes de seguir, quiero hacerlo contigo.</h1><p className="funnel-copy">No quiero enseñarte una experiencia para «cualquiera».</p><p className="funnel-copy">Quiero poder hablarte a ti.</p><label className="field-label" htmlFor="discover-name">¿Cómo te llamas?</label><input autoFocus id="discover-name" className="funnel-input" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') continueNext(); }} placeholder="Tu nombre" autoComplete="given-name" /><button className="funnel-button" disabled={!name.trim()} onClick={continueNext}>Seguimos <ArrowRight size={17} /></button></div></section></FunnelFrame>;
}
