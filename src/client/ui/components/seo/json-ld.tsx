import type { JsonLdValue } from '@/shared/seo/schema';

const SCHEMA_ORG_CONTEXT = 'https://schema.org';

function withoutContext(entry: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...entry };
  delete rest['@context'];
  return rest;
}

/**
 * Emits multiple entities as a single `@graph` node rather than a bare array.
 *
 * Both forms are valid JSON-LD, but a top-level array has no `@context` of its
 * own, and consumers routinely read `parsed['@context']` straight off the parsed
 * payload — which throws on an array. `@graph` is also the conventional shape
 * for entities that cross-reference each other by `@id`, which ours do.
 */
function toStructuredPayload(value: JsonLdValue): Record<string, unknown> {
  if (!Array.isArray(value)) {
    return value;
  }

  const contexts = new Set(
    value
      .map((entry) => entry['@context'])
      .filter((context): context is string => typeof context === 'string'),
  );
  // Only hoist when every entry carries a context and they all agree; otherwise
  // leave each entry's own context in place so no entity is reinterpreted.
  const everyEntryHasContext = value.every((entry) => typeof entry['@context'] === 'string');
  const sharedContext = contexts.size === 1 && everyEntryHasContext ? [...contexts][0] : undefined;

  return {
    '@context': sharedContext ?? SCHEMA_ORG_CONTEXT,
    '@graph': sharedContext ? value.map(withoutContext) : value,
  };
}

function serializeJsonLd(value: JsonLdValue): string {
  return JSON.stringify(toStructuredPayload(value)).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
