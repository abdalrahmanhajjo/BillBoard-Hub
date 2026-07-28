import { model, models, Schema, type InferSchemaType } from 'mongoose';

const impressionSchema = new Schema(
  {
    billboardId: {
      type: String,
      required: true,
      index: true,
    },
    playlistId: {
      type: String,
      required: true,
      index: true,
    },
    creativeId: {
      type: String,
      required: true,
      index: true,
    },
    // Denormalised from the creative at write time so advertiser-scoped
    // analytics is a single indexed read rather than a join per query.
    advertiserId: {
      type: String,
      required: true,
      index: true,
    },
    scheduleId: {
      type: String,
    },
    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'impressions',
  },
);

// Common analytics access paths: per-screen and per-creative over time.
impressionSchema.index({ billboardId: 1, occurredAt: -1 });
impressionSchema.index({ creativeId: 1, occurredAt: -1 });
impressionSchema.index({ advertiserId: 1, occurredAt: -1 });

export type ImpressionDocument = InferSchemaType<typeof impressionSchema> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const ImpressionModel = models.Impression || model('Impression', impressionSchema);
