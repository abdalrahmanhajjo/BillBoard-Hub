/**
 * Formats a billboard's monthly price for the public storefront.
 *
 * Currency is not modeled on the billboard yet, so USD is used as the MVP
 * default. Centralized here so it can be swapped in one place later.
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatMonthlyPrice(monthlyPrice: number): string {
  return `${priceFormatter.format(monthlyPrice)} / month`;
}
