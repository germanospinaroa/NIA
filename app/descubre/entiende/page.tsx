'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { trackFunnel } from '@/lib/funnel';

export default function UnderstandPage() {
  useEffect(() => { trackFunnel('understand_nia_opened'); trackFunnel('understand_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow discover-understand"><h1>A veces no necesitas otra opinión.</h1><p className="funnel-copy">Muchas veces ya sabes bastante bien qué quieres. Lo difícil aparece cuando llega el momento real.</p><div className="quiet-lines"><p>Una opinión.</p><p>Una reacción.</p><p>Un comentario.</p><p>Una duda.</p></div><p className="funnel-copy">Algo empieza a mover tu propia dirección y terminas poniendo en segundo plano lo que tú habías decidido.</p><p className="funnel-copy">NIA existe para ayudarte a volver a tu propio criterio cuando algo empieza a moverlo.</p><a className="funnel-button" href="/descubre/base">Quiero entender por qué <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
