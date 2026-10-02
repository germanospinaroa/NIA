'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { saveFunnelState, trackFunnel, type FunnelFeedback } from '@/lib/funnel';
const copy: Record<FunnelFeedback, string> = {
  as_is: 'Hoy no tienes que convencerte de nada. Puedes escuchar otras opiniones sin entregarles la decisión que ya era tuya.',
  grounded: 'Puedes seguir teniendo dudas y aun así dar un poco más de espacio a lo que ya piensas.',
  different: 'Antes de buscar otra respuesta, vuelve un momento a la que ya tenías. Luego decide qué quieres hacer con ella.',
};
export default function TryPage() {
  const [feedback, setFeedback] = useState<FunnelFeedback | null>(null);
  useEffect(() => { trackFunnel('microdemo_started'); }, []);
  function choose(value: FunnelFeedback) { setFeedback(value); saveFunnelState({ feedback: value, microdemoComplete: true }); trackFunnel('microdemo_feedback', { feedback: value }); trackFunnel('microdemo_adapted'); }
  return <FunnelFrame step="PROBAR NIA"><section className="funnel-screen demo-screen"><div className="funnel-content narrow"><p className="eyebrow">ASÍ FUNCIONA NIA</p><h1 className="demo-title">Vamos a probarlo con un ejemplo.</h1><div className="demo-card"><p className="card-label">TU DIRECCIÓN</p><p className="direction-text">Hoy quiero confiar más en mi criterio.</p><div className="demo-divider" /><p className="card-label">NIA TE DIRÍA</p><p className="intervention-text">No necesitas dejar de tener dudas para conservar tu propia opinión.</p></div>{!feedback ? <div className="feedback-wrap"><p className="feedback-label">¿Cómo te hablaría mejor?</p><div className="feedback-grid">{([['as_is', 'Así sí'], ['grounded', 'Más real'], ['different', 'Otro enfoque']] as const).map(([value, label]) => <button key={value} onClick={() => choose(value)} className="feedback-button">{label}</button>)}</div></div> : <div className="adapted-state"><div className="adapted-card"><Check size={17} /><p>{copy[feedback]}</p></div><p className="funnel-note">NIA aprende de señales como esta para ajustar lo que te muestra después.</p><p className="funnel-note">Tú decides qué señales se conservan.</p><a className="funnel-button" href="/descubre/planes">Seguir <ArrowRight size={17} /></a></div>}</div></section></FunnelFrame>;
}
