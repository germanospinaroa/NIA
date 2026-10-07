import type { FunnelPlan } from '@/lib/funnel';

export const HOTMART_CHECKOUTS: Record<FunnelPlan, { url: string; offerCode: string; currentPrice: number }> = {
  monthly: { url: 'https://pay.hotmart.com/O107843876X?off=r7w7emsp', offerCode: 'r7w7emsp', currentPrice: 4.99 },
  annual: { url: 'https://pay.hotmart.com/O107843876X?off=3z4a0vad', offerCode: '3z4a0vad', currentPrice: 49.99 },
};

export function checkoutForPlan(plan: FunnelPlan) {
  return HOTMART_CHECKOUTS[plan];
}

export function planForHotmartOffer(offerCode: unknown): FunnelPlan | null {
  if (offerCode === HOTMART_CHECKOUTS.monthly.offerCode) return 'monthly';
  if (offerCode === HOTMART_CHECKOUTS.annual.offerCode) return 'annual';
  return null;
}
