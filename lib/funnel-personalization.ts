export function addressName(value?: string | null) {
  return value?.trim().replace(/\s+/g, ' ') || '';
}
