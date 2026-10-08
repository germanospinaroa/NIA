import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { ThankYouTracker } from '@/components/analytics/ThankYouTracker';

type ThankYouPageProps = {
  searchParams?: Promise<{ status?: string | string[] | undefined }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const status = Array.isArray(params?.status) ? params.status[0] : params?.status;
  const state = status === 'pending' || status === 'analysis' ? status : 'approved';
  const content = {
    approved: {
      title: 'Tu acceso a NIA está casi listo.',
      body: 'Usa el mismo correo con el que hiciste tu compra para activar tu cuenta.',
      secondary: 'Puede tomar unos segundos mientras confirmamos tu compra.',
      action: 'Activar mi acceso',
      href: '/acceso',
    },
    pending: {
      title: 'Estamos confirmando tu compra.',
      body: 'En cuanto Hotmart confirme el pago, podrás activar tu acceso a NIA.',
      secondary: 'No necesitas volver a comprar ni completar el proceso otra vez.',
      action: 'Volver a NIA',
      href: '/',
    },
    analysis: {
      title: 'Tu compra está siendo verificada.',
      body: 'Cuando Hotmart termine la revisión, podrás activar tu acceso a NIA.',
      secondary: 'No necesitas realizar ninguna acción adicional por ahora.',
      action: 'Volver a NIA',
      href: '/',
    },
  }[state];

  return <FunnelFrame><ThankYouTracker status={state} /><section className="funnel-screen"><div className="funnel-content narrow"><h1>{content.title}</h1><p className="funnel-copy">{content.body}</p><Link className="funnel-button" href={content.href}>{content.action} <ArrowRight size={17} /></Link><p className="mt-5 text-[13px] text-[var(--continuity-muted)]">{content.secondary}</p></div></section></FunnelFrame>;
}
