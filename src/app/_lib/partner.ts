export type PartnerId = string;

export function normalizePartnerId(value: unknown): PartnerId | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 64) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}