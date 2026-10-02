'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, trackFunnel, type DiscoverDemoChoice } from '@/lib/funnel';

const meaning: Record<DiscoverDemoChoice, string> = {
  doubt: 'Acabas de mostrarme que el momento difícil puede ser cuando alguien cuestiona algo y empiezas a dudar de ti.',
  influenced: 'Acabas de mostrarme que una opinión puede terminar ocupando el lugar de lo que tú habías decidido.',
  firm_but_hard: 'Acabas de mostrarme que puedes seguir con tu idea, aunque sostenerla se vuelva difícil.',
};

export default function ExplainPage() {
  const [name, setName] = useState('');
  const [choice, setChoice] = useState<DiscoverDemoChoice>('doubt');
  useEffect(() => {
    const state = readFunnelState();
    if (state.firstName) setName(state.firstName);
    if (state.discoverDemoChoice) setChoice(state.discoverDemoChoice);
    trackFunnel('demo_explanation_viewed');
  }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow"><h1>{name ? `${name}, esto es importante.` : 'Esto es importante.'}</h1><p className="funnel-copy">Eso es NIA.</p><p className="funnel-copy">No te dijo qué hacer. No decidió por ti. Tomó lo que acababas de decir y te ayudó a mirar la situación desde otro lugar.</p><p className="funnel-copy">{meaning[choice]}</p><div className="quiet-lines"><p>No fue una frase fija.</p><p>Tu respuesta cambió lo que vino después.</p></div><p className="funnel-copy">Y si mañana ocurre algo parecido, NIA no tendría que empezar desde cero. Puede partir de lo que ya le has mostrado.</p><a className="funnel-button" href="/descubre/continuidad">Quiero seguir <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
