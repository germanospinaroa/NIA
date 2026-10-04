import type { SupabaseClient } from '@supabase/supabase-js';

export const editorialInterventionTypes = ['brief_insight', 'reflection', 'practical_guidance', 'tool', 'step_by_step', 'example', 'deep_dive'] as const;
export const editorialExperienceTypes = ['brief_insight', 'reflection', 'encouragement', 'perspective_shift', 'practical_tool', 'exercise', 'challenge', 'question', 'check_in', 'validation', 'direct_push', 'concrete_example', 'story_or_scenario', 'feedback_request'] as const;
export const editorialDepths = ['brief', 'medium', 'deep'] as const;
export const editorialStrategies = ['continue_topic', 'change_angle', 'refresh_topic', 'explore_adjacent'] as const;
export type EditorialInterventionType = typeof editorialInterventionTypes[number];
export type EditorialExperienceType = typeof editorialExperienceTypes[number];
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
  editorial_take?: string | null;
  editorial_idea?: string | null;
  experience_type?: EditorialExperienceType | null;
  territory_key?: string | null;
  exercise_present?: boolean | null;
  question_present?: boolean | null;
  feedback_requested?: boolean | null;
  situation?: string | null;
  intention?: string | null;
  editorial_type?: string | null;
  insight_id?: string | null;
  functional_emotion?: string | null;
  directiveness?: string | null;
  closing_type?: string | null;
  action_id?: string | null;
  saturation_state?: string | null;
  slot?: string | null;
  local_date?: string | null;
  structure?: string | null;
};
export type EditorialRhythm = {
  last3: EditorialHistoryItem[];
  last5: EditorialHistoryItem[];
  last7Days: EditorialHistoryItem[];
  last7To10: EditorialHistoryItem[];
  experienceCounts: Record<EditorialExperienceType, number>;
  interventionTypeCounts: Record<string, number>;
  depthCounts: Record<EditorialDepth, number>;
  topicCounts: Record<string, number>;
  takeCounts: Record<string, number>;
  ideaCounts: Record<string, number>;
  recentIdeas: string[];
  dominantExperience: EditorialExperienceType | null;
  experienceConcentration: number;
  repeatedTake: string | null;
  repeatedTerritory: string | null;
  repeatedIdea: string | null;
  functionalEmotionCounts: Record<string, number>;
  directivenessCounts: Record<string, number>;
  closingCounts: Record<string, number>;
  actionCounts: Record<string, number>;
  territoryCounts: Record<string, number>;
};
export type EditorialTopicSummary = { topic: string; count: number; last_seen: string; share: number; state: 'normal' | 'watch' | 'saturated' | 'refresh'; angles: Array<{ angle: string; count: number; last_seen: string }> };
export type EditorialMemory = {
  windowDays: number;
  recent: EditorialHistoryItem[];
  topics: EditorialTopicSummary[];
  formats: Record<EditorialInterventionType, number>;
  depths: Record<EditorialDepth, number>;
  totalWithTopic: number;
  rhythm: EditorialRhythm;
  pausedTerritories: string[];
  recentSignatures: Array<Pick<EditorialHistoryItem, 'topic' | 'situation' | 'intention' | 'editorial_type' | 'insight_id' | 'editorial_take' | 'angle' | 'experience_type' | 'functional_emotion' | 'directiveness' | 'closing_type' | 'action_id' | 'territory_key' | 'structure' | 'depth'>>;
};

const emptyFormats = (): Record<EditorialInterventionType, number> => Object.fromEntries(editorialInterventionTypes.map(type => [type, 0])) as Record<EditorialInterventionType, number>;
const emptyDepths = (): Record<EditorialDepth, number> => ({ brief: 0, medium: 0, deep: 0 });
const emptyExperiences = (): Record<EditorialExperienceType, number> => Object.fromEntries(editorialExperienceTypes.map(type => [type, 0])) as Record<EditorialExperienceType, number>;

function experienceFor(row: EditorialHistoryItem): EditorialExperienceType | null {
  if (row.experience_type && editorialExperienceTypes.includes(row.experience_type)) return row.experience_type;
  if (row.intervention_type === 'tool' || row.intervention_type === 'practical_guidance') return 'practical_tool';
  if (row.intervention_type === 'step_by_step') return 'exercise';
  if (row.intervention_type === 'example') return 'concrete_example';
  if (row.intervention_type === 'brief_insight') return 'brief_insight';
  if (row.intervention_type === 'reflection') return 'reflection';
  return null;
}

