'use client';

import { useEffect } from 'react';
import { trackFunnel } from '@/lib/funnel';

export function ThankYouTracker({ status }: { status: 'approved' | 'pending' | 'analysis' }) {
  useEffect(() => { trackFunnel('thank_you_viewed', { status }); }, [status]);
  return null;
}
