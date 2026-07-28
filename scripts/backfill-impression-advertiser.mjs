/**
 * Backfills `advertiserId` on impressions written before delivery was attributed
 * to advertisers.
 *
 * Rows created before that change have no `advertiserId`, so they never appear
 * in advertiser-scoped analytics. This resolves each one through its creative
 * and writes the owner onto the impression.
 *
 * Usage:
 *   node scripts/backfill-impression-advertiser.mjs --dry-run   # report only
 *   node scripts/backfill-impression-advertiser.mjs             # apply
 *
 * Safe to re-run: it only touches impressions that are still missing the field.
 */
import env from '@next/env';
import mongoose from 'mongoose';

const { loadEnvConfig } = env;
loadEnvConfig(process.cwd());

const isDryRun = process.argv.includes('--dry-run');
const BATCH_SIZE = 500;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set.');
  }

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME ?? 'billboard-hub' });

  const impressions = mongoose.connection.collection('impressions');
  const creatives = mongoose.connection.collection('creatives');

  const missingFilter = { $or: [{ advertiserId: { $exists: false } }, { advertiserId: null }] };
  const total = await impressions.countDocuments(missingFilter);

  console.log(`${isDryRun ? '[dry-run] ' : ''}impressions missing advertiserId: ${total}`);

  if (total === 0) {
    await mongoose.disconnect();
    return;
  }

  // Map every creative once rather than querying per impression.
  const creativeOwners = new Map();
  for await (const creative of creatives.find({}, { projection: { advertiserId: 1 } })) {
    creativeOwners.set(String(creative._id), creative.advertiserId);
  }
  console.log(`creatives available for lookup: ${creativeOwners.size}`);

  let updated = 0;
  let orphaned = 0;
  let operations = [];

  for await (const impression of impressions.find(missingFilter, {
    projection: { creativeId: 1 },
  })) {
    const advertiserId = creativeOwners.get(String(impression.creativeId));

    // The creative was deleted, so ownership is unrecoverable. Left untouched
    // and reported rather than guessed at.
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
      if (!isDryRun) await impressions.bulkWrite(operations, { ordered: false });
      updated += operations.length;
      operations = [];
      console.log(`  ${updated}/${total} processed`);
    }
  }

  if (operations.length > 0) {
    if (!isDryRun) await impressions.bulkWrite(operations, { ordered: false });
    updated += operations.length;
  }

  console.log(`${isDryRun ? '[dry-run] would update' : 'updated'}: ${updated}`);
  if (orphaned > 0) {
    console.log(`skipped (creative no longer exists): ${orphaned}`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('backfill failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
