'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { captureMarketingAttribution } from '@/lib/marketing-attribution';
import { addressName } from '@/lib/funnel-personalization';
import { readFunnelV3State, saveFunnelV3State, trackFunnelV3, v3Label, type FunnelV3State, type V3Context, type V3Desire, type V3Pattern, type V3Recognition } from '@/lib/funnel-v3';

type Choice<T extends string> = { value: T; label: string };

const recognitionChoices: Choice<V3Recognition>[] = [
  { value: 'said_yes', label: 'Dije que sí cuando quería decir que no.' },
  { value: 'asked_others', label: 'Pedí opiniones y terminé más confundida.' },
  { value: 'knew_but_froze', label: 'Sabía qué quería, pero no me atreví.' },
];
const patternChoices: Choice<V3Pattern>[] = [
  { value: 'approval', label: 'Necesitar que alguien más lo confirme.' },
  { value: 'doubt', label: 'Pensar que quizá me estoy equivocando.' },
  { value: 'discomfort', label: 'Querer evitar la incomodidad del momento.' },
];
const desireChoices: Choice<V3Desire>[] = [
  { value: 'say_no', label: 'Decir que no sin justificarme tanto.' },
  { value: 'decide_first', label: 'Decidir sin consultar a tantas personas.' },
  { value: 'trust_first', label: 'Confiar más en mi primera decisión.' },
];
const contextChoices: Choice<V3Context>[] = [
  { value: 'request', label: 'Cuando alguien me pide algo.' },
  { value: 'conversation', label: 'Antes de una conversación importante.' },
  { value: 'decision', label: 'Cuando tengo que elegir y me bloqueo.' },
];

const patternCopy: Record<V3Recognition, string> = {
  said_yes: 'Lo difícil no siempre es saber qué quieres. A veces es sostenerlo cuando decir que no puede incomodar a alguien.',
  asked_others: 'Buscar una opinión puede ayudarte. Pero cuando cada respuesta abre una duda nueva, tu decisión queda cada vez más lejos.',
  knew_but_froze: 'A veces ya sabes qué quieres. Lo difícil es actuar cuando aparece el miedo a equivocarte o a decepcionar.',
};

const desireCopy: Record<V3Pattern, string> = {
  approval: 'No necesitas dejar de escuchar a otras personas. Tal vez quieres poder escucharlas sin entregarles tu decisión.',
  doubt: 'La duda puede aparecer sin tener información nueva. Tal vez quieres reconocerla antes de volver a empezar desde cero.',
  discomfort: 'La incomodidad no siempre significa que estás haciendo algo mal. Tal vez quieres atravesarla sin traicionarte.',
};

function Header({ progress }: { progress: number }) {
  return <header className="v3-header"><Link href="/" className="v3-mark" aria-label="Volver a NIA"><span />NIA</Link><div className="v3-progress" role="progressbar" aria-valuemin={1} aria-valuemax={7} aria-valuenow={progress} aria-label={`Paso ${progress} de 7`}><span style={{ width: `${(progress / 7) * 100}%` }} /></div><span className="v3-progress-label">{progress}/7</span></header>;
}

function Choices<T extends string>({ choices, value, onChange }: { choices: Choice<T>[]; value?: T; onChange: (value: T) => void }) {
  return <div className="v3-choices" role="radiogroup">{choices.map(choice => <button key={choice.value} type="button" role="radio" aria-checked={value === choice.value} className={`v3-choice${value === choice.value ? ' is-selected' : ''}`} onClick={() => onChange(choice.value)}><span>{choice.label}</span>{value === choice.value ? <Check size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}</button>)}</div>;
}

function WhatsappDemo({ state }: { state: FunnelV3State }) {
  const name = addressName(state.preferredName);
  const opening = name ? `Hola, ${name}.` : 'Hola.';
  const situation = state.context === 'request' ? 'alguien te pida algo que no quieres hacer' : state.context === 'conversation' ? 'tengas esa conversación que llevas posponiendo' : 'tengas que elegir y vuelvas a dudar';
  const answer = state.desire === 'say_no' ? '¿Qué quieres responder, antes de pensar en cómo hacerlo más cómodo para la otra persona?' : state.desire === 'decide_first' ? '¿Qué decidiste tú antes de empezar a pedir opiniones?' : '¿Qué razón te hizo elegirlo antes de que apareciera esta duda?';
  return <div className="v3-whatsapp" aria-label="Ejemplo ilustrativo de un mensaje de NIA por WhatsApp"><div className="v3-whatsapp-top"><span className="v3-avatar">N</span><span><strong>NIA</strong><small>acompañamiento de hoy</small></span><span className="v3-online" /></div><div className="v3-whatsapp-body"><p>{opening}</p><p>Mañana puede que {situation}.</p><p>Antes de reaccionar, mira una cosa:</p><p className="v3-message-emphasis">{answer}</p><p>No tienes que decidir de nuevo solo porque apareció la duda. Puedes volver a lo que tú ya habías visto.</p><small>Mensaje de ejemplo · no es una conversación en tiempo real</small></div></div>;
}

