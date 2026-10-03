const CLOSINGS = {
  morning: [
    'Que tengas un buen día.',
    'Pruébalo hoy y luego me cuentas.',
    'Quédate con esto hoy.',
    'Nos leemos mañana.',
    'A ver qué descubres hoy.',
  ],
  afternoon: [
    'Que tengas una buena tarde.',
    'Pruébalo cuando tengas oportunidad.',
    'Quédate con esto por hoy.',
    'Luego me cuentas cómo te fue.',
  ],
  night: [
    'Que descanses.',
    'Quédate pensando en esto esta noche.',
    'Descansa. Mañana seguimos.',
    'Nos leemos mañana.',
    'Por hoy, quédate con esto.',
  ],
} as const;

export type MessageTimeOfDay = keyof typeof CLOSINGS;

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

function localHour(now: Date, timezone: string | null | undefined) {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', { timeZone: timezone || 'UTC', hour: '2-digit', hourCycle: 'h23' }).format(now);
    return Number.parseInt(formatted, 10);
  } catch {
    return Number.parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: '2-digit', hourCycle: 'h23' }).format(now), 10);
  }
}

export function timeOfDay(now = new Date(), timezone?: string | null): MessageTimeOfDay {
  const hour = localHour(now, timezone);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'afternoon';
  return 'night';
}

export function greetingFor(firstName: string | null | undefined, now = new Date(), timezone?: string | null, userKey = '') {
  const period = timeOfDay(now, timezone);
  const label = period === 'morning' ? 'Buenos días' : period === 'afternoon' ? 'Buenas tardes' : 'Buenas noches';
  const name = typeof firstName === 'string' ? firstName.trim() : '';
  if (!name) return `${label}.`;
  return hash(`${userKey}:${now.toISOString().slice(0, 10)}`) % 2 === 0 ? `Hola, ${name}. ${label}.` : `${label}, ${name}.`;
}

function isActionable(content: string) {
  return /\b(prueba|pruébalo|anota|escribe|respira|revisa|di:|hoy|la próxima vez|cuando lo pruebes)\b/i.test(content);
}

function closingFrom(content: string) {
  const closing = Object.values(CLOSINGS).flat().find(value => content.trimEnd().endsWith(value));
  return closing ?? null;
}

export function closingFor(content: string, now = new Date(), timezone?: string | null, userKey = '', recentClosings: string[] = []) {
  const period = timeOfDay(now, timezone);
  const options = CLOSINGS[period].filter(value => !recentClosings.includes(value));
  const pool = options.length ? options : CLOSINGS[period];
  const offset = isActionable(content) ? 1 : 0;
  return pool[(hash(`${userKey}:${now.toISOString().slice(0, 10)}`) + offset) % pool.length];
}

export function recentClosings(contents: string[]) {
  return contents.map(closingFrom).filter((value): value is NonNullable<typeof value> => value !== null);
}

export function composeNiaMessage(input: { content: string; firstName?: string | null; timezone?: string | null; userKey?: string; now?: Date; recentContents?: string[] }) {
  const now = input.now ?? new Date();
  const greeting = greetingFor(input.firstName, now, input.timezone, input.userKey);
  const closing = closingFor(input.content, now, input.timezone, input.userKey, recentClosings(input.recentContents ?? []));
  return `${greeting}\n\n${input.content.trim()}\n\n${closing}`;
}
