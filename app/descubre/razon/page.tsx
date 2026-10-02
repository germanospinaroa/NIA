'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { readFunnelState, trackFunnel } from '@/lib/funnel';
export default function ReasonPage() { const [name, setName] = useState(''); useEffect(() => { const state = readFunnelState(); if (state.firstName) setName(state.firstName); trackFunnel('personalization_started'); }, []); return <DiscoverStage><h1>Hola, {name || 'mucho gusto'}.</h1><p className="funnel-copy">Mira, hay algo importante en todo lo que acabas de reconocer.</p><p className="funnel-copy">Muchas veces sí sabemos qué queremos.</p><p className="funnel-copy">Lo difícil puede aparecer cuando llega la situación real.</p><a className="funnel-button" href="/descubre/evidencia">Quiero entender qué pasa <ArrowRight size={17} /></a></DiscoverStage>; }
