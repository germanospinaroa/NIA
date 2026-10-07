/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { readFunnelState, saveFunnelState, trackFunnel, type FunnelPlan } from '@/lib/funnel';
import { checkoutForPlan } from '@/lib/hotmart-checkout';
export default function PaywallPage() {
  const [plan, setPlan] = useState<FunnelPlan>('monthly');
  useEffect(() => { const state = readFunnelState(); if (state.plan) setPlan(state.plan); trackFunnel('pricing_viewed'); }, []);
  function choose(value: FunnelPlan) { setPlan(value); saveFunnelState({ plan: value }); trackFunnel('plan_selected', { plan: value }); }
  return <FunnelFrame step="ELEGIR PLAN"><section className="funnel-screen plans-screen"><div className="funnel-content narrow"><p className="eyebrow">CONTINUAR</p><h1>Esto es solo el comienzo.</h1><p className="funnel-copy">Con NIA, puedes seguir trabajando sobre esas direcciones en los momentos en que más las necesitas.</p><p className="trial-line">Prueba NIA durante 7 días gratis.</p><div className="plans-grid">{([['annual', 'Anual', 'US$49.99', '/ año', 'Parte de tu proceso'], ['monthly', 'Mensual', 'US$4.99', '/ mes', 'Más flexibilidad']] as const).map(([value, name, price, period, note]) => <button type="button" key={value} onClick={() => choose(value)} aria-pressed={plan === value} className={'plan-card ' + (plan === value ? 'selected' : '')}><span className="plan-top"><span><strong>{name}</strong><small>{note}</small></span><span className="plan-check">{plan === value && <Check size={14} />}</span></span><span className="plan-price">{price}<small>{period}</small></span><span className="plan-detail">7 días gratis · Después se cobra {price}{period}.<br />Cancela cuando quieras.</span></button>)}</div><p className="billing-note">El cobro comienza al terminar los 7 días gratis. Verás claramente el plan elegido antes de continuar.</p><button className="funnel-button full" onClick={() => { saveFunnelState({ plan }); const checkout = checkoutForPlan(plan); trackFunnel('checkout_started', { plan, price: checkout.currentPrice, provider: 'hotmart' }); window.location.assign(checkout.url); }}>Probar 7 días gratis</button></div></section></FunnelFrame>;
}
