'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { saveFunnelState, trackFunnel, type FunnelState } from '@/lib/funnel';

const recognition = [
  ['Antes de una conversación que llevas días evitando.', '¿Te pasa?', 'Sí, me pasa'],
  ['Cuando buscas otra opinión aunque ya sabes qué piensas.', '¿También te pasa?', 'Sí, me pasa'],
  ['Después de ceder o minimizarte y empezar a castigarte.', '¿Te reconoces aquí?', 'Sí. Quiero entenderlo mejor'],
] as const;

function Shell({ children, progress }: { children: React.ReactNode; progress?: string }) {
  return <main className="funnel-shell"><header className="funnel-header"><a href="/descubre" className="nia-mark"><span />NIA</a>{progress && <span className="funnel-progress">{progress}</span>}</header>{children}</main>;
}
function Step({ index, onNext }: { index: number; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [title, question, cta] = recognition[index];
  return <Shell progress={(index + 1) + ' / 3'}><section className="funnel-screen recognition-screen"><motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="funnel-content"><p className="eyebrow">RECONOCERME</p><h1>{title}</h1><p className="funnel-question">{question}</p><button className="funnel-button" onClick={onNext}>{cta}<ArrowRight size={17} /></button></motion.div></section></Shell>;
}
export default function DiscoverPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  useEffect(() => { trackFunnel('discover_started'); }, []);
  function next() {
    const event = ('recognition_' + (step + 1) + '_completed') as 'recognition_1_completed' | 'recognition_2_completed' | 'recognition_3_completed';
    trackFunnel(event);
    if (step === 2) { saveFunnelState({ recognitionComplete: true } satisfies Partial<FunnelState>); router.push('/descubre/entiende'); return; }
    setStep(value => value + 1);
  }
  return <Step index={step} onNext={next} />;
}
