'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { checkoutForPlan } from '@/lib/hotmart-checkout';
import { readFunnelV3SessionId, readFunnelV3State, saveFunnelV3State, trackFunnelV3 } from '@/lib/funnel-v3';
import { addressName } from '@/lib/funnel-personalization';

export default function EmotionalV3PlansPage() {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [name, setName] = useState('');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  useEffect(() => { const state = readFunnelV3State(); setPlan(state.plan ?? 'monthly'); setName(addressName(state.preferredName)); trackFunnelV3('plans_viewed', { screen: 7, screen_key: 'plans' }); }, []);
  function select(value: 'monthly' | 'annual') { setPlan(value); saveFunnelV3State({ plan: value }); trackFunnelV3('plan_selected', { screen: 7, screen_key: 'plans', plan: value }); }
  async function startCheckout() {
    if (checkoutBusy) return;
    setCheckoutBusy(true); setCheckoutError('');
    try {
      const sessionId = readFunnelV3SessionId();
      if (!sessionId) throw new Error('session_missing');
      const response = await fetch('/api/funnel/v3/checkout-attempt', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, plan }) });
      const result = await response.json().catch(() => ({})) as { correlation_id?: string };
      if (!response.ok || !result.correlation_id) throw new Error('attempt_failed');
      const checkout = checkoutForPlan(plan);
      const url = new URL(checkout.url);
      url.searchParams.set('sck', result.correlation_id);
      saveFunnelV3State({ plan });
      trackFunnelV3('checkout_started', { screen: 7, screen_key: 'plans', plan, provider: 'hotmart' });
      window.location.assign(url.toString());
    } catch {
      setCheckoutBusy(false); setCheckoutError('No pudimos preparar el checkout. Revisa tu conexión e inténtalo de nuevo.');
    }
  }
  return <main className="v3-funnel v3-plans"><header className="v3-header"><Link href="/descubre/v3" className="v3-mark"><span />NIA</Link><Link className="v3-back" href="/descubre/v3">Volver</Link></header><section className="v3-plans-screen"><div className="v3-content"><p className="v3-kicker">{name ? `${name}, ESTA VEZ, TÚ.` : 'ESTA VEZ, TÚ.'}</p><h1>La próxima vez, no tienes que enfrentarlo de la misma manera.</h1><p className="v3-intro">NIA. Un acompañamiento diario para que tus decisiones se parezcan más a ti.</p><div className="v3-offer"><p><strong>7 días gratis</strong> con el servicio real por WhatsApp.</p><ul><li><Check size={16} />Un mensaje proactivo al día, en el momento que eliges.</li><li><Check size={16} />Acompañamiento conectado con lo que estás trabajando.</li><li><Check size={16} />Puedes cancelar antes del siguiente cobro.</li></ul></div><div className="v3-plan-list"><button type="button" className={`v3-plan${plan === 'annual' ? ' is-selected' : ''}`} aria-pressed={plan === 'annual'} onClick={() => select('annual')}><span><strong>Anual</strong><small>Para mantener la continuidad.</small></span><b>US$49.99 <small>/ año</small></b></button><button type="button" className={`v3-plan${plan === 'monthly' ? ' is-selected' : ''}`} aria-pressed={plan === 'monthly'} onClick={() => select('monthly')}><span><strong>Mensual</strong><small>Más flexibilidad.</small></span><b><del>US$6.99</del> US$4.99 <small>/ mes</small></b></button></div><p className="v3-billing"><strong>Hoy no pagas nada.</strong> Después de 7 días, se cobra el plan elegido y se renueva automáticamente hasta que canceles. El checkout de Hotmart mostrará las condiciones finales antes de confirmar.</p><div className="v3-legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link><Link href="/cancelacion">Cancelación</Link></div></div></section><div className="v3-plans-action"><button className="v3-cta" type="button" onClick={startCheckout} disabled={checkoutBusy} aria-busy={checkoutBusy}>{checkoutBusy ? 'Preparando tu checkout…' : <>Quiero empezar con NIA <span>· {plan === 'annual' ? 'anual' : 'mensual'}</span></>}</button>{checkoutError ? <p className="v3-checkout-error" role="alert">{checkoutError}</p> : null}</div></main>;
}
