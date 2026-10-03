export function getSafeNextPath(value: string | null | undefined, fallback = '/app') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback;
  }

  try {
    const parsed = new URL(value, 'https://nia.internal');
    if (parsed.origin !== 'https://nia.internal' || parsed.pathname !== value.split('?')[0].split('#')[0]) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return value;
}
