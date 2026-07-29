'use client';

import { ErrorFeaturePage } from '@/client/features/errors/pages/error-page';

export default function GlobalError({ reset }: { reset: () => void }) {
  return <ErrorFeaturePage reset={reset} />;
}
