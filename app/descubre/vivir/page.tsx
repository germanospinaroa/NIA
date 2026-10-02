'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { WhatsAppDemo } from '@/components/funnel/WhatsAppDemo';
import { readFunnelState, trackFunnel, type RecognitionContext } from '@/lib/funnel';

export default function LivePage() {
  const [name, setName] = useState('');
  const [context, setContext] = useState<RecognitionContext>('decision_doubt');
  useEffect(() => { const state = readFunnelState(); setName(state.firstName || ''); setContext(state.recognitionContext || 'decision_doubt'); trackFunnel('demo_viewed'); }, []);
  const message = <>Me contaste que quieres trabajar en no dejar que la opinión de otra persona te haga dudar de algo que tú ya habías decidido.<br /><br />Si hoy vuelve a pasar, quiero recordarte algo:<br /><br /><strong>escuchar a alguien no significa tener que cambiar de opinión.</strong><br /><br />Puedes escuchar, tomarte tu tiempo y seguir siendo tú quien decide.<br /><br />Si lo que querías antes de escuchar esa opinión todavía tiene sentido para ti, no tienes que cambiarlo solo porque alguien lo cuestionó.</>;
  return <DiscoverStage><h1>Ahora sí, {name || 'mucho gusto'}. Mira cómo se vería NIA contigo.</h1><p className="funnel-copy">Vamos a usar exactamente lo que acabas de reconocer.</p><WhatsAppDemo name={name} context={context} message={message} /><p className="funnel-copy whatsapp-caption">Y esto te llegaría directamente por WhatsApp.</p><p className="funnel-copy">No tienes que abrir otra aplicación para buscar qué hacer. NIA forma parte de tu día donde ya estás.</p><a className="funnel-button" href="/descubre/funciona" onClick={() => trackFunnel('demo_whatsapp_viewed')}>Quiero ver cómo funciona <ArrowRight size={17} /></a></DiscoverStage>;
}
