/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelState, type OnboardingFollowupChoice, type OnboardingSituationChoice, type OnboardingStage } from '@/lib/funnel';
import { defaultMvpState, saveMvpState, trackMvp } from '@/lib/mvp';

const contextOptions = ['Conversaciones difíciles', 'Poner límites', 'Tomar decisiones', 'Cuando empiezo a dudar de mí'];
const voices = [['direct', 'Directa'], ['warm', 'Cálida'], ['thoughtful', 'Que me haga pensar']] as const;
const stages: OnboardingStage[] = ['name', 'connection', 'problem', 'evidence', 'nia', 'demo_intro', 'situation', 'response', 'explain', 'personalization', 'mechanism', 'direction', 'contexts', 'voice', 'ready'];
const situationOptions: Array<{ value: OnboardingSituationChoice; label: string }> = [
  { value: 'doubt', label: 'Empiezo a dudar.' },
  { value: 'firm', label: 'Me mantengo en lo que decidí.' },
  { value: 'source_dependent', label: 'Depende mucho de quién me lo diga.' },
];
const followupOptions: Array<{ value: OnboardingFollowupChoice; label: string }> = [
  { value: 'new_information', label: 'Algo nuevo.' },
  { value: 'only_doubt', label: 'Solo empecé a dudar.' },
  { value: 'unsure', label: 'No estoy segura.' },
];

