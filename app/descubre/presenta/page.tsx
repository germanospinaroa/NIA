'use client';
import { ArrowRight } from 'lucide-react';
import { DiscoverStage } from '@/components/funnel/DiscoverStage';
import { trackFunnel } from '@/lib/funnel';
export default function PresentPage() { return <DiscoverStage><h1>Hola. Soy NIA.</h1><p className="funnel-copy">Y estoy aquí para acompañarte justo en esos momentos en los que sabes cómo quieres actuar… pero te cuesta volver a ti cuando llega el momento.</p><p className="funnel-copy">No voy a decidir por ti.<br /><br />No voy a decirte qué hacer.</p><p className="funnel-copy">Quiero ayudarte a volver a lo que tú misma ya habías decidido cuando algo te hace dudar.</p><a className="funnel-button" href="/descubre/nombre" onClick={() => trackFunnel('nia_intro_viewed')}>Quiero conocerte <ArrowRight size={17} /></a></DiscoverStage>; }
