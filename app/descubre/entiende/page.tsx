'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { trackFunnel } from '@/lib/funnel';
export default function UnderstandPage() {
  useEffect(() => { trackFunnel('understand_nia_opened'); }, []);
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><h1>A veces no necesitas otra opinión. Ya sabes qué quieres.</h1><p className="funnel-copy">Lo difícil es mantener tu propia dirección cuando alguien o algo consigue hacerte dudar.</p><p className="funnel-copy strong">NIA no decide por ti. No te dice qué deberías querer.</p><p className="funnel-copy">Te ayuda a volver a tu propia dirección cuando algo empieza a sacarte de ella.</p><a className="funnel-button" href="/descubre/prueba">Quiero probarlo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
