'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { trackFunnel } from '@/lib/funnel';

export default function UnderstandPage() {
  useEffect(() => { trackFunnel('understand_nia_opened'); trackFunnel('understand_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow discover-understand"><h1>Si te reconociste en alguna de esas situaciones, quiero enseñarte algo.</h1><p className="funnel-copy">A veces ya sabes lo que quieres.</p><p className="funnel-copy">Lo difícil aparece después, cuando algo o alguien consigue hacerte dudar.</p><p className="funnel-copy">Y antes de decirte qué hace NIA, quiero que entiendas por qué existe.</p><a className="funnel-button" href="/descubre/presenta">Quiero entenderlo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
