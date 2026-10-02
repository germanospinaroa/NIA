'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { readFunnelState, trackFunnel, type DiscoverFeedback } from '@/lib/funnel';
const copy: Record<DiscoverFeedback, React.ReactNode> = {
  serves: <><p>Entonces voy a recordar que, cuando estés en una situación así, te sirve más volver a tu propio criterio que recibir otra opinión.</p><p>La próxima vez no tendré que empezar desde cero.</p></>,
  different: <><p>Antes de cambiar de opinión, vuelve a algo muy sencillo:</p><p>¿Qué querías tú antes de escuchar lo que alguien más pensaba?</p><p>Esto también me ayuda a entender qué forma de hablarte te sirve más.</p></>,
  not_me: <><p>Perfecto. Esto también me sirve.</p><p>NIA no tiene que acertar a la primera. Tiene que ir entendiendo qué te ayuda y qué no.</p><p>La próxima vez puedo partir de esta señal.</p></>,
};
export default function AdaptationPage() { const [feedback, setFeedback] = useState<DiscoverFeedback>('serves'); useEffect(() => { const state = readFunnelState(); if (state.discoverFeedback) setFeedback(state.discoverFeedback); trackFunnel('demo_adaptation_viewed', { feedback: state.discoverFeedback || 'serves' }); }, []); return <DiscoverStage><h1>Fíjate en lo que cambió.</h1><div className="adapted-card">{copy[feedback]}</div><a className="funnel-button" href="/descubre/explica">Quiero seguir <ArrowRight size={17} /></a></DiscoverStage>; }
