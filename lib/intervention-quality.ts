export function hasInterventionValue(value: unknown) {
  if (typeof value !== 'string') return false;
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length >= 45 && words.length <= 220 && /\?|prueba|antes|hoy|elige|anota|separa|vuelve|revisa/i.test(value);
}
