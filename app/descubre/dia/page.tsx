'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, trackFunnel } from '@/lib/funnel';

export default function DayIntroPage() {
  const [name, setName] = useState('ahí');
  useEffect(() => { const state = readFunnelState(); if (state.firstName) setName(state.firstName); trackFunnel('discover_reveal_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><p className="eyebrow">{name}, AHORA SÍ</p><h1>Quiero enseñarte cómo podría sentirse tener NIA contigo durante un día normal.</h1><p className="funnel-copy">No como una sesión. Como un momento breve que aparece cuando puede ayudarte.</p><a className="funnel-button" href="/descubre/prueba">Muéstramelo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
