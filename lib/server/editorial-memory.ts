import type { SupabaseClient } from '@supabase/supabase-js';

export const editorialInterventionTypes = ['brief_insight', 'reflection', 'practical_guidance', 'tool', 'step_by_step', 'example', 'deep_dive'] as const;
export const editorialDepths = ['brief', 'medium', 'deep'] as const;
export const editorialStrategies = ['continue_topic', 'change_angle', 'refresh_topic', 'explore_adjacent'] as const;
export type EditorialInterventionType = typeof editorialInterventionTypes[number];
export type EditorialDepth = typeof editorialDepths[number];
export type EditorialStrategy = typeof editorialStrategies[number];
export type CommunicationPreference = 'idea' | 'practical' | 'structured' | 'adaptive';
export type EditorialBlockType = 'idea' | 'recognition' | 'explanation' | 'insight' | 'question' | 'tool' | 'step' | 'example' | 'action' | 'closing';
export type EditorialBlock = { type: EditorialBlockType; text: string };

export type EditorialHistoryItem = {
  id: string;
  created_at: string;
  topic: string | null;
  concept: string | null;
  angle: string | null;
  intervention_type: EditorialInterventionType | null;
  depth: EditorialDepth | null;
};
export type EditorialTopicSummary = { topic: string; count: number; last_seen: string; share: number; state: 'normal' | 'watch' | 'saturated' | 'refresh'; angles: Array<{ angle: string; count: number; last_seen: string }> };
export type EditorialMemory = {
  windowDays: number;
  recent: EditorialHistoryItem[];
  topics: EditorialTopicSummary[];
  formats: Record<EditorialInterventionType, number>;
  depths: Record<EditorialDepth, number>;
  totalWithTopic: number;
};

const emptyFormats = (): Record<EditorialInterventionType, number> => Object.fromEntries(editorialInterventionTypes.map(type => [type, 0])) as Record<EditorialInterventionType, number>;
const emptyDepths = (): Record<EditorialDepth, number> => ({ brief: 0, medium: 0, deep: 0 });

export function topicState(count: number, share: number, sameAngleCount: number): EditorialTopicSummary['state'] {
  if (count >= 4 && share >= 0.5 && sameAngleCount >= 2) return 'saturated';
  if (count >= 3 || (count >= 2 && share >= 0.35)) return 'watch';
  return 'normal';
}

export function buildEditorialMemory(rows: EditorialHistoryItem[], windowDays = 30, now = new Date()): EditorialMemory {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const recent = rows.filter(row => !row.created_at || new Date(row.created_at).getTime() >= cutoff).slice(0, 15);
  const formats = emptyFormats(); const depths = emptyDepths();
  const topicMap = new Map<string, EditorialHistoryItem[]>();
  for (const row of recent) {
    if (row.intervention_type) formats[row.intervention_type] += 1;
    if (row.depth) depths[row.depth] += 1;
    if (!row.topic?.trim()) continue;
    const topic = row.topic.trim();
    topicMap.set(topic, [...(topicMap.get(topic) ?? []), row]);
  }
  const totalWithTopic = [...topicMap.values()].reduce((sum, items) => sum + items.length, 0);
  const topics = [...topicMap.entries()].map(([topic, items]) => {
    const angleMap = new Map<string, EditorialHistoryItem[]>();
    items.forEach(item => { if (item.angle?.trim()) angleMap.set(item.angle, [...(angleMap.get(item.angle) ?? []), item]); });
    const angles = [...angleMap.entries()].map(([angle, angleItems]) => ({ angle, count: angleItems.length, last_seen: angleItems[0].created_at })).sort((a, b) => b.count - a.count);
    return { topic, count: items.length, last_seen: items[0].created_at, share: totalWithTopic ? items.length / totalWithTopic : 0, state: topicState(items.length, totalWithTopic ? items.length / totalWithTopic : 0, angles[0]?.count ?? 0), angles };
  }).sort((a, b) => b.count - a.count || b.last_seen.localeCompare(a.last_seen));
  return { windowDays, recent, topics, formats, depths, totalWithTopic };
}

export async function loadEditorialMemory(admin: SupabaseClient, userId: string, now = new Date(), windowDays = 30): Promise<EditorialMemory> {
  const { data, error } = await admin.from('interventions').select('id,created_at,topic,concept,angle,intervention_type,depth').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
  if (error) throw new Error('editorial_memory_unavailable');
  return buildEditorialMemory((data ?? []) as EditorialHistoryItem[], windowDays, now);
}
