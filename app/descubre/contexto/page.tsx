'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiscoverChoice, DiscoverStage } from '@/components/funnel/DiscoverStage';
import { saveFunnelState, trackFunnel, type DiscoverContext } from '@/lib/funnel';
const options: Array<[DiscoverContext, string]> = [['opinion', 'Cuando tengo claro lo que quiero, pero alguien me hace dudar.'], ['conversation', 'Cuando necesito decir lo que pienso y termino callándome.'], ['limit', 'Cuando necesito poner un límite y termino explicándome de más.']];
export default function ContextPage() { const router = useRouter(); useEffect(() => { trackFunnel('context_prompt_viewed'); }, []); return <DiscoverStage><h1>Para enseñártelo bien, dime dónde te gustaría probarlo primero.</h1><div className="option-list">{options.map(([value, label]) => <DiscoverChoice key={value} onClick={() => { saveFunnelState({ discoverContext: value }); trackFunnel('context_selected', { context: value }); router.push('/descubre/situacion'); }}>{label}</DiscoverChoice>)}</div></DiscoverStage>; }
