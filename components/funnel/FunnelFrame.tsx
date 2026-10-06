'use client';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
export function FunnelFrame({ children, back = true, className = '' }: { children: ReactNode; step?: string; back?: boolean; className?: string }) {
  return <main className={`funnel-shell nia-continuity-frame ${className}`.trim()}><header className="funnel-header"><a href="/descubre" className="nia-mark"><span />NIA</a><div className="flex items-center gap-4">{back && <a href="/descubre" className="funnel-back" aria-label="Volver"><ArrowLeft size={17} /></a>}</div></header>{children}</main>;
}
