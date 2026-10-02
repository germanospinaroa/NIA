'use client';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { trackFunnel } from '@/lib/funnel';

export default function WorksPage() {
  return <DiscoverStage>
    <h1>Así funciona NIA.</h1>
    <p className="funnel-copy">Primero eliges qué quieres trabajar.</p>
    <p className="funnel-copy">Después nos cuentas qué te cuesta cuando intentas vivirlo como quieres.</p>
    <p className="funnel-copy">Con eso, NIA prepara un acompañamiento pensado para ti.</p>
    <p className="funnel-copy">Durante tus días, NIA te escribe por WhatsApp con mensajes breves relacionados con aquello que estás trabajando.</p>
    <p className="funnel-copy">Tú interactúas con ellos y tus respuestas ayudan a que NIA vaya ajustando la forma en que te acompaña.</p>
    <p className="funnel-copy strong">No se trata de recibir una frase bonita cada mañana.</p>
    <p className="funnel-copy strong">Se trata de que aquello que quieres cambiar empiece a tener un lugar real en tus días.</p>
    <a className="funnel-button" href="/descubre/futuro" onClick={() => trackFunnel('how_it_works_viewed')}>Quiero tener esto conmigo <ArrowRight size={17} /></a>
  </DiscoverStage>;
}
