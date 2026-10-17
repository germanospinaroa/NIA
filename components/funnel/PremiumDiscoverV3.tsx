'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { captureMarketingAttribution } from '@/lib/marketing-attribution';
import { addressName } from '@/lib/funnel-personalization';
import { readFunnelV3State, saveFunnelV3State, trackFunnelV3, type FunnelV3State, type V3Context } from '@/lib/funnel-v3';

type Choice<T extends string> = { value: T; label: string };

const contextChoices: Choice<V3Context>[] = [
  { value: 'request', label: 'Cuando quiero decir que no y termino cediendo.' },
  { value: 'conversation', label: 'Antes de una conversación que me incomoda.' },
  { value: 'decision', label: 'Cuando ya había decidido y empiezo a dudar.' },
];

function Header({ step }: { step: number }) {
  return <header className={`v3-header${step === 1 ? ' is-opening' : ''}`}><Link href="/" className="v3-mark" aria-label="Volver a NIA"><span />NIA</Link>{step > 1 ? <><div className="v3-progress" role="progressbar" aria-valuemin={1} aria-valuemax={7} aria-valuenow={step} aria-label={`Progreso ${step} de 7`}><span style={{ width: `${(step / 7) * 100}%` }} /></div><span className="v3-progress-label" aria-hidden="true">{step}/7</span></> : null}</header>;
}

function Choices({ value, onChange }: { value?: V3Context; onChange: (value: V3Context) => void }) {
  return <div className="v3-choices" role="radiogroup" aria-label="Situación cotidiana">{contextChoices.map(choice => <button key={choice.value} type="button" role="radio" aria-checked={value === choice.value} className={`v3-choice${value === choice.value ? ' is-selected' : ''}`} onClick={() => onChange(choice.value)}><span>{choice.label}</span>{value === choice.value ? <Check size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}</button>)}</div>;
}

function WhatsappDemo({ state }: { state: FunnelV3State }) {
  const name = addressName(state.preferredName);
  const greeting = name ? `Buenos días, ${name}.` : 'Buenos días.';
  const copy = state.context === 'request'
    ? ['Si hoy alguien te pide algo que realmente no quieres hacer, fíjate en qué aparece antes de responder.', '¿Cambiaste de opinión… o apareció la culpa de decir que no?', 'Sentirte incómoda no significa que tu respuesta esté mal.', 'Puedes sentir esa incomodidad y aun así responder desde lo que realmente quieres.']
    : state.context === 'conversation'
      ? ['Si hoy llega esa conversación que has estado evitando, observa algo antes de cambiar lo que querías decir.', '¿Encontraste una mejor forma de expresarlo… o estás intentando evitar la reacción de la otra persona?', 'Cuidar la forma está bien.', 'Borrar lo que realmente quieres decir para evitar incomodidad es otra cosa.']
      : ['Si hoy vuelves a cuestionar una decisión que ya habías tomado, pregúntate:', '¿Apareció información nueva… o solo apareció el miedo a equivocarte?', 'Si nada cambió, quizá no necesitas decidir otra vez.', 'Tal vez necesitas atravesar la incomodidad sin abandonar lo que ya habías pensado.'];
  return <div className="v3-whatsapp" aria-label="Ejemplo ilustrativo de un mensaje proactivo de NIA por WhatsApp"><div className="v3-whatsapp-top"><span className="v3-avatar">N</span><span><strong>NIA</strong><small>acompañamiento de hoy</small></span><span className="v3-online" /></div><div className="v3-whatsapp-body"><p>{greeting}</p>{copy.map((line, index) => <p key={line} className={index === 1 ? 'v3-message-emphasis' : ''}>{line}</p>)}<small>Mensaje de ejemplo · el acompañamiento real llega de forma proactiva</small></div></div>;
}