function isStage(value: unknown): value is OnboardingStage {
  return typeof value === 'string' && stages.includes(value as OnboardingStage);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<OnboardingStage>('name');
  const [state, setState] = useState<FunnelState>({ recognitionComplete: false });
  const [name, setName] = useState('');
  const [direction, setDirection] = useState('');
  const [contexts, setContexts] = useState<string[]>([]);
  const [voice, setVoice] = useState<'direct' | 'warm' | 'thoughtful'>('direct');
  const [situationChoice, setSituationChoice] = useState<OnboardingSituationChoice>();

  useEffect(() => {
    const funnel = readFunnelState();
    const initialStage = funnel.firstName && isStage(funnel.onboardingStage) && funnel.onboardingStage === 'name'
      ? 'connection'
      : funnel.firstName && isStage(funnel.onboardingStage)
        ? funnel.onboardingStage
        : funnel.firstName ? 'connection' : 'name';
    setState(funnel);
    setStage(initialStage);
    setName(funnel.firstName || '');
    setDirection(funnel.directionText || '');
    setContexts(funnel.contexts || []);
    if (funnel.voiceStyle) setVoice(funnel.voiceStyle);
    setSituationChoice(funnel.onboardingSituationChoice);
    saveFunnelState({ onboardingStage: initialStage });
    trackFunnel('onboarding_started');
  }, []);

  function persist(patch: Partial<FunnelState>) {
    setState(current => ({ ...current, ...patch }));
    saveFunnelState(patch);
  }

  function go(next: OnboardingStage, properties: Record<string, string | number | boolean> = {}) {
    persist({ onboardingStage: next });
    trackFunnel('onboarding_step_completed', { from: stage, to: next, ...properties });
    setStage(next);
  }

  function chooseSituation(value: OnboardingSituationChoice) {
    setSituationChoice(value);
    persist({ onboardingSituationChoice: value });
    trackFunnel('demo_response_selected', { response: value });
    go('response');
  }

  function chooseFollowup(value: OnboardingFollowupChoice) {
    persist({ onboardingFollowupChoice: value });
    trackFunnel('demo_completed', { followup: value });
    go('explain');
  }

  async function finish() {
    const finalState = { ...state, firstName: name.trim(), directionText: direction.trim(), contexts, voiceStyle: voice, onboardingStage: 'ready' as const };
    saveFunnelState(finalState);
    saveMvpState({ ...defaultMvpState, firstName: name.trim(), directionText: direction.trim(), desiredChangeOriginal: direction.trim(), voiceStyle: voice === 'thoughtful' ? 'grounded' : voice, onboardingComplete: true });
    trackFunnel('onboarding_completed');
    trackFunnel('app_entered');
    trackMvp('onboarding_completed');
    try {
      const profile = await fetch('/api/profile');
      if (profile.ok) await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ first_name: name.trim(), direction_text: direction.trim(), desired_change_original: direction.trim(), voice_style: voice, current_context_original: contexts.join(', ') }) });
    } catch { /* local preview remains available */ }
    router.push('/app');
  }

  const stepNumber = useMemo(() => ({ direction: 1, contexts: 2, voice: 3, ready: 4 }[stage as 'direction' | 'contexts' | 'voice' | 'ready']), [stage]);
  const responseCopy = situationChoice === 'doubt'
    ? <>Espera un segundo.<br /><br />Que ahora estés dudando no significa necesariamente que tu decisión haya cambiado.<br /><br />Puede haber aparecido información nueva. O puede haber aparecido simplemente la duda.<br /><br />Vamos a separar una cosa de la otra.</>
    : situationChoice === 'firm'
      ? <>Eso también es información.<br /><br />No necesitas defender tu decisión solo porque alguien la cuestionó. Pero tampoco tienes que aferrarte a ella.<br /><br />La pregunta es: ¿sigues eligiéndola porque tiene sentido para ti?</>
      : <>Eso también dice algo.<br /><br />La persona que tienes delante puede cambiar cuánto dudas de lo que tú misma habías decidido.<br /><br />Vamos a mirar una cosa: ¿cambió tu decisión... o cambió la confianza que tienes en ella?</>;
  const personalizationCopy = situationChoice === 'doubt'
    ? <>Acabas de decirme que cuando alguien cuestiona una decisión, empiezas a dudar.</>
    : situationChoice === 'firm'
      ? <>Acabas de decirme que puedes mantenerte en lo que decidiste aunque alguien lo cuestione.</>
      : <>Acabas de decirme que cuánto dudas puede depender de quién tienes delante.</>;

  return <FunnelFrame>
    <section className={'funnel-screen onboarding-story-screen ' + (stage === 'evidence' ? 'onboarding-evidence-screen' : stage === 'problem' ? 'onboarding-problem-screen' : '')}>
      <div className="funnel-content narrow onboarding-stage" key={stage}>
        {stage === 'name' && <>
          <h1>Antes de seguir, quiero conocerte un poquito.</h1>
          <p className="funnel-copy">Si voy a acompañarte en esto, quiero hacerlo contigo.</p>
          <p className="funnel-question">¿Cómo te llamas?</p>
          <input autoFocus className="funnel-input" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && name.trim()) { persist({ firstName: name.trim() }); trackFunnel('onboarding_name_completed'); go('connection'); } }} placeholder="Tu nombre" autoComplete="given-name" />
          <button className="funnel-button" disabled={!name.trim()} onClick={() => { persist({ firstName: name.trim() }); trackFunnel('onboarding_name_completed'); go('connection'); }}>Continuar <ArrowRight size={17} /></button>
        </>}

        {stage === 'connection' && <>
          <h1>{name}, gracias por estar aquí.</h1>
          <p className="funnel-copy strong">Y antes de enseñarte NIA, quiero contarte algo.</p>
          <p className="funnel-copy">Lo que acabas de reconocer no significa que no sepas lo que quieres.<br /><br />Muchas veces lo sabemos.<br /><br />Lo difícil aparece cuando llega el momento de actuar.</p>
          <p className="funnel-note onboarding-note">No voy a pedirte que me cuentes toda tu vida. Solo quiero mostrarte por qué NIA funciona de la forma en que funciona.</p>
          <button className="funnel-button" onClick={() => go('problem')}>Quiero entender <ArrowRight size={17} /></button>
        </>}

        {stage === 'problem' && <>
          <h1>{name}, hay algo importante que quiero que entiendas.</h1>
          <p className="funnel-copy">A veces sabes perfectamente qué quieres hacer.</p>
          <p className="funnel-copy">Incluso puedes haberlo decidido.</p>
          <p className="funnel-copy">Y aun así, cuando llega el momento, algo cambia.</p>
          <div className="quiet-lines onboarding-lines"><p>Una opinión.</p><p>Una reacción.</p><p>Un comentario.</p><p>Una duda.</p></div>
          <p className="funnel-copy">Y empiezas a preguntarte si realmente deberías hacer eso que tú habías decidido.</p>
          <button className="funnel-button" onClick={() => go('evidence')}>Quiero entenderlo <ArrowRight size={17} /></button>
        </>}

        {stage === 'evidence' && <>
          <h1>Esto tiene una explicación.</h1>
          <p className="funnel-copy">La psicología lleva décadas estudiando algo muy concreto: la distancia entre lo que queremos hacer y lo que finalmente hacemos.</p>
          <p className="funnel-copy">Tener clara una intención no siempre garantiza que, cuando llegue el momento, actuemos de la misma manera.</p>
          <div className="evidence-card" aria-label="Resultados de Webb y Sheeran de 2006">
            <div className="evidence-row"><span>INTENCIÓN</span><strong>d = 0.66</strong><i><b style={{ width: '82%' }} /></i></div>
            <div className="evidence-row"><span>CONDUCTA</span><strong>d = 0.36</strong><i><b style={{ width: '45%' }} /></i></div>
          </div>
          <p className="funnel-copy evidence-simple">Dicho más sencillo:<br /><strong>Saber lo que quieres no siempre basta cuando llega el momento real.</strong></p>
          <a className="evidence-link" href="https://pubmed.ncbi.nlm.nih.gov/16536643/" target="_blank" rel="noreferrer">Ver la evidencia <ExternalLink size={14} /></a>
          <p className="funnel-note">Webb &amp; Sheeran, Psychological Bulletin (2006). Revisión de 47 pruebas experimentales. Estos valores no son porcentajes y no miden NIA.</p>
          <button className="funnel-button" onClick={() => { trackFunnel('evidence_viewed'); go('nia'); }}>Continuar <ArrowRight size={17} /></button>
        </>}

        {stage === 'nia' && <>
          <h1>Y ahí es donde entra NIA.</h1>
          <p className="funnel-copy">No quiero decirte qué hacer.</p>
          <p className="funnel-copy">Tampoco quiero convencerte de que siempre tienes razón.</p>
          <p className="funnel-copy">Está para ayudarte a volver a tu propio criterio cuando algo empieza a moverlo.</p>
          <p className="funnel-copy">No quiere darte consejos que podrían servirle a cualquiera.</p>
          <p className="funnel-copy strong">Quiere entender lo que estás viviendo y hacerlo cerca del momento en que realmente lo necesitas.</p>
          <button className="funnel-button" onClick={() => { trackFunnel('nia_intro_viewed'); go('demo_intro'); }}>Quiero verlo <ArrowRight size={17} /></button>
        </>}

        {stage === 'demo_intro' && <>
          <h1>Ahora quiero que lo vivas.</h1>
          <p className="funnel-copy">Te voy a mostrar una situación sencilla.</p>
          <p className="funnel-copy">Tú vas a responder como responderías normalmente.</p>
          <p className="funnel-copy">Después voy a enseñarte qué haría NIA con lo que acabas de decir.</p>
          <p className="funnel-copy strong">Así vas a entenderlo mucho mejor que si simplemente te lo explicara.</p>
          <button className="funnel-button" onClick={() => { trackFunnel('demo_started'); trackFunnel('demo_situation_viewed'); go('situation'); }}>Quiero verlo <ArrowRight size={17} /></button>
        </>}

        {stage === 'situation' && <>
          <h1>Imagina que hoy tienes algo muy claro.</h1>
          <div className="onboarding-situation"><p>Has decidido decir que no.</p><p>Lo pensaste. Sabes por qué quieres hacerlo. Incluso sabes que probablemente sea lo mejor para ti.</p><p className="situation-quote">Pero cuando finalmente lo dices, la otra persona responde:<br /><strong>“¿Segura? Yo pensé que tú sí querías hacerlo.”</strong></p></div>
          <p className="funnel-question">¿Qué pasa contigo en ese momento?</p>
          <div className="option-list conversation-options">{situationOptions.map(option => <button key={option.value} className="option-button" onClick={() => chooseSituation(option.value)}>{option.label}<ArrowRight size={16} /></button>)}</div>
        </>}

        {stage === 'response' && <>
          <h1>NIA responde a lo que acabas de decir.</h1>
          <div className="nia-response-card"><p>{responseCopy}</p></div>
          <p className="funnel-question">{situationChoice === 'doubt' ? '¿Qué cambió realmente?' : situationChoice === 'firm' ? '¿Sigues eligiéndola porque tiene sentido para ti?' : '¿Qué cambió más: tu decisión o la confianza que tienes en ella?'}</p>
          <div className="option-list conversation-options">{(situationChoice === 'doubt' ? followupOptions : situationChoice === 'firm' ? [{ value: 'yes' as const, label: 'Sí.' }, { value: 'no' as const, label: 'No.' }, { value: 'think' as const, label: 'Necesito pensarlo.' }] : [{ value: 'decision_changed' as const, label: 'Mi decisión cambió.' }, { value: 'confidence_changed' as const, label: 'Solo cambió mi confianza.' }, { value: 'unsure' as const, label: 'No lo sé.' }]).map(option => <button key={option.value} className="option-button" onClick={() => chooseFollowup(option.value)}>{option.label}<ArrowRight size={16} /></button>)}</div>
        </>}

        {stage === 'explain' && <>
          <h1>Eso es NIA.</h1>
          <p className="funnel-copy">NIA no decide por ti.</p>
          <p className="funnel-copy">No intenta convencerte.</p>
          <p className="funnel-copy">Tomó lo que acababas de decir y te ayudó a mirar la situación desde otro lugar.</p>
          <p className="funnel-copy">Y si mañana te ocurre algo parecido, NIA no tendría que empezar desde cero.</p>
          <button className="funnel-button" onClick={() => go('personalization')}>Continuar <ArrowRight size={17} /></button>
        </>}

        {stage === 'personalization' && <>
          <h1>{name}, fíjate en algo.</h1>
          <p className="funnel-copy">{personalizationCopy}</p>
          <p className="funnel-copy">Por eso NIA no debería responderte igual que a alguien que acaba de decir otra cosa.</p>
          <p className="funnel-copy strong">Tu respuesta cambia lo que viene después.</p>
          <button className="funnel-button" onClick={() => go('mechanism')}>Quiero entenderlo <ArrowRight size={17} /></button>
        </>}

        {stage === 'mechanism' && <>
          <h1>Y esto es apenas el comienzo.</h1>
          <p className="funnel-copy">Con el tiempo, NIA puede conocer mejor qué quieres cambiar, qué situaciones te cuestan y qué tipo de intervención te ayuda más.</p>
          <p className="funnel-copy">Así, cuando aparezca una situación importante, no recibes una frase genérica.</p>
          <p className="funnel-copy strong">Recibes algo construido alrededor de lo que tú estás viviendo.</p>
          <button className="funnel-button" onClick={() => { trackFunnel('onboarding_deep_started'); go('direction'); }}>Continuar <ArrowRight size={17} /></button>
        </>}

        {stage === 'direction' && <>
          <h1>¿Qué quieres que sea diferente para ti?</h1>
          <p className="funnel-copy">No tienes que explicarlo perfecto.</p>
          <textarea autoFocus className="funnel-input textarea" value={direction} onChange={event => setDirection(event.target.value)} placeholder="Quiero..." maxLength={180} />
          <button className="funnel-button" disabled={!direction.trim()} onClick={() => { persist({ directionText: direction.trim() }); go('contexts'); }}>Continuar <ArrowRight size={17} /></button>
          <p className="funnel-note">Una intención concreta es suficiente para empezar.</p>
        </>}

        {stage === 'contexts' && <>
          <h1>¿En qué situaciones te cuesta más actuar así?</h1>
          <div className="choice-list">{contextOptions.map(option => <button key={option} type="button" aria-pressed={contexts.includes(option)} onClick={() => setContexts(current => current.includes(option) ? current.filter(item => item !== option) : current.length < 2 ? [...current, option] : current)} className={'choice-card ' + (contexts.includes(option) ? 'selected' : '')}><span>{option}</span>{contexts.includes(option) && <Check size={17} />}</button>)}</div>
          <button className="funnel-button" disabled={!contexts.length} onClick={() => { persist({ contexts }); go('voice'); }}>Continuar <ArrowRight size={17} /></button>
          <p className="funnel-note">Puedes elegir hasta dos.</p>
        </>}

        {stage === 'voice' && <>
          <h1>Cuando NIA te acompañe, ¿cómo quieres que te hable?</h1>
          <div className="choice-list">{voices.map(([value, label]) => <button key={value} type="button" aria-pressed={voice === value} onClick={() => setVoice(value)} className={'choice-card ' + (voice === value ? 'selected' : '')}><span>{label}</span>{voice === value && <Check size={17} />}</button>)}</div>
          <button className="funnel-button" onClick={() => { persist({ voiceStyle: voice }); go('ready'); }}>Continuar <ArrowRight size={17} /></button>
        </>}

        {stage === 'ready' && <>
          <h1>Ya tenemos por dónde empezar.</h1>
          <div className="summary-card"><p className="card-label">TU DIRECCIÓN</p><p>{direction}</p><p className="card-label second">DÓNDE</p><p>{contexts.join(' · ')}</p></div>
          <p className="funnel-copy">Con esto, NIA puede empezar a acompañarte de una forma mucho más personal.</p>
          <button className="funnel-button" onClick={finish}>Entrar a NIA <ArrowRight size={17} /></button>
        </>}

        {stepNumber && <p className="funnel-note">Configuración {stepNumber} de 4</p>}
      </div>
    </section>
  </FunnelFrame>;
}
