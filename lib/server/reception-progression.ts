export type ReceptionStage = 'welcome' | 'tuning' | 'building' | 'established';
export type ReceptionTimeOfDay = 'morning' | 'afternoon' | 'evening';
export type ReceptionSnapshot = { stage: ReceptionStage; welcomeDelivered: boolean; psychologicalInterventionsDelivered: number; timeOfDay: ReceptionTimeOfDay; receptionInstructions: string[] };

export const WELCOME_INTERACTION_TYPE = 'nia_welcome' as const;

export async function getReceptionSnapshot(supabase: import('@supabase/supabase-js').SupabaseClient, userId: string, channel: 'web' | 'whatsapp', now = new Date(), timezone?: string | null) {
  const { data: welcome } = await supabase.from('interactions').select('id').eq('user_id', userId).eq('interaction_type', WELCOME_INTERACTION_TYPE).limit(1).maybeSingle();
  let welcomeDelivered = Boolean(welcome);
  if (channel === 'whatsapp' && welcome?.id) {
    const { data: delivery } = await supabase.from('whatsapp_daily_deliveries').select('id').eq('user_id', userId).eq('interaction_id', welcome.id).eq('status', 'sent').limit(1).maybeSingle();
    welcomeDelivered = Boolean(delivery);
  }
  const { data: interactions } = await supabase.from('interactions').select('id').eq('user_id', userId).in('interaction_type', ['daily_message', 'nia_point']);
  const ids = (interactions ?? []).map(row => row.id).filter(Boolean);
  let deliveredCount = 0;
  if (ids.length) {
    if (channel === 'web') deliveredCount = ids.length;
    else {
      const { data: deliveries } = await supabase.from('whatsapp_daily_deliveries').select('interaction_id,slot').eq('user_id', userId).eq('status', 'sent').in('interaction_id', ids);
      deliveredCount = (deliveries ?? []).filter(row => !String(row.slot ?? '').startsWith('qa:')).length;
    }
  }
  const stage = calculateReceptionStage({ welcomeDelivered, psychologicalInterventionsDelivered: deliveredCount });
  return { stage, welcomeDelivered, psychologicalInterventionsDelivered: deliveredCount, timeOfDay: receptionTimeOfDay(now, timezone), receptionInstructions: receptionInstructions(stage) };
}

export function calculateReceptionStage(input: { welcomeDelivered: boolean; psychologicalInterventionsDelivered: number }): ReceptionStage {
  // Welcome is activation, not psychological progress. Psychological
  // reception starts at tuning even when activation transport is pending.
  void input.welcomeDelivered;
  if (input.psychologicalInterventionsDelivered < 2) return 'tuning';
  if (input.psychologicalInterventionsDelivered < 5) return 'building';
  return 'established';
}

export function shouldGeneratePsychologicalIntervention(stage: ReceptionStage) {
  // There is no special first-intervention path. Every psychological item
  // uses the same planner, buffer and delivery lifecycle.
  void stage;
  return true;
}

export function receptionTimeOfDay(now = new Date(), timezone?: string | null): ReceptionTimeOfDay {
  let hour: number;
  try {
    hour = Number.parseInt(new Intl.DateTimeFormat('en-US', { timeZone: timezone || 'UTC', hour: '2-digit', hourCycle: 'h23' }).format(now), 10);
  } catch {
    hour = Number.parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: '2-digit', hourCycle: 'h23' }).format(now), 10);
  }
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'afternoon';
  return 'evening';
}

export function receptionInstructions(stage: ReceptionStage): string[] {
  if (stage === 'tuning') return ['Entra suavemente desde el contexto confirmado.', 'Mantén una idea central y evita confrontación fuerte.', 'Una distinción o aplicación ligera puede ser suficiente.'];
  if (stage === 'building') return ['Puedes desarrollar la distinción y explicar por qué importa.', 'Introduce una herramienta o aplicación concreta cuando el movimiento lo requiera.', 'Conserva una entrada contextual natural.'];
  if (stage === 'established') return ['Usa la profundidad que el movimiento necesite.', 'Puedes conectar aprendizajes anteriores si existe evidencia.', 'No añadas intensidad, longitud ni confrontación sin fundamento.'];
  return ['La bienvenida es determinista; no generes una intervención psicológica.'];
}

export function welcomeDeliveryNeeded(input: { exists: boolean; delivered: boolean }) {
  return !input.exists || !input.delivered;
}

export function buildWelcomeMessage(firstName: string | null | undefined, now = new Date(), timezone?: string | null) {
  const period = receptionTimeOfDay(now, timezone);
  const label = period === 'morning' ? 'Buenos días' : period === 'afternoon' ? 'Buenas tardes' : 'Buenas noches';
  const name = typeof firstName === 'string' && firstName.trim() ? `, ${firstName.trim()}` : '';
  return `${label}${name}. Soy NIA.\n\nA partir de hoy vas a recibir mensajes construidos a partir de lo que me contaste que quieres cambiar y de las situaciones en las que te cuesta actuar como quieres.\n\nNo tienes que responderme. Algunos días recibirás una idea, otros una pregunta, una distinción o algo concreto para probar.\n\nNo busco decirte qué hacer. Voy a ayudarte a mirar esas situaciones con más claridad y a encontrar formas de actuar más como quieres.\n\nVamos paso a paso.`;
}