export default function PremiumDiscoverV3() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FunnelV3State>({});
  const [name, setName] = useState('');
  useEffect(() => { captureMarketingAttribution(); const saved = readFunnelV3State(); setState(saved); setName(saved.preferredName ?? ''); trackFunnelV3('funnel_started', { screen: 1, screen_key: 'recognition' }); trackFunnelV3('recognition_viewed', { screen: 1, screen_key: 'recognition' }); }, []);
  const current = useMemo(() => ({ ...state, preferredName: addressName(name) }), [name, state]);
  const canContinue = step === 1 ? Boolean(state.recognition) : step === 2 ? Boolean(state.pattern) : step === 3 ? Boolean(state.desire) : step === 4 ? Boolean(state.context) : true;
  const screenKey = ['recognition', 'pattern', 'desire', 'personalize', 'demo', 'trust'][step - 1] ?? 'trust';
  function choose<T extends keyof FunnelV3State>(key: T, value: FunnelV3State[T]) { const next = { ...state, [key]: value }; setState(next); saveFunnelV3State({ [key]: value }); }
  function next() { if (!canContinue) return; const nextStep = step + 1; const nextKey = ['recognition', 'pattern', 'desire', 'personalize', 'demo', 'trust'][nextStep - 1] ?? 'trust'; trackFunnelV3(`${screenKey}_completed`, { screen: step, screen_key: screenKey }); if (nextStep <= 6) trackFunnelV3(`${nextKey}_viewed`, { screen: nextStep, screen_key: nextKey }); setStep(nextStep); }
  function finishPersonalize() { const normalized = addressName(name); setName(normalized); saveFunnelV3State({ preferredName: normalized, context: state.context }); trackFunnelV3('personalize_completed', { screen: 4, screen_key: 'personalize', has_name: Boolean(normalized) }); next(); }
  const titles = { recognition: '¿Cuántas veces has terminado haciendo algo que no querías?', pattern: 'Lo difícil no siempre es saber qué quieres.', desire: '¿Qué te gustaría poder hacer distinto?', personalize: 'Hagámoslo concreto.', demo: 'Imagina que mañana vuelve uno de esos momentos.', trust: 'Una forma distinta de acompañarte.' } as const;
  const title = titles[screenKey as keyof typeof titles];
  return <main className={`v3-funnel ${step === 5 ? 'is-dark' : ''}`} data-screen-key={screenKey}><Header progress={step} /><motion.section key={step} className={`v3-screen is-${screenKey}`} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? .18 : .3, ease: [0.16, 1, .3, 1] }} aria-labelledby="v3-title"><div className="v3-content"><p className="v3-kicker">{step === 1 ? 'ESTA VEZ, TÚ.' : 'NIA · ACOMPAÑAMIENTO DIARIO'}</p><h1 id="v3-title">{title}</h1>{step === 1 && <><p className="v3-intro">No hablamos de grandes decisiones. Hablamos de esos momentos pequeños que después se quedan dando vueltas en tu cabeza.</p><Choices choices={recognitionChoices} value={state.recognition} onChange={value => choose('recognition', value)} /></>}{step === 2 && <><p className="v3-intro">{state.recognition ? <>Cuando aparece <strong>{v3Label(state.recognition)}</strong>, suele pasar algo parecido.</> : ''} {state.recognition ? patternCopy[state.recognition] : ''}</p><Choices choices={patternChoices} value={state.pattern} onChange={value => choose('pattern', value)} /></>}{step === 3 && <><p className="v3-intro">{state.pattern ? desireCopy[state.pattern] : ''}</p><Choices choices={desireChoices} value={state.desire} onChange={value => choose('desire', value)} /></>}{step === 4 && <><p className="v3-intro">La situación cambia. La pregunta es la misma: ¿en qué momento te serviría más volver a tu propio criterio?</p><Choices choices={contextChoices} value={state.context} onChange={value => choose('context', value)} /><label className="v3-name-field" htmlFor="v3-name">¿Cómo te gusta que te llamen? <span>Opcional</span><input id="v3-name" value={name} onChange={event => setName(event.target.value)} maxLength={80} autoComplete="given-name" placeholder="Tu nombre…" /></label></>}{step === 5 && <><p className="v3-intro">No te voy a explicar NIA. Mira cómo podría acompañarte en esa situación, sin decidir por ti.</p><WhatsappDemo state={current} /></>}{step === 6 && <><p className="v3-intro">NIA llega de forma proactiva por WhatsApp, en el momento que tú eliges. Te ayuda a mirar lo que quieres, qué te está haciendo dudar y cuál podría ser tu siguiente acción.</p><div className="v3-trust-grid"><div><span className="v3-icon-chip"><Check size={18} /></span><strong>Qué sí hace</strong><p>Te acompaña con mensajes breves y conectados con lo que estás trabajando.</p></div><div><span className="v3-icon-chip"><Check size={18} /></span><strong>Qué no hace</strong><p>No decide por ti, no es terapia y no es un chat ilimitado.</p></div><div><span className="v3-icon-chip"><Check size={18} /></span><strong>Qué controlas</strong><p>El momento, tu suscripción y la posibilidad de cancelar antes del siguiente cobro.</p></div></div></>}</div></motion.section><div className="v3-action">{step === 6 ? <Link className="v3-cta" href="/descubre/v3/planes" onClick={() => { trackFunnelV3('trust_completed', { screen: 6, screen_key: 'trust' }); }}>Ver cómo empezar <ArrowRight size={18} aria-hidden="true" /></Link> : <button className="v3-cta" type="button" disabled={!canContinue} onClick={step === 4 ? finishPersonalize : next}>{step === 5 ? 'Quiero conocer los planes' : 'Continuar'} <ArrowRight size={18} aria-hidden="true" /></button>}</div></main>;
}
