type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, AnalyticsValue>>;
  }
}

export function trackEvent(event: string, parameters: Record<string, AnalyticsValue> = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...parameters });
}
