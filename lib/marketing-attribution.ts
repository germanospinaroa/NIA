const STORAGE_KEY = 'nia_marketing_attribution';

export const MARKETING_ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'src',
  'sck',
  'xcod',
] as const;

export type MarketingAttribution = Partial<Record<(typeof MARKETING_ATTRIBUTION_KEYS)[number], string>>;

function readStored(): MarketingAttribution {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as MarketingAttribution;
  } catch {
    return {};
  }
}

export function captureMarketingAttribution() {
  if (typeof window === 'undefined') return;
  const query = new URLSearchParams(window.location.search);
  const incoming: MarketingAttribution = {};
  for (const key of MARKETING_ATTRIBUTION_KEYS) {
    const value = query.get(key)?.trim();
    if (value) incoming[key] = value;
  }
  if (!Object.keys(incoming).length) return;

  const next = { ...readStored(), ...incoming };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Attribution is useful but must never block the acquisition flow.
  }
}

export function readMarketingAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') return {};
  try {
    const sessionValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (sessionValue) {
      const parsed = JSON.parse(sessionValue);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as MarketingAttribution;
    }
  } catch {
    // Fall back to localStorage below.
  }
  return readStored();
}
