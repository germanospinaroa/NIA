'use client';
import { DiscoverChoice, DiscoverStage } from '@/components/funnel/DiscoverStage';
import { useRouter } from 'next/navigation';
import { saveFunnelState, trackFunnel, type DiscoverFeedback } from '@/lib/funnel';
const options: Array<[DiscoverFeedback, string]> = [['serves', 'Sí, esto me sirve.'], ['different', 'Quiero otra forma de verlo.'], ['not_me', 'No, esto no me representa.']];
export default function FeedbackPage() { const router = useRouter(); return <DiscoverStage><h1>¿Esto te habría ayudado en ese momento?</h1><div className="option-list">{options.map(([value, label]) => <DiscoverChoice key={value} onClick={() => { saveFunnelState({ discoverFeedback: value }); trackFunnel('demo_feedback', { feedback: value }); router.push('/descubre/adaptacion'); }}>{label}</DiscoverChoice>)}</div></DiscoverStage>; }
