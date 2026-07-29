import { PLAYLIST_STATUSES } from '@/shared/constants/playlist';

export type PlaylistStatus = (typeof PLAYLIST_STATUSES)[keyof typeof PLAYLIST_STATUSES];

export type Playlist = {
  id: string;
  billboardId: string;
  name: string;
  status: PlaylistStatus;
  /** Ordered creative ids; play order is the array order. */
  creativeIds: string[];
  createdAt?: string;
  updatedAt?: string;
};
