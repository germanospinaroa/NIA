'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { readFunnelState, trackFunnel } from '@/lib/funnel';

export default function ThanksPage() {
  const [name, setName] = useState('');
  useEffect(() => { setName(readFunnelState().firstName || ''); trackFunnel('name_completed_viewed'); }, []);
  return <DiscoverStage>
    <h1>Gracias, {name || 'mucho gusto'}.</h1>
    <h2 className="funnel-subheadline">Y quiero reconocer algo.</h2>
    <p className="funnel-copy">Estar aquí, reconocer que hay cosas que quieres cambiar y tomarte en serio tu crecimiento ya es importante.</p>
    <p className="funnel-copy">No porque tengas algo malo que corregir. Sino porque decidiste hacer algo por ti.</p>
    <p className="funnel-copy">NIA nace justamente para ayudarte a llevar ese cambio a tus días de una forma sencilla, personal y constante.</p>
    <p className="funnel-copy strong">Ahora sí quiero enseñarte cómo se vería contigo.</p>
    <a className="funnel-button" href="/descubre/vivir" onClick={() => trackFunnel('thanks_viewed')}>Muéstramelo <ArrowRight size={17} /></a>
  </DiscoverStage>;
}
