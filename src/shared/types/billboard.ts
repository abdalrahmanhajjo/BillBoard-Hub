import {
  BILLBOARD_STATUSES,
  BILLBOARD_TYPES,
  DIMENSION_UNITS,
  SCREEN_STATUSES,
} from '../constants/billboard';

export type BillboardType = (typeof BILLBOARD_TYPES)[keyof typeof BILLBOARD_TYPES];
export type BillboardStatus = (typeof BILLBOARD_STATUSES)[keyof typeof BILLBOARD_STATUSES];
export type DimensionUnit = (typeof DIMENSION_UNITS)[keyof typeof DIMENSION_UNITS];
export type ScreenStatus = (typeof SCREEN_STATUSES)[keyof typeof SCREEN_STATUSES];

export type BillboardLocation = {
  address: string;
  city: string;
  country: string;
};

export type BillboardDimensions = {
  width: number;
  height: number;
  unit: DimensionUnit;
};

export type Billboard = {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: BillboardType;
  location: BillboardLocation;
  dimensions: BillboardDimensions;
  monthlyPrice: number;
  trafficCount?: number;
  status: BillboardStatus;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Public-safe billboard shape for the storefront/catalog. Internal statuses
 * (reserved/occupied/maintenance) are collapsed into `isAvailable` so the
 * reason a billboard is unavailable is never exposed to visitors.
 */
export type PublicBillboard = {
  id: string;
  name: string;
  description?: string;
  type: BillboardType;
  location: BillboardLocation;
  dimensions: BillboardDimensions;
  monthlyPrice: number;
  trafficCount?: number;
  images: string[];
  isAvailable: boolean;
};

export type Resolution = {
  width: number;
  height: number;
};

export type DigitalSpec = {
  id: string;
  billboardId: string;
  resolution: Resolution;
  brightness: number;
  slotDurationSeconds: number;
  rotatingAdsCount: number;
  screenStatus: ScreenStatus;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Public-safe digital spec for the storefront. Operational fields such as
 * `screenStatus` (on/off/fault) are omitted so live hardware state is never
 * exposed to visitors — only the marketing-relevant capabilities remain.
 */
export type PublicDigitalSpec = {
  resolution: Resolution;
  brightness: number;
  slotDurationSeconds: number;
  rotatingAdsCount: number;
};
