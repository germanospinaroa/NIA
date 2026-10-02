'use client';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { saveFunnelState, trackFunnel } from '@/lib/funnel';
import { useEffect } from 'react';

export default function ContinuityPage() {
  useEffect(() => { trackFunnel('continuity_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow"><h1>Y esto apenas empieza.</h1><p className="funnel-copy">Hoy viste una pequeña parte.</p><p className="funnel-copy">Con el tiempo, NIA puede ir recordando las señales que tú decides darle:</p><div className="quiet-lines"><p>qué quieres trabajar;</p><p>qué forma de hablarte te sirve;</p><p>qué no te sirve;</p><p>y qué situaciones vuelven a aparecer.</p></div><p className="funnel-copy">No para analizarte. No para decidir por ti. Para que cada vez sea menos necesario empezar desde cero.</p><a className="funnel-button" href="/descubre/planes" onClick={() => { saveFunnelState({ microdemoComplete: true }); trackFunnel('discover_product_explainer_reached'); }}>Quiero tener NIA conmigo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
