'use client';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { saveFunnelState, trackFunnel } from '@/lib/funnel';
import { useEffect } from 'react';

export default function ContinuityPage() {
  useEffect(() => { trackFunnel('continuity_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow"><h1>Esto puede seguir contigo.</h1><p className="funnel-copy">Lo que acabas de vivir fue una pequeña muestra.</p><p className="funnel-copy">Con NIA recibes intervenciones breves, relacionadas con situaciones reales, y puedes dejar señales sobre lo que te sirve y lo que no.</p><div className="quiet-lines"><p>Una intervención breve.</p><p>Una respuesta sencilla.</p><p>Una adaptación con el tiempo.</p></div><p className="funnel-copy">No para decidir por ti, sino para ayudarte a volver a tu propia dirección cuando más fácil resulta perderla de vista.</p><a className="funnel-button" href="/descubre/planes" onClick={() => { saveFunnelState({ microdemoComplete: true }); trackFunnel('discover_product_explainer_reached'); }}>Quiero continuar <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
