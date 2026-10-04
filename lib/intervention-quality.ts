export function hasInterventionValue(value: unknown) {
  if (typeof value !== 'string') return false;
  const words = value.trim().split(/\s+/).filter(Boolean);
  const genericOnly = /^(conf[ií]a en ti|recuerda que eres capaz|la duda no significa que estes equivocada|escucha lo que necesitas|date permiso para confiar)[.! ]*$/i;
  return words.length > 0 && words.length <= 220 && !genericOnly.test(value.trim()) && /\?|prueba|antes|hoy|elige|anota|separa|vuelve|revisa|distingue|observa|decide/i.test(value);
}
