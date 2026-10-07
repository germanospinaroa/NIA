import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';

export default function ThankYouPage() {
  return <FunnelFrame><section className="funnel-screen"><div className="funnel-content narrow"><h1>Tu acceso a NIA está casi listo.</h1><p className="funnel-copy">Usa el mismo correo con el que hiciste tu compra para activar tu cuenta.</p><Link className="funnel-button" href="/acceso">Activar mi acceso <ArrowRight size={17} /></Link><p className="mt-5 text-[13px] text-[var(--continuity-muted)]">Puede tomar unos segundos mientras confirmamos tu compra.</p></div></section></FunnelFrame>;
}
