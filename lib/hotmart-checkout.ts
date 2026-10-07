import type { FunnelPlan } from '@/lib/funnel';

export type NiaPlanConfig = {
  key: FunnelPlan;
  displayName: string;
  price: number;
  currency: 'USD';
  cadence: 'month' | 'year';
  trialDays: number;
  offerCode: string;
  url: string;
};

export const NIA_PLAN_CONFIG: Record<FunnelPlan, NiaPlanConfig> = {
  monthly: { key: 'monthly', displayName: 'NIA Mensual', price: 4.99, currency: 'USD', cadence: 'month', trialDays: 7, offerCode: 'r7w7emsp', url: 'https://pay.hotmart.com/O107843876X?off=r7w7emsp' },
  annual: { key: 'annual', displayName: 'NIA Anual', price: 49.99, currency: 'USD', cadence: 'year', trialDays: 7, offerCode: '3z4a0vad', url: 'https://pay.hotmart.com/O107843876X?off=3z4a0vad' },
};

export const HOTMART_CHECKOUTS = NIA_PLAN_CONFIG;

export function checkoutForPlan(plan: FunnelPlan) {
  return HOTMART_CHECKOUTS[plan];
}

export function planForHotmartOffer(offerCode: unknown): FunnelPlan | null {
  if (offerCode === NIA_PLAN_CONFIG.monthly.offerCode) return 'monthly';
  if (offerCode === NIA_PLAN_CONFIG.annual.offerCode) return 'annual';
  return null;
}

export function planConfig(planKey: unknown) {
  return planKey === 'monthly' || planKey === 'annual' ? NIA_PLAN_CONFIG[planKey] : null;
}