export function buildEditorialRhythm(rows: EditorialHistoryItem[], now = new Date()): EditorialRhythm {
  const last3 = rows.slice(0, 3);
  const last5 = rows.slice(0, 5);
  const last7Days = rows.filter(row => !row.created_at || now.getTime() - new Date(row.created_at).getTime() <= 7 * 86400000);
  const last7To10 = rows.slice(0, 10);
  const experienceCounts = emptyExperiences();
  const interventionTypeCounts: Record<string, number> = {};
  const depthCounts = emptyDepths();
  const topicCounts: Record<string, number> = {};
  const takeCounts: Record<string, number> = {};
  const ideaCounts: Record<string, number> = {};
  const territoryCounts: Record<string, number> = {};
  const functionalEmotionCounts: Record<string, number> = {};
  const directivenessCounts: Record<string, number> = {};
  const closingCounts: Record<string, number> = {};
  const actionCounts: Record<string, number> = {};
  for (const row of last7To10) {
    const experience = experienceFor(row); if (experience) experienceCounts[experience] += 1;
    if (row.intervention_type) interventionTypeCounts[row.intervention_type] = (interventionTypeCounts[row.intervention_type] ?? 0) + 1;
    if (row.depth) depthCounts[row.depth] += 1;
    if (row.topic) topicCounts[row.topic] = (topicCounts[row.topic] ?? 0) + 1;
    if (row.editorial_take) takeCounts[row.editorial_take] = (takeCounts[row.editorial_take] ?? 0) + 1;
    if (row.editorial_idea) ideaCounts[row.editorial_idea] = (ideaCounts[row.editorial_idea] ?? 0) + 1;
    if (row.territory_key) territoryCounts[row.territory_key] = (territoryCounts[row.territory_key] ?? 0) + 1;
    if (row.functional_emotion) functionalEmotionCounts[row.functional_emotion] = (functionalEmotionCounts[row.functional_emotion] ?? 0) + 1;
    if (row.directiveness) directivenessCounts[row.directiveness] = (directivenessCounts[row.directiveness] ?? 0) + 1;
    if (row.closing_type) closingCounts[row.closing_type] = (closingCounts[row.closing_type] ?? 0) + 1;
    if (row.action_id) actionCounts[row.action_id] = (actionCounts[row.action_id] ?? 0) + 1;
  }
  const ranked = Object.entries(experienceCounts).sort((a, b) => b[1] - a[1]);
  const total = last7To10.length;
  const repeated = (counts: Record<string, number>) => Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[1] >= 2 ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : null;
  return { last3, last5, last7Days, last7To10, experienceCounts, interventionTypeCounts, depthCounts, topicCounts, takeCounts, ideaCounts, recentIdeas: last7To10.map(row => row.editorial_idea).filter((value): value is string => Boolean(value)), dominantExperience: ranked[0]?.[1] ? ranked[0][0] as EditorialExperienceType : null, experienceConcentration: total ? (ranked[0]?.[1] ?? 0) / total : 0, repeatedTake: repeated(takeCounts), repeatedTerritory: repeated(territoryCounts), repeatedIdea: repeated(ideaCounts), functionalEmotionCounts, directivenessCounts, closingCounts, actionCounts, territoryCounts };
}

export function topicState(count: number, share: number, sameAngleCount: number): EditorialTopicSummary['state'] {
  if (count >= 3 && share >= 0.5 && sameAngleCount >= 2) return 'saturated';
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
  const rhythm = buildEditorialRhythm(recent, now);
  const pausedTerritories = Object.entries(rhythm.territoryCounts).filter(([territory, count]) => {
    const territoryRows = recent.filter(row => row.territory_key === territory);
    const situations = new Set(territoryRows.map(row => row.situation).filter(Boolean));
    return count >= 3 && situations.size <= 1;
  }).map(([territory]) => territory);
  return { windowDays, recent, topics, formats, depths, totalWithTopic, rhythm, pausedTerritories, recentSignatures: recent.map(row => ({ topic: row.topic, situation: row.situation, intention: row.intention, editorial_type: row.editorial_type, insight_id: row.insight_id, editorial_take: row.editorial_take, angle: row.angle, experience_type: row.experience_type, functional_emotion: row.functional_emotion, directiveness: row.directiveness, closing_type: row.closing_type, action_id: row.action_id, territory_key: row.territory_key, structure: (row as EditorialHistoryItem & { structure?: string | null }).structure, depth: row.depth })) };
}

export async function loadEditorialMemory(admin: SupabaseClient, userId: string, now = new Date(), windowDays = 30): Promise<EditorialMemory> {
  const { data, error } = await admin.from('interventions').select('id,created_at,topic,concept,angle,structure,intervention_type,depth,editorial_take,editorial_idea,experience_type,territory_key,exercise_present,question_present,feedback_requested,situation,intention,editorial_type,insight_id,functional_emotion,directiveness,closing_type,action_id,saturation_state,slot,local_date').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
  if (error) throw new Error('editorial_memory_unavailable');
  return buildEditorialMemory((data ?? []) as EditorialHistoryItem[], windowDays, now);
}