export default function PremiumDiscoverV3() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FunnelV3State>({});
  const [name, setName] = useState('');

  useEffect(() => {
    captureMarketingAttribution();
    const saved = readFunnelV3State();
    setState(saved); setName(saved.preferredName ?? '');
    trackFunnelV3('funnel_started', { screen: 1, screen_key: 'recognition' });
    trackFunnelV3('recognition_viewed', { screen: 1, screen_key: 'recognition' });
  }, []);

  const current = useMemo(() => ({ ...state, preferredName: addressName(name) }), [name, state]);
  const screenKey = ['recognition', 'pattern', 'desire', 'personalize', 'demo', 'trust'][step - 1] ?? 'trust';
  const canContinue = step < 4 || Boolean(state.context);

  function next() {
    if (!canContinue) return;
    const nextStep = step + 1;
    const nextKey = ['recognition', 'pattern', 'desire', 'personalize', 'demo', 'trust'][nextStep - 1] ?? 'trust';
    trackFunnelV3(`${screenKey}_completed`, { screen: step, screen_key: screenKey });
    if (nextStep <= 6) trackFunnelV3(`${nextKey}_viewed`, { screen: nextStep, screen_key: nextKey });
    setStep(nextStep);
  }

  function chooseContext(value: V3Context) {
    const nextState = { ...state, context: value };
    setState(nextState); saveFunnelV3State({ context: value });
  }

  function finishPersonalize() {
    if (!state.context) return;
    const normalized = addressName(name);
    setName(normalized); saveFunnelV3State({ preferredName: normalized, context: state.context });
    trackFunnelV3('personalize_completed', { screen: 4, screen_key: 'personalize', has_name: Boolean(normalized) });
    trackFunnelV3('demo_viewed', { screen: 5, screen_key: 'demo' });
    setStep(5);
  }

  return <main className={`v3-funnel${step === 5 ? ' is-dark' : ''}`} data-screen-key={screenKey}><Header step={step} /><motion.section key={step} className={`v3-screen is-${screenKey}`} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? .18 : .3, ease: [0.16, 1, .3, 1] }} aria-labelledby="v3-title"><div className="v3-content">
        {step === 1 && <><h1 id="v3-title">No sobrepiensas para decidir mejor.</h1><p className="v3-reveal">Sobrepiensas para evitar lo que no quieres sentir.</p><div className="v3-situations"><p>Culpa por decir que no.</p><p>Miedo a equivocarte.</p><p>Incomodidad por decepcionar a alguien.</p><p>Tensión por tener esa conversación.</p></div><p className="v3-intro">Mientras sigues pensando, todavía no tienes que sentirlo.</p></>}
    {step === 2 && <><h1 id="v3-title">Tu cabeza no está buscando una mejor respuesta.</h1><p className="v3-reveal">Está buscando alivio.</p><div className="v3-copy-list"><p>Si dices que sí, evitas por un momento la culpa de decir que no.</p><p>Si preguntas otra opinión, ya no sientes que toda la decisión depende de ti.</p><p>Si pospones esa conversación, no tienes que enfrentar todavía la reacción de la otra persona.</p><p>Si vuelves a pensar una decisión, retrasas un poco más la posibilidad de equivocarte.</p></div><p className="v3-intro">Y todo eso se siente como:</p><p className="v3-quote">“Necesito pensarlo mejor.”</p><p className="v3-closing">Pero muchas veces no estás resolviendo nada.<br /><br />Estás intentando sentir menos.</p></>}
    {step === 3 && <><h1 id="v3-title">Y funciona.</h1><p className="v3-reveal">Por unos minutos.</p><div className="v3-copy-list"><p>Preguntas… y te tranquilizas.</p><p>Pospones… y baja la tensión.</p><p>Cedes… y evitas el conflicto.</p><p>Le das otra vuelta… y sientes que todavía tienes el control.</p></div><p className="v3-intro">Pero ese alivio dura poco.<br /><br />Y tu cabeza aprende algo:</p><p className="v3-quote">“Cuando algo me incomoda, no actúo. Vuelvo a pensarlo.”</p><p className="v3-intro">Por eso la próxima vez vuelves a dudar.<br /><br />Y vuelves a buscar una respuesta que quizá ya tenías.</p><p className="v3-closing">La salida no es pensar todavía más.<br /><br />Es aprender a actuar sin esperar a que la incomodidad desaparezca primero.</p></>}
    {step === 4 && <><h1 id="v3-title">Ahí es donde entra NIA.</h1><div className="v3-copy-list"><p>No para darte otra opinión.</p><p>No para decirte qué hacer.</p><p>Y mucho menos para que dependas de ella cada vez que tengas que decidir algo.</p></div><p className="v3-intro">NIA te acompaña diariamente por WhatsApp alrededor de esos momentos en los que empiezas a darle vueltas a algo que, en el fondo, ya sabes.</p><p className="v3-intro">Para ayudarte a distinguir entre:</p><p className="v3-quote">“¿Cambió algo de verdad?”<br /><br />o<br /><br />“¿Solo apareció algo que me incomoda sentir?”</p><p className="v3-intro">Y ayudarte a volver a tu propio criterio antes de terminar haciendo algo distinto a lo que realmente querías.</p><p className="v3-closing">Quiero mostrártelo contigo.</p><p className="v3-question">¿Dónde te pasa más?</p><Choices value={state.context} onChange={chooseContext} /><label className="v3-name-field" htmlFor="v3-name">¿Cómo te gusta que te llamen? <span>Opcional</span><input id="v3-name" value={name} onChange={event => setName(event.target.value)} maxLength={80} autoComplete="given-name" placeholder="Tu nombre" /></label></>}
    {step === 5 && <><h1 id="v3-title">Ahora imagina que mañana vuelve ese momento.</h1><p className="v3-intro">No tienes que abrir una aplicación.<br /><br />No tienes que acordarte de hacer un ejercicio.<br /><br />Son las 8:00 a. m.<br /><br />Tu celular vibra.<br /><br />NIA te escribió.</p><WhatsappDemo state={current} /><p className="v3-closing">Eso es NIA.</p><p className="v3-intro">No una frase motivacional al azar.<br /><br />Una intervención pensada alrededor de lo que tú estás trabajando y del patrón que quieres empezar a cambiar.</p></>}
    {step === 6 && <><h1 id="v3-title">NIA no quiere que dependas de NIA.</h1><p className="v3-reveal">Quiere que cada vez dependas más de ti.</p><div className="v3-copy-list"><p>Un mensaje proactivo al día.<br />En el horario que eliges.<br />Conectado con lo que estás trabajando.</p><p>Sin decirte qué decisión tomar.<br />Sin convertirse en otra opinión que necesitas consultar.<br />Sin chat infinito.</p></div><p className="v3-intro">Porque el objetivo no es que nunca vuelvas a dudar.<br /><br />Es que cuando vuelva la duda, puedas reconocer qué está pasando antes de dejar que decida por ti.</p><p className="v3-closing">Y empezar a hacer algo diferente:<br /><br /><em>sentirlo… sin abandonarte.</em></p></>}
  </div></motion.section><div className="v3-action">{step === 6 ? <Link className="v3-cta" href="/descubre/v3/planes" onClick={() => trackFunnelV3('trust_completed', { screen: 6, screen_key: 'trust' })}>Quiero probarlo conmigo <ArrowRight size={18} aria-hidden="true" /></Link> : <button className="v3-cta" type="button" disabled={!canContinue} onClick={step === 4 ? finishPersonalize : next}>{step === 1 ? 'Quiero entender qué estoy evitando' : step === 2 ? 'Esto explica demasiadas cosas' : step === 3 ? 'Quiero aprender a hacer eso' : step === 4 ? 'Muéstrame cómo sería' : 'Quiero que NIA esté ahí'} <ArrowRight size={18} aria-hidden="true" /></button>}</div></main>;
}
