'use client';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { trackFunnel } from '@/lib/funnel';
export default function EvidencePage() {
  return <DiscoverStage className="evidence-screen">
    <p className="eyebrow">HAY ALGO IMPORTANTE DETRÁS DE ESTO</p>
    <h1>No estás inventando lo que te pasa.</h1>
    <p className="funnel-copy">La forma en que otras personas entran en nuestras decisiones puede influir en cómo nos sentimos frente a ellas.</p>
    <p className="funnel-copy">Y hay otra cosa importante: saber lo que queremos tampoco garantiza que siempre nos resulte fácil llevarlo a nuestros días.</p>
    <div className="evidence-grid">
      <article className="evidence-block"><h2>Cuando alguien te aconseja sin escucharte</h2><p>Una investigación que reunió cinco estudios con 4.394 mujeres adultas en Estados Unidos encontró que recibir consejos no solicitados, genéricos y prescriptivos podía hacer que las mujeres se sintieran menos respetadas, menos poderosas y menos escuchadas que ante una interacción más receptiva.</p><small>Santoro &amp; Markus, Psychological Science, 2024.</small></article>
      <article className="evidence-block"><h2>Querer algo no siempre basta</h2><p>Un metaanálisis de 138 estudios con 19.951 participantes encontró que las intervenciones que ayudaban a las personas a hacer seguimiento de sus objetivos también aumentaban, en promedio, el logro de esos objetivos.</p><small>Harkin et al., Psychological Bulletin, 2016.</small></article>
    </div>
    <p className="funnel-note">Esto no demuestra que NIA funcione por sí sola. Sí nos da una base seria para construir algo diferente: apoyo que tenga en cuenta a la persona y continuidad alrededor de aquello que quiere trabajar.</p>
    <a className="funnel-button" href="/descubre/presenta" onClick={() => trackFunnel('evidence_viewed')}>Quiero conocer NIA <ArrowRight size={17} /></a>
  </DiscoverStage>;
}
