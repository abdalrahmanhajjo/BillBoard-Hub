export interface AdCreativeRecord {
  campaignId: string;
  url: string;
  fileType: 'image' | 'video';
  durationSeconds?: number;
  createdBy: string;
}
