'use client';
import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { resetDiscoverProgress } from '@/lib/funnel';
import { captureMarketingAttribution } from '@/lib/marketing-attribution';
import { AcquisitionAnalytics } from '@/components/analytics/AcquisitionAnalytics';
export function FunnelFrame({ children, back = true, className = '' }: { children: ReactNode; step?: string; back?: boolean; className?: string }) {
  useEffect(() => { captureMarketingAttribution(); }, []);
  return <main className={`funnel-shell nia-continuity-frame ${className}`.trim()}><AcquisitionAnalytics /><header className="funnel-header"><Link href="/" onClick={resetDiscoverProgress} className="nia-mark" aria-label="NIA inicio"><span />NIA</Link><div className="flex items-center gap-4">{back && <Link href="/descubre" className="funnel-back" aria-label="Volver"><ArrowLeft size={17} /></Link>}</div></header>{children}</main>;
}
