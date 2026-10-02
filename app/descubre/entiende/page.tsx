'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { trackFunnel } from '@/lib/funnel';
export default function UnderstandPage() {
  useEffect(() => { trackFunnel('understand_nia_opened'); }, []);
  return <FunnelFrame step="ENTENDER NIA"><section className="funnel-screen"><div className="funnel-content narrow"><p className="eyebrow">ENTENDER NIA</p><h1>Sabes lo que quieres hacer. Lo difícil es recordarlo justo cuando importa.</h1><p className="funnel-copy">Hay una distancia entre saber lo que quieres y poder actuar de acuerdo con ello cuando llega el momento.</p><p className="funnel-copy strong">NIA parte de ahí.</p><p className="funnel-copy">NIA te ayuda a volver a una dirección que tú misma elegiste, justo cuando la situación aparece.</p><a className="funnel-button" href="/descubre/prueba">Quiero probarlo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
