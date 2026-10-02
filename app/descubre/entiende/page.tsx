'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { trackFunnel } from '@/lib/funnel';

export default function UnderstandPage() {
  useEffect(() => { trackFunnel('understand_nia_opened'); }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow"><h1>Ahora imagina que pudieras empezar a actuar diferente.</h1><p className="funnel-copy">Imagínate empezar el día teniendo unos minutos para volver a conectar con lo que quieres para ti.</p><div className="quiet-lines"><p>No con una frase bonita.</p><p>No con consejos que sirven para cualquiera.</p><p>Con algo pensado para lo que tú estás viviendo.</p></div><p className="funnel-copy">Cada día NIA puede aparecer con una intervención breve relacionada con lo que estás intentando cambiar o vivir diferente.</p><p className="funnel-copy small-copy">Tú lees. Te detienes un momento. Respondes. Y esa respuesta ayuda a que NIA vaya entendiendo mejor qué te sirve y qué no.</p><a className="funnel-button" href="/descubre/nombre">Quiero ver cómo funciona <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
