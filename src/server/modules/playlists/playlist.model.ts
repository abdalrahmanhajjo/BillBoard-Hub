import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { PLAYLIST_STATUSES } from '@/shared/constants/playlist';
import type { PlaylistRecord } from './playlist.types';

const playlistSchema = new Schema<PlaylistRecord>(
  {
    billboardId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PLAYLIST_STATUSES),
      required: true,
      default: PLAYLIST_STATUSES.DRAFT,
      index: true,
    },
    creativeIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'playlists',
  },
);

export type PlaylistDocument = InferSchemaType<typeof playlistSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const PlaylistModel = models.Playlist || model('Playlist', playlistSchema);
