import { z } from 'zod';
import { PLAYLIST_STATUSES } from '@/shared/constants/playlist';

const creativeIdList = z
  .array(z.string().trim().min(1, 'Creative id is required.'))
  .min(1, 'Add at least one creative to the playlist.')
  .max(50, 'A playlist can hold up to 50 creatives.');

export const createPlaylistSchema = z.object({
  billboardId: z.string().trim().min(1, 'Choose a digital billboard for this playlist.'),
  name: z
    .string()
    .trim()
    .min(2, 'Enter a playlist name.')
    .max(120, 'Playlist name must be 120 characters or fewer.'),
  creativeIds: creativeIdList,
  status: z.enum(PLAYLIST_STATUSES).default(PLAYLIST_STATUSES.DRAFT),
});

export const updatePlaylistSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Enter a playlist name.')
      .max(120, 'Playlist name must be 120 characters or fewer.')
      .optional(),
    creativeIds: creativeIdList.optional(),
    status: z.enum(PLAYLIST_STATUSES).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Change at least one playlist field before saving.',
  });

export type CreatePlaylistSchemaInput = z.input<typeof createPlaylistSchema>;
export type CreatePlaylistSchemaOutput = z.output<typeof createPlaylistSchema>;
export type UpdatePlaylistSchemaInput = z.input<typeof updatePlaylistSchema>;
export type UpdatePlaylistSchemaOutput = z.output<typeof updatePlaylistSchema>;
