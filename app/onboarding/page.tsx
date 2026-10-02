/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelState, type OnboardingFollowupChoice, type OnboardingFeeling, type OnboardingSituationChoice, type OnboardingStage } from '@/lib/funnel';
import { defaultMvpState, saveMvpState, trackMvp } from '@/lib/mvp';

const contextOptions = ['Conversaciones difíciles', 'Poner límites', 'Tomar decisiones', 'Cuando empiezo a dudar de mí'];
const voices = [['direct', 'Directa'], ['warm', 'Cálida'], ['thoughtful', 'Que me haga pensar']] as const;
const stages: OnboardingStage[] = ['name', 'connection', 'evidence', 'nia', 'feeling', 'demo_intro', 'situation', 'response', 'explain', 'direction', 'contexts', 'voice', 'ready'];
const situationOptions: Array<{ value: OnboardingSituationChoice; label: string }> = [
  { value: 'new_information', label: 'Me hizo ver algo que no había considerado.' },
  { value: 'self_doubt', label: 'Me hizo empezar a dudar de mí.' },
  { value: 'unsure', label: 'Todavía no sé.' },
];
const followupOptions: Array<{ value: OnboardingFollowupChoice; label: string }> = [
  { value: 'yes', label: 'Sí.' },
  { value: 'no', label: 'No.' },
  { value: 'think', label: 'Necesito pensarlo.' },
];
const feelingOptions: Array<{ value: OnboardingFeeling; label: string }> = [
  { value: 'heavy', label: 'Me pasa y me pesa.' },
  { value: 'uncertain', label: 'Me pasa, pero todavía no sé cómo cambiarlo.' },
  { value: 'ready', label: 'Quiero empezar a hacerlo diferente.' },
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
  const [feeling, setFeeling] = useState<OnboardingFeeling>();
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
    setFeeling(funnel.onboardingFeeling);
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

  function chooseFeeling(value: OnboardingFeeling) {
    setFeeling(value);
    persist({ onboardingFeeling: value });
    trackFunnel('feeling_selected', { feeling: value });
    go('demo_intro');
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
  const responseCopy = situationChoice === 'new_information'
    ? <>Entonces quizá sí apareció información nueva.<br /><br />No tienes que defender tu decisión solo porque ya la habías tomado. Puedes revisarla. Pero revisarla porque tú quieres, no simplemente porque alguien dudó de ella.</>
    : situationChoice === 'self_doubt'
      ? <>Entonces no necesitas tomar una nueva decisión todavía.<br /><br />Vuelve un segundo a la razón por la que habías decidido decir que no.</>
      : <>Está bien.<br /><br />No todo tiene que resolverse en el mismo momento. Antes de cambiar de opinión, intenta separar dos cosas:<br /><br />¿Apareció algo nuevo... o simplemente apareció la duda?</>;

  return <FunnelFrame>
    <section className={'funnel-screen onboarding-story-screen ' + (stage === 'evidence' ? 'onboarding-evidence-screen' : '')}>
      <div className="funnel-content narrow onboarding-stage" key={stage}>
        {stage === 'name' && <>
          <h1>¿Cómo quieres que te llame?</h1>
          <input autoFocus className="funnel-input" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && name.trim()) { persist({ firstName: name.trim() }); trackFunnel('onboarding_name_completed'); go('connection'); } }} placeholder="Tu nombre" autoComplete="given-name" />
          <button className="funnel-button" disabled={!name.trim()} onClick={() => { persist({ firstName: name.trim() }); trackFunnel('onboarding_name_completed'); go('connection'); }}>Continuar <ArrowRight size={17} /></button>
        </>}

        {stage === 'connection' && <>
          <h1>{name}, gracias.</h1>
          <p className="funnel-copy strong">Y antes de enseñarte NIA, quiero contarte algo.</p>
          <p className="funnel-copy">Lo que acabas de reconocer no significa que no sepas lo que quieres.<br /><br />Muchas veces lo sabemos.<br /><br />Lo difícil aparece cuando llega el momento de actuar.</p>
          <p className="funnel-note onboarding-note">No voy a pedirte que me cuentes toda tu vida. Solo quiero mostrarte por qué NIA funciona de la forma en que funciona.</p>
          <button className="funnel-button" onClick={() => go('evidence')}>Quiero entender <ArrowRight size={17} /></button>
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
          <p className="funnel-copy">Quiero ayudarte a volver a escucharte cuando algo o alguien empieza a hacerte dudar de ti.</p>
          <p className="funnel-copy strong">Y hacerlo en el momento en que realmente importa.</p>
          <button className="funnel-button" onClick={() => { trackFunnel('nia_intro_viewed'); go('feeling'); }}>Quiero verlo <ArrowRight size={17} /></button>
        </>}

        {stage === 'feeling' && <>
          <h1>Ahora quiero conocerte un poquito.</h1>
          <p className="funnel-copy">No necesito que me cuentes toda tu historia.</p>
          <p className="funnel-copy strong">Solo dime algo.</p>
          <p className="funnel-question">¿Cómo te sientes hoy con eso que acabamos de hablar?</p>
          <div className="choice-list conversation-options">{feelingOptions.map(option => <button key={option.value} type="button" className={'choice-card ' + (feeling === option.value ? 'selected' : '')} aria-pressed={feeling === option.value} onClick={() => chooseFeeling(option.value)}><span>{option.label}</span>{feeling === option.value && <Check size={17} />}</button>)}</div>
        </>}

        {stage === 'demo_intro' && <>
          <h1>Ahora sí. Te quiero mostrar cómo sería.</h1>
          <p className="funnel-copy">No es una frase bonita.</p>
          <p className="funnel-copy">No es un consejo.</p>
          <p className="funnel-copy">Es una situación, una intervención y una respuesta tuya.</p>
          <p className="funnel-copy strong">Y según lo que respondas, NIA cambia lo que viene después.</p>
          <button className="funnel-button" onClick={() => { trackFunnel('demo_started'); trackFunnel('demo_situation_viewed'); go('situation'); }}>Muéstramelo <ArrowRight size={17} /></button>
        </>}

        {stage === 'situation' && <>
          <h1>Imagina que hoy tienes algo muy claro.</h1>
          <div className="onboarding-situation"><p>Decidiste que esta vez vas a decir que no.</p><p>No quieres hacerlo. No porque alguien te haya dicho que está mal, sino porque tú sabes que no quieres.</p><p className="situation-quote">Y justo antes de hacerlo, alguien te dice:<br /><strong>“¿Segura? Yo creo que deberías pensarlo mejor.”</strong></p></div>
          <p className="funnel-question">¿Qué pasa contigo en ese momento?</p>
          <div className="option-list conversation-options">{situationOptions.map(option => <button key={option.value} className="option-button" onClick={() => chooseSituation(option.value)}>{option.label}<ArrowRight size={16} /></button>)}</div>
        </>}

        {stage === 'response' && <>
          <h1>NIA responde a lo que acabas de decir.</h1>
          <div className="nia-response-card"><p>{responseCopy}</p></div>
          <p className="funnel-question">{situationChoice === 'unsure' ? '¿Qué te parece más cercano ahora?' : '¿Sigue teniendo sentido para ti?'}</p>
          <div className="option-list conversation-options">{(situationChoice === 'unsure' ? [{ value: 'new_information' as const, label: 'Algo nuevo.' }, { value: 'self_doubt' as const, label: 'Solo duda.' }, { value: 'unsure' as const, label: 'No lo sé todavía.' }] : followupOptions).map(option => <button key={option.value} className="option-button" onClick={() => chooseFollowup(option.value as OnboardingFollowupChoice)}>{option.label}<ArrowRight size={16} /></button>)}</div>
        </>}

        {stage === 'explain' && <>
          <h1>Eso es NIA.</h1>
          <p className="funnel-copy">NIA no decide por ti.</p>
          <p className="funnel-copy">No intenta convencerte.</p>
          <p className="funnel-copy">Te ayuda a separar lo que realmente cambió de aquello que simplemente hizo que empezaras a dudar de ti.</p>
          <p className="funnel-copy">Y cuanto más interactúas con ella, más puede ajustar qué tipo de apoyo tiene sentido para ti.</p>
          <div className="quiet-lines onboarding-lines"><p>Tu intención importa.</p><p>Pero también importa el momento en que aparece la situación.</p><p>Por eso NIA quiere aparecer cerca del momento en que algo cambia.</p></div>
          <button className="funnel-button" onClick={() => go('direction')}>Continuar <ArrowRight size={17} /></button>
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
