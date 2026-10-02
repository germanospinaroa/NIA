'use client';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { trackFunnel } from '@/lib/funnel';

export default function EvidencePage() {
  useEffect(() => { trackFunnel('evidence_viewed'); }, []);
  return <FunnelFrame><section className="funnel-screen narrative-screen"><div className="funnel-content narrow discover-base"><h1>Esto tiene un fundamento.</h1><p className="funnel-copy">Hay una línea de investigación en psicología que estudia qué pasa cuando una intención no se queda solo en «quiero hacerlo», sino que se conecta con el momento concreto en que necesitamos actuar.</p><p className="funnel-copy">También se están explorando intervenciones digitales que ajustan el apoyo a la persona y al momento en que lo necesita.</p><div className="evidence-note"><p className="evidence-note-title">En qué se basa</p><div className="evidence-links"><a href="https://doi.org/10.1016/S0065-2601(06)38002-1" target="_blank" rel="noreferrer">Gollwitzer &amp; Sheeran, 2006</a><a href="https://pubmed.ncbi.nlm.nih.gov/39542743/" target="_blank" rel="noreferrer">Hsu et al., 2025</a></div><p className="evidence-disclaimer">Estas investigaciones ayudan a explicar el mecanismo que NIA explora. No son una validación clínica de NIA.</p></div><a className="funnel-button" href="/descubre/nombre">Quiero verlo <ArrowRight size={17} /></a></div></section></FunnelFrame>;
}
