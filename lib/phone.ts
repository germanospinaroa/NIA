import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export function normalizeNationalPhone(nationalNumber: string, countryCode: string) {
  const parsed = parsePhoneNumberFromString(nationalNumber.replace(/[^\d]/g, ''), countryCode.toUpperCase() as CountryCode);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

export function normalizeInboundPhone(value: string | null | undefined) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `+${digits}` : null;
}
