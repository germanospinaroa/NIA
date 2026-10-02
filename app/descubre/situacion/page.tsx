'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { readFunnelState, trackFunnel, type DiscoverContext } from '@/lib/funnel';
const copy: Record<DiscoverContext, { title: string; body: React.ReactNode }> = {
  opinion: { title: 'Perfecto. Ahora sí. Vamos a ponerlo en una situación real.', body: <>Imagina que llevas días pensando en algo que quieres hacer.<br /><br />Se lo cuentas a alguien.<br /><br />Te responde: «¿Seguro? Yo lo pensaría mejor.»<br /><br />Y de repente empiezas a preguntarte si realmente estabas tan segura.</> },
  conversation: { title: 'Perfecto. Ahora sí. Vamos a ponerlo en una situación real.', body: <>Imagina que llevas días pensando en algo que necesitas decir.<br /><br />Llega el momento.<br /><br />Pero cuando ves la reacción de la otra persona, empiezas a suavizar lo que querías decir para no incomodar.</> },
  limit: { title: 'Perfecto. Ahora sí. Vamos a ponerlo en una situación real.', body: <>Imagina que alguien te pide algo que realmente no quieres hacer.<br /><br />Tú sabes que quieres decir que no.<br /><br />Pero llega ese momento incómodo y empiezas a buscar cómo explicarte para que la otra persona no se moleste.</> },
};
export default function SituationPage() { const [name, setName] = useState(''); const [context, setContext] = useState<DiscoverContext>('opinion'); useEffect(() => { const state = readFunnelState(); if (state.firstName) setName(state.firstName); if (state.discoverContext) setContext(state.discoverContext); trackFunnel('situation_viewed'); }, []); const current = copy[context]; return <DiscoverStage><h1>{name ? `Perfecto, ${name}. Ahora sí. Vamos a ponerlo en una situación real.` : current.title}</h1><div className="onboarding-situation"><p>{current.body}</p></div><a className="funnel-button" href="/descubre/respuesta" onClick={() => trackFunnel('situation_continue')}>Muéstrame qué harías tú <ArrowRight size={17} /></a></DiscoverStage>; }
