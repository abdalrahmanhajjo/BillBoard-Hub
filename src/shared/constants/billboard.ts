export const BILLBOARD_TYPES = {
  STATIC: 'static',
  DIGITAL: 'digital',
} as const;

export const BILLBOARD_STATUSES = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
} as const;

export const DIMENSION_UNITS = {
  METERS: 'm',
  FEET: 'ft',
} as const;

export const SCREEN_STATUSES = {
  ON: 'on',
  OFF: 'off',
  STANDBY: 'standby',
  FAULT: 'fault',
} as const;
