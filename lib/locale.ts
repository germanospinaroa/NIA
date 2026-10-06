export type CountryOption = { code: string; name: string; flag: string; callingCode: string; defaultTimezone: string };

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', callingCode: '+57', defaultTimezone: 'America/Bogota' },
  { code: 'MX', name: 'México', flag: '🇲🇽', callingCode: '+52', defaultTimezone: 'America/Mexico_City' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', callingCode: '+1', defaultTimezone: 'America/New_York' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', callingCode: '+1', defaultTimezone: 'America/Toronto' },
  { code: 'ES', name: 'España', flag: '🇪🇸', callingCode: '+34', defaultTimezone: 'Europe/Madrid' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', callingCode: '+54', defaultTimezone: 'America/Argentina/Buenos_Aires' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', callingCode: '+56', defaultTimezone: 'America/Santiago' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', callingCode: '+51', defaultTimezone: 'America/Lima' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', callingCode: '+44', defaultTimezone: 'Europe/London' },
];

export function countryByCode(code: string | null | undefined) {
  return COUNTRY_OPTIONS.find(country => country.code === code?.toUpperCase()) ?? null;
}

export function countryFromBrowserLocale(locale = typeof navigator !== 'undefined' ? navigator.language : '') {
  try {
    const region = new Intl.Locale(locale).region?.toUpperCase();
    return COUNTRY_OPTIONS.some(country => country.code === region) ? region : '';
  } catch {
    return '';
  }
}

export function timezoneFromBrowser() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; }
}

export function timezoneLabel(timezone: string) {
  const city = timezone.split('/').at(-1)?.replaceAll('_', ' ') || timezone;
  let offset = '';
  try {
    offset = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || '';
  } catch { offset = ''; }
  return `${city}${offset ? ` · ${offset}` : ''}`;
}

export function timeLabel(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const suffix = hour >= 12 ? 'p. m.' : 'a. m.';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}
