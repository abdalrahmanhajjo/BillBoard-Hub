import { connectToDatabase } from '@/server/db/mongoose';
import { PlaylistModel, type PlaylistDocument } from '@/server/modules/playlists/playlist.model';
import type { PlaylistRecord } from '@/server/modules/playlists/playlist.types';
import type { UpdatePlaylistSchemaOutput } from '@/shared/contracts/playlist/playlist.schema';

export const playlistRepository = {
  async create(data: PlaylistRecord): Promise<PlaylistDocument> {
    await connectToDatabase();
    const created = await PlaylistModel.create(data);
    return created.toObject() as PlaylistDocument;
  },

  async findById(playlistId: string): Promise<PlaylistDocument | null> {
    await connectToDatabase();
    return PlaylistModel.findById(playlistId).lean<PlaylistDocument>().exec();
  },

  async findMany(filter: { billboardId?: string } = {}): Promise<PlaylistDocument[]> {
    await connectToDatabase();
    const query = filter.billboardId ? { billboardId: filter.billboardId } : {};
    return PlaylistModel.find(query).sort({ createdAt: -1 }).lean<PlaylistDocument[]>().exec();
  },

  async updateById(
    playlistId: string,
    data: UpdatePlaylistSchemaOutput,
  ): Promise<PlaylistDocument | null> {
    await connectToDatabase();
    return PlaylistModel.findByIdAndUpdate(playlistId, data, { new: true })
      .lean<PlaylistDocument>()
      .exec();
  },

  async deleteById(playlistId: string): Promise<PlaylistDocument | null> {
    await connectToDatabase();
    return PlaylistModel.findByIdAndDelete(playlistId).lean<PlaylistDocument>().exec();
  },
};
