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

export type FinalNiaMessageEvaluation = {
  approved: boolean;
  hardFailures: string[];
  namePresent: boolean;
  greetingValid: boolean;
  repeatedName: boolean;
  paragraphCount: number;
  charCount: number;
  newlineCount: number;
};

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

/** Classifies the configured local delivery hour, rather than the refill hour. */
export function timeOfDayForLocalTime(value: string | null | undefined): MessageTimeOfDay {
  const hour = Number.parseInt(String(value ?? '').split(':')[0] ?? '', 10);
  if (!Number.isInteger(hour)) return 'night';
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'afternoon';
  return 'night';
}

export function greetingFor(firstName: string | null | undefined, now = new Date(), timezone?: string | null) {
  const period = timeOfDay(now, timezone);
  const label = period === 'morning' ? 'Buenos días' : period === 'afternoon' ? 'Buenas tardes' : 'Buenas noches';
  const name = typeof firstName === 'string' ? firstName.trim() : '';
  if (!name) return `${label}.`;
  return `${label}, ${name}.`;
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

export function composeNiaMessage(input: { content: string; firstName?: string | null; timezone?: string | null; userKey?: string; now?: Date; recentContents?: string[]; closing?: string | null }) {
  const now = input.now ?? new Date();
  const greeting = greetingFor(input.firstName, now, input.timezone);
  const closing = input.closing?.trim() || null;
  return closing ? `${greeting}\n\n${input.content.trim()}\n\n${closing}` : `${greeting}\n\n${input.content.trim()}`;
}

function normalizedTokens(value: string) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(Boolean);
}

function containsName(value: string, name: string) {
  const messageTokens = normalizedTokens(value);
  const nameTokens = normalizedTokens(name);
  return nameTokens.length > 0 && messageTokens.some((_, index) => nameTokens.every((token, offset) => messageTokens[index + offset] === token));
}

/** Final, cheap gate for the exact text that can be persisted and delivered. */
export function evaluateFinalNiaMessage(message: string, input: { firstName?: string | null }) : FinalNiaMessageEvaluation {
  const value = message.trim();
  const name = typeof input.firstName === 'string' ? input.firstName.trim() : '';
  const paragraphs = value.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
  const firstParagraph = paragraphs[0] ?? '';
  const namePattern = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const greetingValid = Boolean(namePattern) && new RegExp(`^(?:Hola,\\s+${namePattern}\\.|Buenos días,\\s+${namePattern}\\.|Buenas tardes,\\s+${namePattern}\\.|Buenas noches,\\s+${namePattern}\\.)`, 'i').test(firstParagraph);
  const doubleGreeting = Boolean(namePattern) && new RegExp(`^Hola,\\s+${namePattern}\\.\\s+(?:Buenos días|Buenas tardes|Buenas noches)\\.$`, 'i').test(firstParagraph);
  const namePresent = containsName(value, name);
  const bodyParagraphs = paragraphs.slice(1);
  const repeatedName = bodyParagraphs.some(paragraph => new RegExp(`^${namePattern}(?:\\s*[,.:!-])`, 'i').test(paragraph)) || (namePresent && normalizedTokens(value).filter(token => normalizedTokens(name).includes(token)).length > normalizedTokens(name).length + 1);
  const hardFailures: string[] = [];
  if (!namePresent) hardFailures.push('missing_personal_name');
  if (!greetingValid) hardFailures.push('invalid_greeting');
  if (doubleGreeting) hardFailures.push('double_greeting');
  if (repeatedName) hardFailures.push('repeated_personal_name');
  if (!value || /\r|\n{3,}|(^|\n)\s+$/.test(message)) hardFailures.push('invalid_whitespace');
  if ((value.length > 220 && !value.includes('\n\n')) || paragraphs.some(paragraph => paragraph.length > 450)) hardFailures.push('whatsapp_wall_of_text');
  if (value.length > 1400) hardFailures.push('final_message_too_long');
  return { approved: hardFailures.length === 0, hardFailures, namePresent, greetingValid, repeatedName, paragraphCount: paragraphs.length, charCount: value.length, newlineCount: (value.match(/\n/g) ?? []).length };
}
