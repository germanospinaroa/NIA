'use client';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
export function DiscoverStage({ children, className = '' }: { children: ReactNode; className?: string }) {
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, []);
  return <FunnelFrame><section className={`funnel-screen narrative-screen ${className}`}><div className="funnel-content narrow discover-stage">{children}</div></section></FunnelFrame>;
}
export function DiscoverChoice({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="option-button" onClick={onClick}>{children}<ArrowRight size={16} /></button>; }
