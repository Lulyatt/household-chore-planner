/** Trim and collapse internal whitespace for member display names. */
export function formatMemberName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}
