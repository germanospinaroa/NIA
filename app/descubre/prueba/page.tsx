'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type DemoChoice } from '@/lib/funnel';

const adaptedCopy: Record<DemoChoice, string> = {
  new_information: 'Si descubriste algo nuevo, puedes tomarlo en cuenta sin borrar la razón por la que decidiste antes. ¿Sigue teniendo sentido para ti?',
  doubt: 'Entonces quizá no necesitas tomar una nueva decisión todavía. Primero vuelve a la razón por la que habías elegido eso. ¿Sigue teniendo sentido para ti?',
  unsure: 'No tienes que resolverlo en este segundo. Separa la duda de la información nueva y mira qué sigue siendo cierto para ti.',
};
const choices: [DemoChoice, string][] = [
  ['new_information', 'Descubrí algo nuevo'],
  ['doubt', 'Me hizo dudar de mí'],
  ['unsure', 'No estoy segura'],
];

export default function TryPage() {
  const router = useRouter();
  const [name, setName] = useState('ahí');
  const [stage, setStage] = useState<'morning' | 'question' | 'adapted'>('morning');
  const [choice, setChoice] = useState<DemoChoice | null>(null);
  useEffect(() => {
    const state = readFunnelState();
    if (state.firstName) setName(state.firstName);
    if (state.demoChoice) { setChoice(state.demoChoice); setStage('adapted'); }
    trackFunnel('microdemo_started');
  }, []);
  function answer(value: DemoChoice) {
    setChoice(value);
    saveFunnelState({ demoChoice: value, microdemoComplete: false });
    trackFunnel('microdemo_feedback', { choice: value });
    trackFunnel('microdemo_adapted');
    setStage('adapted');
  }
  return <FunnelFrame><section className="funnel-screen story-screen"><div className="funnel-content narrow">{stage === 'morning' && <><p className="eyebrow">MAÑANA</p><h1>Imagina que mañana te levantas y tienes esto esperándote.</h1><div className="story-card"><p className="card-label">BUENOS DÍAS, {name}.</p><p>Alguien cuestiona una decisión que ya habías tomado.</p><p className="story-muted">Y empiezas a pensar: «¿Será que estoy exagerando?»</p></div><button className="funnel-button" onClick={() => setStage('question')}>Ver qué haría NIA <ArrowRight size={17} /></button></>}{stage === 'question' && <><p className="eyebrow">UN MOMENTO PARA VOLVER</p><h1>Antes de cambiar de opinión, prueba algo.</h1><div className="question-card"><p>¿Cambiaste de opinión porque descubriste algo nuevo o porque empezaste a dudar de ti después de escuchar a alguien más?</p></div><div className="option-list">{choices.map(([value, label]) => <button key={value} className="option-button" onClick={() => answer(value)}>{label}<ArrowRight size={16} /></button>)}</div></>}{stage === 'adapted' && choice && <><p className="eyebrow">NIA RESPONDE</p><h1>Esto cambiaría según lo que acabas de decir.</h1><div className="adapted-card"><Check size={17} /><p>{adaptedCopy[choice]}</p></div><p className="funnel-note">No es una frase fija. Tu respuesta ayuda a orientar lo que ocurre después.</p><button className="funnel-button" onClick={() => { saveFunnelState({ microdemoComplete: true }); trackFunnel('microdemo_completed'); router.push('/descubre/continuidad'); }}>Seguir <ArrowRight size={17} /></button></>}</div></section></FunnelFrame>;
}
