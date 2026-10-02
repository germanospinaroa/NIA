'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { readFunnelState, trackFunnel, type DiscoverContext } from '@/lib/funnel';
const response: Record<DiscoverContext, string> = { opinion: 'Que alguien cuestione tu decisión no significa que tengas que volver a tomarla.', conversation: 'Antes de explicar otra vez tu decisión, pregúntate si realmente necesitas explicarla.', limit: 'Puedes escuchar una opinión sin convertirla automáticamente en tu criterio.' };
const situation: Record<DiscoverContext, string> = { opinion: 'Alguien cuestiona algo que tú ya habías decidido.', conversation: 'Estás a punto de decir algo que sabes que necesitas decir.', limit: 'Alguien te pide algo que realmente no quieres hacer.' };
export default function ResponsePage() { const [context, setContext] = useState<DiscoverContext>('opinion'); useEffect(() => { const state = readFunnelState(); if (state.discoverContext) setContext(state.discoverContext); trackFunnel('demo_intervention_viewed'); }, []); return <DiscoverStage><h1>Mira qué pasa en ese momento.</h1><div className="story-card"><p className="card-label">LO QUE ESTÁ PASANDO</p><p>{situation[context]}</p></div><div className="nia-response-card"><p className="card-label">NIA</p><p>{response[context]}</p></div><a className="funnel-button" href="/descubre/feedback" onClick={() => trackFunnel('demo_response_shown')}>¿Esto te habría ayudado? <ArrowRight size={17} /></a></DiscoverStage>; }
