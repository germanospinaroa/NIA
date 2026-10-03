import { editorialInterventionTypes, type CommunicationPreference, type EditorialDepth, type EditorialInterventionType, type EditorialMemory, type EditorialStrategy } from './editorial-memory.ts';

export type EditorialPlan = {
  strategy: EditorialStrategy;
  recommended_topic: string;
  topic_reason: string;
  preferred_or_recommended_intervention_type: EditorialInterventionType;
  recommended_depth: EditorialDepth;
  recent_topics_to_avoid: string[];
  recent_angles_to_avoid: string[];
  recent_concepts_to_avoid: string[];
  diversity_notes: string;
};

type PlannerInput = { desiredChange: string; currentContext: string; communicationPreference?: CommunicationPreference | null; memory: EditorialMemory; relevantTopics?: string[] };
const validPreferences = new Set<CommunicationPreference>(['idea', 'practical', 'structured', 'adaptive']);

function preferredType(preference: CommunicationPreference, memory: EditorialMemory): EditorialInterventionType {
  const recent = memory.recent.slice(0, 4).map(item => item.intervention_type).filter(Boolean);
  const underused = editorialInterventionTypes.find(type => !recent.includes(type)) ?? 'brief_insight';
  if (preference === 'structured' && recent.filter(type => type === 'step_by_step').length < 3) return 'step_by_step';
  if (preference === 'practical' && !recent.includes('tool')) return 'tool';
  if (preference === 'idea' && !recent.includes('brief_insight')) return 'brief_insight';
  return preference === 'adaptive' ? underused : preference === 'practical' ? 'practical_guidance' : preference === 'idea' ? 'reflection' : underused;
}

export function planEditorial(input: PlannerInput): EditorialPlan {
  const preference = validPreferences.has(input.communicationPreference ?? 'adaptive') ? input.communicationPreference ?? 'adaptive' : 'adaptive';
  const dominant = input.memory.topics[0];
  const candidates = [...new Set((input.relevantTopics ?? []).map(value => value.trim()).filter(Boolean))];
  const alternative = candidates.find(topic => topic.toLowerCase() !== dominant?.topic.toLowerCase() && !input.memory.topics.some(item => item.topic.toLowerCase() === topic.toLowerCase() && item.state === 'saturated'));
  const saturated = dominant?.state === 'saturated';
  const strategy: EditorialStrategy = saturated && alternative ? 'refresh_topic' : saturated ? 'change_angle' : dominant && dominant.count >= 2 ? 'change_angle' : 'continue_topic';
  const topic = strategy === 'refresh_topic' && alternative ? alternative : dominant?.topic ?? input.desiredChange;
  const type = preferredType(preference, input.memory);
  const recentTypeCount = input.memory.recent.slice(0, 4).filter(item => item.intervention_type === type).length;
  const finalType = recentTypeCount >= 3 ? (editorialInterventionTypes.find(item => item !== type && !input.memory.recent.slice(0, 4).some(row => row.intervention_type === item)) ?? 'reflection') : type;
  const depth: EditorialDepth = strategy === 'refresh_topic' ? 'medium' : input.memory.depths.deep === 0 && type === 'deep_dive' ? 'deep' : recentTypeCount >= 2 ? 'brief' : 'medium';
  return {
    strategy,
    recommended_topic: topic,
    topic_reason: strategy === 'refresh_topic' ? 'topic saturated in recent history; relevant alternative selected' : strategy === 'change_angle' ? 'recent topic remains relevant but needs a substantially different angle' : 'current intention and context remain the most relevant direction',
    preferred_or_recommended_intervention_type: finalType,
    recommended_depth: depth,
    recent_topics_to_avoid: saturated ? [dominant.topic] : [],
    recent_angles_to_avoid: (dominant?.angles ?? []).slice(0, 3).map(item => item.angle),
    recent_concepts_to_avoid: input.memory.recent.slice(0, 4).map(item => item.concept).filter((value): value is string => Boolean(value)),
    diversity_notes: `Preferencia ${preference}; formatos recientes: ${Object.entries(input.memory.formats).filter(([, count]) => count > 0).map(([key, count]) => `${key}:${count}`).join(', ') || 'sin metadata histórica'}.`,
  };
}
