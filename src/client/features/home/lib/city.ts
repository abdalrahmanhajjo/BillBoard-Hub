/** Case/whitespace-insensitive key so "Tripoli" and "tripoli" group together. */
export function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

/** Canonical display casing for a city name (Title Case). */
export function displayCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}
