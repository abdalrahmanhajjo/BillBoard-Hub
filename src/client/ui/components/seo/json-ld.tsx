import type { JsonLdValue } from '@/shared/seo/schema';

function serializeJsonLd(value: JsonLdValue): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
