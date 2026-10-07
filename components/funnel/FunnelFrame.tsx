'use client';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { resetFunnelState } from '@/lib/funnel';
export function FunnelFrame({ children, back = true, className = '' }: { children: ReactNode; step?: string; back?: boolean; className?: string }) {
  return <main className={`funnel-shell nia-continuity-frame ${className}`.trim()}><header className="funnel-header"><Link href="/" onClick={resetFunnelState} className="nia-mark" aria-label="NIA inicio"><span />NIA</Link><div className="flex items-center gap-4">{back && <Link href="/descubre" className="funnel-back" aria-label="Volver"><ArrowLeft size={17} /></Link>}</div></header>{children}</main>;
}
