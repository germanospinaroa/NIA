'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, trackFunnel } from '@/lib/funnel';

export default function DayIntroPage() {
  const [name, setName] = useState('ahí');
  useEffect(() => { const state = readFunnelState(); if (state.firstName) setName(state.firstName); trackFunnel('discover_reveal_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><h1>Gracias, {name}.</h1><p className="funnel-copy">Lo que viene no es una frase genérica que podría recibir cualquiera.</p><p className="funnel-copy">Vamos a hacer una pequeña prueba para que veas cómo funciona la idea.</p><a className="funnel-button" href="/descubre/prueba">Quiero verlo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
