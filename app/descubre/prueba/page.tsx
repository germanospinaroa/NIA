'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type DiscoverDemoChoice } from '@/lib/funnel';

const choices: [DiscoverDemoChoice, string][] = [
  ['doubt', 'Empiezo a dudar de mí.'],
  ['influenced', 'Me dejo llevar por lo que me dicen.'],
  ['firm_but_hard', 'Sigo con mi idea, pero me cuesta.'],
];

const responses: Record<DiscoverDemoChoice, { bridge: string; intervention: string }> = {
  doubt: { bridge: 'Entiendo. Entonces el momento difícil no parece ser saber qué quieres. Es cuando aparece la duda.', intervention: 'Si mañana vuelve a pasar, prueba esto: antes de cambiar de opinión, pregúntate: «¿Qué quería yo antes de escuchar esta opinión?»' },
  influenced: { bridge: 'Entiendo. Entonces lo que te dicen puede terminar ocupando el lugar de lo que tú habías decidido.', intervention: 'Si mañana vuelve a pasar, escucha lo que apareció sin dejar que sustituya automáticamente tu propia decisión. Vuelve un momento a lo que tú querías.' },
  firm_but_hard: { bridge: 'Entiendo. Entonces puedes sostener tu idea, aunque te cueste hacerlo cuando alguien la cuestiona.', intervention: 'Si mañana vuelve a pasar, vuelve a la razón por la que elegiste eso y comprueba si todavía tiene sentido para ti.' },
};

export default function TryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [stage, setStage] = useState<'situation' | 'choice' | 'adapted'>('situation');
  const [choice, setChoice] = useState<DiscoverDemoChoice | null>(null);
  useEffect(() => {
    const state = readFunnelState();
    if (state.firstName) setName(state.firstName);
    if (state.discoverDemoChoice) { setChoice(state.discoverDemoChoice); setStage('adapted'); }
    trackFunnel('microdemo_started');
    trackFunnel('demo_started');
  }, []);
  function answer(value: DiscoverDemoChoice) {
    setChoice(value);
    saveFunnelState({ discoverDemoChoice: value, microdemoComplete: false });
    trackFunnel('microdemo_feedback', { choice: value });
    trackFunnel('demo_response_selected', { choice: value });
    trackFunnel('microdemo_adapted', { choice: value });
    trackFunnel('demo_intervention_viewed', { choice: value });
    setStage('adapted');
  }
  function finish() {
    saveFunnelState({ microdemoComplete: true });
    trackFunnel('microdemo_completed');
    trackFunnel('demo_value_acknowledged');
    router.push('/descubre/explica');
  }
  return <FunnelFrame><section className="funnel-screen story-screen"><div className="funnel-content narrow discover-demo">
    {stage === 'situation' && <><h1>Imagina que llevas varios días pensando en hacer algo por ti.</h1><p className="funnel-copy">No es una locura. Es algo que sabes que quieres.</p><div className="story-card"><p>Se lo cuentas a alguien.</p><p className="story-quote">«¿Seguro que es buena idea? Yo lo pensaría mejor.»</p><p className="story-muted">Y lo que hace cinco minutos tenías claro empieza a sentirse menos claro.</p></div><button className="funnel-button" onClick={() => { trackFunnel('demo_situation_viewed'); setStage('choice'); }}>Sí, me ha pasado <ArrowRight size={17} /></button></>}
    {stage === 'choice' && <><h1>{name ? `${name}, ¿qué suele pasar contigo?` : '¿Qué suele pasar contigo?'}</h1><p className="funnel-copy">No hay una respuesta correcta. Elige la que más se parezca a ti.</p><div className="option-list">{choices.map(([value, label]) => <button key={value} className="option-button" onClick={() => answer(value)}>{label}<ArrowRight size={16} /></button>)}</div></>}
    {stage === 'adapted' && choice && <><h1>Fíjate en lo que acaba de pasar.</h1><div className="adapted-card"><p>{responses[choice].bridge}</p><p>{responses[choice].intervention}</p></div><p className="funnel-note">La intervención cambió porque tú me mostraste qué ocurre contigo en ese momento.</p><button className="funnel-button" onClick={finish}>Esto sí me serviría <ArrowRight size={17} /></button></>}
  </div></section></FunnelFrame>;
}
