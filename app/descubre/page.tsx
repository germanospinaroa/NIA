'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { saveFunnelState, trackFunnel, type FunnelState } from '@/lib/funnel';

const recognition = [
  ['¿Te ha pasado que sabes lo que quieres… pero cuando llega el momento terminas cediendo, callándote o buscando otra opinión?', 'Sí. Me pasa'],
  ['¿Que sabes lo que querías decir, pero en la conversación terminas suavizándolo para no incomodar?', 'Sí. También me pasa'],
  ['¿Que estabas segura de una decisión y, después de escuchar a alguien, empiezas a preguntarte si de verdad estabas equivocada?', 'Sí. Me ha pasado'],
] as const;

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="funnel-shell"><header className="funnel-header"><a href="/descubre" className="nia-mark"><span />NIA</a></header>{children}</main>;
}
function Step({ index, onNext }: { index: number; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [title, cta] = recognition[index];
  return <Shell><section className="funnel-screen recognition-screen"><motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="funnel-content recognition-copy"><h1>{title}</h1><button className="funnel-button" onClick={onNext}>{cta}<ArrowRight size={17} /></button></motion.div></section></Shell>;
}
export default function DiscoverPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  useEffect(() => { trackFunnel('discover_started'); trackFunnel('recognition_started'); trackFunnel('recognition_1_viewed'); }, []);
  function next() {
    const event = ('recognition_' + (step + 1) + '_completed') as 'recognition_1_completed' | 'recognition_2_completed' | 'recognition_3_completed';
    trackFunnel(event);
    trackFunnel(`recognition_${step + 1}_continue`);
    if (step === 2) { saveFunnelState({ recognitionComplete: true } satisfies Partial<FunnelState>); trackFunnel('recognition_completed'); router.push('/descubre/entiende'); return; }
    trackFunnel(`recognition_${step + 2}_viewed`);
    setStep(value => value + 1);
  }
  return <Step index={step} onNext={next} />;
}
