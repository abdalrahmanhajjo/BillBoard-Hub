export interface DeviceRecord {
  /** The screen this device is physically installed on. */
  billboardId: string;
  name: string;
  /** SHA-256 of the issued key; the raw key is shown once and never stored. */
  keyHash: string;
  isActive: boolean;
  lastSeenAt?: Date | null;
  createdBy: string;
}
