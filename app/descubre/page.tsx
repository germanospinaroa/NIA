'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelState } from '@/lib/funnel';

const recognition = [
  ['¿Te ha pasado que estabas segura de una decisión y, después de escuchar a alguien, empezaste a dudar?', 'Sí, me ha pasado →'],
  ['¿Y luego te quedas pensando: «¿Será que de verdad estaba equivocada?»', 'Sí, también →'],
  ['¿Y alguna vez terminas cambiando de idea, cediendo o haciendo algo distinto a lo que tú querías?', 'Sí, me pasa →'],
] as const;
const viewedEvents = ['recognition_1_viewed', 'recognition_2_viewed', 'recognition_3_viewed'] as const;

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
  useEffect(() => {
    const state = readFunnelState();
    if (state.recognitionStep) setStep(Math.min(state.recognitionStep, 3) - 1);
    trackFunnel('discover_started');
    trackFunnel('recognition_started');
    trackFunnel(viewedEvents[(state.recognitionStep || 1) - 1]);
  }, []);
  function next() {
    const event = ('recognition_' + (step + 1) + '_completed') as 'recognition_1_completed' | 'recognition_2_completed' | 'recognition_3_completed';
    trackFunnel(event);
    trackFunnel(`recognition_${step + 1}_continue`);
    if (step === 2) {
      saveFunnelState({ recognitionComplete: true, recognitionStep: 3, recognitionContext: 'decision_doubt' } satisfies Partial<FunnelState>);
      trackFunnel('recognition_completed');
      router.push('/descubre/evidencia');
      return;
    }
    saveFunnelState({ recognitionStep: (step + 2) as 1 | 2 | 3 });
    trackFunnel(`recognition_${step + 2}_viewed`);
    setStep(value => value + 1);
  }
  return <Step index={step} onNext={next} />;
}
