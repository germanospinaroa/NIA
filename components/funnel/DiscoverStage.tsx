'use client';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { FunnelFrame } from '@/components/funnel/FunnelFrame';
export function DiscoverStage({ children, className = '' }: { children: ReactNode; className?: string }) { return <FunnelFrame><section className={`funnel-screen narrative-screen ${className}`}><div className="funnel-content narrow discover-stage">{children}</div></section></FunnelFrame>; }
export function DiscoverChoice({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="option-button" onClick={onClick}>{children}<ArrowRight size={16} /></button>; }
