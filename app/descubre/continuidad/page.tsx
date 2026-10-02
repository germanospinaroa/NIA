'use client';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { saveFunnelState, trackFunnel } from '@/lib/funnel';

export default function ContinuityPage() {
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow"><h1>Y esto es solo el comienzo.</h1><p className="funnel-copy">Al principio NIA necesita conocerte. Por eso vas a responder algunas preguntas cuando entres.</p><p className="funnel-copy">Con el tiempo, tus respuestas, elecciones y feedback ayudan a que las intervenciones sean cada vez más relevantes para ti.</p><div className="quiet-lines"><p>Una intervención breve.</p><p>Un momento para volver a ti.</p><p>Una respuesta.</p></div><p className="funnel-copy">Y una experiencia que va entendiendo mejor qué te ayuda.</p><a className="funnel-button" href="/descubre/planes" onClick={() => { saveFunnelState({ microdemoComplete: true }); trackFunnel('discover_product_explainer_reached'); }}>Ver planes <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
