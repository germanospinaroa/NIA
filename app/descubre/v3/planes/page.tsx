'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
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
  return <main className="v3-funnel v3-plans"><header className="v3-header"><Link href="/" className="v3-mark"><span />NIA</Link><Link className="v3-back" href="/descubre/v3">Volver</Link></header><section className="v3-plans-screen"><div className="v3-content"><h1>La próxima vez que empieces a darle mil vueltas, prueba hacer algo diferente.</h1><p className="v3-intro">Vive NIA durante 7 días gratis con el servicio real por WhatsApp.</p><p className="v3-intro">Recibirás tu acompañamiento diario en el horario que elijas y conectado con lo que estás trabajando.</p><p className="v3-plan-emphasis">Hoy no pagas nada.</p><div className="v3-plan-list"><button type="button" className={`v3-plan${plan === 'monthly' ? ' is-selected' : ''}`} aria-pressed={plan === 'monthly'} onClick={() => select('monthly')}><span><strong>Mensual</strong><small>7 días gratis.<br />Después, US$4.99 al mes.</small></span><b><del>US$6.99</del> US$4.99 <small>/ mes</small></b></button><button type="button" className={`v3-plan${plan === 'annual' ? ' is-selected' : ''}`} aria-pressed={plan === 'annual'} onClick={() => select('annual')}><span><strong>Anual</strong><small>7 días gratis.<br />Después, US$49.99 al año.</small></span><b>US$49.99 <small>/ año</small></b></button></div><p className="v3-closing">Pruébalo con tus situaciones reales.<br /><br />Si decides que NIA no es para ti, puedes cancelar antes de que termine tu prueba gratuita.<br /><br />La suscripción se renueva automáticamente según el plan elegido hasta que decidas cancelarla.</p><div className="v3-legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link><Link href="/cancelacion">Cancelación</Link></div></div></section><div className="v3-plans-action"><button className="v3-cta" type="button" onClick={startCheckout} disabled={checkoutBusy} aria-busy={checkoutBusy}>{checkoutBusy ? 'Preparando tu checkout…' : <>Quiero empezar mis 7 días con NIA <span>· {name || (plan === 'annual' ? 'anual' : 'mensual')}</span></>}</button>{checkoutError ? <p className="v3-checkout-error" role="alert">{checkoutError}</p> : null}</div></main>;
}
