'use client';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { trackFunnel } from '@/lib/funnel';
export default function LivePage() { return <DiscoverStage><h1>Ahora sí. Te quiero mostrar cómo sería tener NIA contigo.</h1><p className="funnel-copy">No sería abrir una app para leer una frase bonita.</p><p className="funnel-copy">Tampoco sentarte a escribir páginas sobre lo que te pasa.</p><p className="funnel-copy">Sería tener un momento breve contigo justo cuando más fácil sería volver a hacer lo de siempre.</p><div className="quiet-lines"><p>Tú me muestras qué estás viviendo.</p><p>Yo te devuelvo algo pensado para ese momento.</p><p>Tú me dices, con un toque, si te sirve.</p><p>Y esa respuesta cambia lo que viene después.</p></div><a className="funnel-button" href="/descubre/contexto" onClick={() => trackFunnel('demo_viewed')}>Quiero vivirlo <ArrowRight size={17} /></a></DiscoverStage>; }
