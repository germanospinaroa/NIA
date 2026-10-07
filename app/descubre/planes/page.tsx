/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
import { addressName } from '@/lib/funnel-personalization';
import { checkoutMode, readFunnelState, saveFunnelState, trackFunnel, type FunnelPlan } from '@/lib/funnel';
export default function PlansPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<FunnelPlan>('annual');
  const [preferredName, setPreferredName] = useState('');
  useEffect(() => { const state = readFunnelState(); if (state.plan) setPlan(state.plan); setPreferredName(addressName(state.preferredName)); trackFunnel('pricing_viewed'); trackFunnel('plan_viewed'); trackFunnel('plans_viewed'); }, []);
  function select(value: FunnelPlan) { setPlan(value); saveFunnelState({ plan: value }); trackFunnel('plan_selected', { plan: value }); }
  return <FunnelFrame><section className="funnel-screen plans-screen"><div className="funnel-content narrow"><h1>{preferredName ? <><span className="plans-name">{preferredName},</span><span className="plans-headline">si esto se parece a lo que quieres cambiar, NIA puede empezar a trabajarlo contigo.</span></> : 'Si esto se parece a lo que quieres cambiar, NIA puede empezar a trabajarlo contigo.'}</h1><p className="funnel-copy">Durante 7 días puedes vivir la experiencia completa y ver cómo se siente tener a NIA trabajando contigo cada día.</p><p className="trial-line">Tus primeros 7 días son gratis.</p><p className="plans-after-trial">Después eliges cómo quieres continuar.</p><div className="plans-grid"><button type="button" onClick={() => select('annual')} aria-pressed={plan === 'annual'} className={'plan-card plan-card-annual ' + (plan === 'annual' ? 'selected' : '')}><span className="plan-top"><span><strong>Anual</strong><small>La opción para quedarte con NIA</small></span><span className="plan-check">{plan === 'annual' && <Check size={14} />}</span></span><span className="plan-badge">Mejor opción</span><span className="plan-price">US$39.99<small>/ año</small></span><span className="plan-detail">7 días gratis. Después, US$39.99 al año.</span></button><button type="button" onClick={() => select('monthly')} aria-pressed={plan === 'monthly'} className={'plan-card ' + (plan === 'monthly' ? 'selected' : '')}><span className="plan-top"><span><strong>Mensual</strong><small>Más flexibilidad</small></span><span className="plan-check">{plan === 'monthly' && <Check size={14} />}</span></span><span className="plan-price">US$6.99<small>/ mes</small></span><span className="plan-detail">7 días gratis. Después, US$6.99 al mes.</span></button></div><p className="billing-note">No se te cobrará nada durante los primeros 7 días. Puedes cancelar antes de que termine la prueba.</p><button className="funnel-button full" onClick={() => { saveFunnelState({ plan }); trackFunnel('checkout_bypass_started', { plan, checkoutMode }); router.push('/acceso'); }}>Empezar mis 7 días con NIA →</button></div></section></FunnelFrame>;
}
