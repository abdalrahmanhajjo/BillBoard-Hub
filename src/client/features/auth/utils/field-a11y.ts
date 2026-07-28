/**
 * Builds an `aria-describedby` value from ids that may be absent, returning
 * undefined rather than an empty string so the attribute is dropped entirely.
 */
export function describedByIds(ids: Array<string | false | undefined | null>): string | undefined {
  const present = ids.filter((id): id is string => Boolean(id));
  return present.length > 0 ? present.join(' ') : undefined;
}
