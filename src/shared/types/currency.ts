import type { CURRENCIES } from '@/shared/constants/currencies';

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES]['code'];
