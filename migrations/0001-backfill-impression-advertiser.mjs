/**
 * Impressions gained a required `advertiserId` so delivery could be attributed
 * to the advertiser who owns the creative. Rows written before that change have
 * no such field and never appear in advertiser-scoped analytics.
 *
 * Resolves each one through its creative. Where the creative has since been
 * deleted the owner is unrecoverable, so the row is reported and left alone
 * rather than assigned a guessed value.
 */
export const name = '0001-backfill-impression-advertiser';

const BATCH_SIZE = 500;

/** @param {import('mongodb').Db} db */
export async function up(db, { dryRun, log }) {
  const impressions = db.collection('impressions');
  const creatives = db.collection('creatives');

  const missing = { $or: [{ advertiserId: { $exists: false } }, { advertiserId: null }] };
  const total = await impressions.countDocuments(missing);

  log(`impressions missing advertiserId: ${total}`);
  if (total === 0) return;

  // One pass over creatives instead of a lookup per impression.
  const owners = new Map();
  for await (const creative of creatives.find({}, { projection: { advertiserId: 1 } })) {
    owners.set(String(creative._id), creative.advertiserId);
  }
  log(`creatives available for lookup: ${owners.size}`);

  let updated = 0;
  let orphaned = 0;
  let operations = [];

  for await (const impression of impressions.find(missing, { projection: { creativeId: 1 } })) {
    const advertiserId = owners.get(String(impression.creativeId));

    if (!advertiserId) {
      orphaned += 1;
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: impression._id },
        update: { $set: { advertiserId: String(advertiserId) } },
      },
    });

    if (operations.length >= BATCH_SIZE) {
      if (!dryRun) await impressions.bulkWrite(operations, { ordered: false });
      updated += operations.length;
      operations = [];
      log(`${updated}/${total} processed`);
    }
  }

  if (operations.length > 0) {
    if (!dryRun) await impressions.bulkWrite(operations, { ordered: false });
    updated += operations.length;
  }

  log(`${dryRun ? 'would update' : 'updated'}: ${updated}`);
  if (orphaned > 0) {
    log(`skipped, creative no longer exists: ${orphaned}`);
  }
}
