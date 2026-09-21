export function normalizeName(raw: string) {
  return raw.trim().replace(/\s+/g, "").slice(0, 12);
}
