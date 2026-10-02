/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { checkoutMode, readFunnelState, saveFunnelState, trackFunnel, type FunnelPlan } from '@/lib/funnel';
export default function PlansPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<FunnelPlan>('annual');
  useEffect(() => { const state = readFunnelState(); if (state.plan) setPlan(state.plan); trackFunnel('pricing_viewed'); trackFunnel('plan_viewed'); }, []);
  function select(value: FunnelPlan) { setPlan(value); saveFunnelState({ plan: value }); trackFunnel('plan_selected', { plan: value }); }
  return <FunnelFrame><section className="funnel-screen plans-screen"><div className="funnel-content narrow"><h1>Si quieres seguir, ahora puedes tener NIA contigo.</h1><p className="funnel-copy">Empieza a construir una experiencia que vaya entendiendo qué te sirve a ti.</p><p className="trial-line">7 días gratis. Después, cancelas cuando quieras.</p><div className="plans-grid">{([['annual', 'Anual', 'US$39.99', '/ año', 'Ahorra frente al mensual'], ['monthly', 'Mensual', 'US$6.99', '/ mes', 'Flexibilidad mes a mes']] as const).map(([value, name, price, period, note]) => <button type="button" key={value} onClick={() => select(value)} aria-pressed={plan === value} className={'plan-card ' + (plan === value ? 'selected' : '')}><span className="plan-top"><span><strong>{name}</strong><small>{note}</small></span><span className="plan-check">{plan === value && <Check size={14} />}</span></span><span className="plan-price">{price}<small>{period}</small></span><span className="plan-detail">7 días gratis · Después se cobra {price}{period}.<br />Cancela cuando quieras.</span></button>)}</div><p className="billing-note">El cobro comienza al terminar los 7 días gratis. Verás claramente el plan elegido antes de continuar.</p><button className="funnel-button full" onClick={() => { saveFunnelState({ plan }); trackFunnel('checkout_bypass_started', { plan, checkoutMode }); router.push('/acceso'); }}>Probar 7 días gratis</button></div></section></FunnelFrame>;
}
