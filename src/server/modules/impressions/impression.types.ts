export type ImpressionRecord = {
  billboardId: string;
  playlistId: string;
  creativeId: string;
  /** Owner of the creative, denormalised so delivery can be queried per advertiser. */
  advertiserId: string;
  scheduleId?: string;
  occurredAt: Date;
};
