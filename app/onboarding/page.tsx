/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelState } from '@/lib/funnel';
import { defaultMvpState, saveMvpState, trackMvp } from '@/lib/mvp';

type Step = 'name' | 'direction' | 'contexts' | 'voice' | 'ready';
const contextOptions = ['Conversaciones difíciles', 'Poner límites', 'Tomar decisiones', 'Cuando empiezo a dudar de mí'];
const voices = [['direct', 'Directa'], ['warm', 'Cálida'], ['thoughtful', 'Que me haga pensar']] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('name');
  const [state, setState] = useState<FunnelState>({ recognitionComplete: false });
  const [name, setName] = useState('');
  const [direction, setDirection] = useState('');
  const [contexts, setContexts] = useState<string[]>([]);
  const [voice, setVoice] = useState<'direct' | 'warm' | 'thoughtful'>('direct');
  useEffect(() => { const funnel = readFunnelState(); setState(funnel); setName(funnel.firstName || ''); setDirection(funnel.directionText || ''); setContexts(funnel.contexts || []); if (funnel.voiceStyle) setVoice(funnel.voiceStyle); trackFunnel('onboarding_started'); }, []);
  function update(patch: Partial<FunnelState>) { setState(current => ({ ...current, ...patch })); saveFunnelState(patch); }
  function next() {
    trackFunnel('onboarding_step_completed', { step });
    setStep(step === 'name' ? 'direction' : step === 'direction' ? 'contexts' : step === 'contexts' ? 'voice' : 'ready');
  }
  function toggleContext(value: string) { setContexts(current => current.includes(value) ? current.filter(item => item !== value) : current.length < 2 ? [...current, value] : current); }
  async function finish() {
    const finalState = { ...state, firstName: name.trim(), directionText: direction.trim(), contexts, voiceStyle: voice };
    saveFunnelState(finalState); saveMvpState({ ...defaultMvpState, firstName: name.trim(), directionText: direction.trim(), desiredChangeOriginal: direction.trim(), voiceStyle: voice === 'thoughtful' ? 'grounded' : voice, onboardingComplete: true });
    trackFunnel('onboarding_completed'); trackFunnel('app_entered'); trackMvp('onboarding_completed');
    try { const profile = await fetch('/api/profile'); if (profile.ok) await fetch('/api/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ first_name: name.trim(), direction_text: direction.trim(), desired_change_original: direction.trim(), voice_style: voice, current_context_original: contexts.join(', ') }) }); } catch { /* local preview remains available */ }
    router.push('/app');
  }
  const common = <p className="funnel-note">Paso {step === 'name' ? '1' : step === 'direction' ? '2' : step === 'contexts' ? '3' : '4'} de 4</p>;
  return <FunnelFrame step="CONFIGURAR NIA"><section className="funnel-screen"><div className="funnel-content narrow">{step === 'name' && <><p className="eyebrow">EMPEZAR</p><h1>¿Cómo quieres que te llame?</h1><input autoFocus className="funnel-input" value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && name.trim()) next(); }} placeholder="Tu nombre" autoComplete="given-name" /><button className="funnel-button" disabled={!name.trim()} onClick={next}>Continuar <ArrowRight size={17} /></button>{common}</>}{step === 'direction' && <><p className="eyebrow">TU DIRECCIÓN</p><h1>Ahora sí. ¿Qué quieres que sea diferente para ti?</h1><p className="funnel-copy">No tienes que explicarlo perfecto.</p><textarea autoFocus className="funnel-input textarea" value={direction} onChange={event => setDirection(event.target.value)} placeholder="Quiero..." maxLength={180} /><button className="funnel-button" disabled={!direction.trim()} onClick={() => { update({ directionText: direction }); next(); }}>Continuar <ArrowRight size={17} /></button>{common}</>}{step === 'contexts' && <><p className="eyebrow">DÓNDE APLICA</p><h1>¿Dónde te cuesta más vivirlo como quieres?</h1><div className="choice-list">{contextOptions.map(option => <button key={option} type="button" aria-pressed={contexts.includes(option)} onClick={() => toggleContext(option)} className={'choice-card ' + (contexts.includes(option) ? 'selected' : '')}><span>{option}</span>{contexts.includes(option) && <Check size={17} />}</button>)}</div><button className="funnel-button" disabled={!contexts.length} onClick={() => { update({ contexts }); next(); }}>Continuar <ArrowRight size={17} /></button>{common}</>}{step === 'voice' && <><p className="eyebrow">LA VOZ DE NIA</p><h1>Cuando NIA te acompañe, ¿cómo quieres que te hable?</h1><div className="choice-list">{voices.map(([value, label]) => <button key={value} type="button" aria-pressed={voice === value} onClick={() => setVoice(value)} className={'choice-card ' + (voice === value ? 'selected' : '')}><span>{label}</span>{voice === value && <Check size={17} />}</button>)}</div><button className="funnel-button" onClick={() => { update({ voiceStyle: voice }); next(); }}>Continuar <ArrowRight size={17} /></button>{common}</>}{step === 'ready' && <><p className="eyebrow">LISTA PARA EMPEZAR</p><h1>Ya tenemos por dónde empezar.</h1><div className="summary-card"><p className="card-label">TU DIRECCIÓN</p><p>{direction}</p><p className="card-label second">DÓNDE</p><p>{contexts.join(' · ')}</p></div><p className="funnel-copy">Con esto, NIA puede empezar a acompañarte de una forma mucho más personal.</p><button className="funnel-button" onClick={finish}>Entrar a NIA <ArrowRight size={17} /></button></>}</div></section></FunnelFrame>;
}
