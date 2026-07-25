import { CREATIVE_STATUSES, CREATIVE_TYPES } from '@/shared/constants/creative';

export type CreativeType = (typeof CREATIVE_TYPES)[keyof typeof CREATIVE_TYPES];
export type CreativeStatus = (typeof CREATIVE_STATUSES)[keyof typeof CREATIVE_STATUSES];

export type Creative = {
  id: string;
  advertiserId: string;
  name: string;
  type: CreativeType;
  assetUrl: string;
  durationSeconds?: number;
  status: CreativeStatus;
  createdAt?: string;
  updatedAt?: string;
};
