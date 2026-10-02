'use client';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { trackFunnel } from '@/lib/funnel';
export default function FuturePage() { return <DiscoverStage><h1>Ahora imagina tener esto contigo de verdad.</h1><p className="funnel-copy">Mañana puede aparecer otra de esas situaciones.</p><div className="quiet-lines"><p>Una conversación.</p><p>Una decisión.</p><p>Un límite.</p><p>Ese momento en el que empiezas a dudar.</p></div><p className="funnel-copy">Y en lugar de volver a empezar desde cero, NIA ya sabrá un poco mejor qué te sirve.</p><div className="quiet-lines"><p>Un momento breve.</p><p>Algo pensado para ti.</p><p>Una respuesta que puedes aceptar, cuestionar o cambiar.</p></div><a className="funnel-button" href="/descubre/continuidad" onClick={() => trackFunnel('future_experience_viewed')}>Quiero vivir esta experiencia <ArrowRight size={17} /></a></DiscoverStage>; }
