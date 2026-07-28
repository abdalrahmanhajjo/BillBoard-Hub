/**
 * Ordered, run-once migration runner.
 *
 *   pnpm migrate:status
 *   pnpm migrate --dry-run
 *   pnpm migrate
 *
 * Applied migrations are recorded in `_migrations`, so re-running is a no-op.
 * Execution stops at the first failure so a partial run leaves the remainder
 * pending rather than silently skipping them.
 */
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import env from '@next/env';
import mongoose from 'mongoose';

const { loadEnvConfig } = env;
loadEnvConfig(process.cwd());

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations',
);
const LEDGER = '_migrations';

const isDryRun = process.argv.includes('--dry-run');
const statusOnly = process.argv.includes('--status');

async function loadMigrations() {
  const entries = await readdir(MIGRATIONS_DIR);

  const files = entries.filter((file) => /^\d{4}-.+\.mjs$/.test(file)).sort();

  return Promise.all(
    files.map(async (file) => {
      const module = await import(pathToFileURL(path.join(MIGRATIONS_DIR, file)).href);

      if (typeof module.up !== 'function') {
        throw new Error(`${file} does not export an \`up\` function.`);
      }

      return { file, name: module.name ?? file.replace(/\.mjs$/, ''), up: module.up };
    }),
  );
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set.');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME ?? 'billboard-hub',
  });

  const db = mongoose.connection.db;
  const ledger = db.collection(LEDGER);
  await ledger.createIndex({ name: 1 }, { unique: true });

  const migrations = await loadMigrations();
  const applied = new Set(
    (await ledger.find({}, { projection: { name: 1 } }).toArray()).map((row) => row.name),
  );

  if (statusOnly) {
    console.log(`database: ${db.databaseName}\n`);
    for (const migration of migrations) {
      console.log(`  ${applied.has(migration.name) ? 'applied' : 'PENDING'}  ${migration.name}`);
    }
    console.log(`\n${migrations.length} total, ${migrations.length - applied.size} pending`);
    await mongoose.disconnect();
    return;
  }

  const pending = migrations.filter((migration) => !applied.has(migration.name));

  if (pending.length === 0) {
    console.log('nothing to run — all migrations applied.');
    await mongoose.disconnect();
    return;
  }

  console.log(`${isDryRun ? '[dry-run] ' : ''}${pending.length} pending migration(s)\n`);

  for (const migration of pending) {
    const startedAt = Date.now();
    console.log(`→ ${migration.name}`);

    try {
      await migration.up(db, {
        dryRun: isDryRun,
        log: (message) => console.log(`    ${message}`),
      });
    } catch (error) {
      console.error(`✗ ${migration.name} failed — stopping.`);
      console.error(error);
      await mongoose.disconnect();
      process.exit(1);
    }

    const durationMs = Date.now() - startedAt;

    if (isDryRun) {
      console.log(`  [dry-run] not recorded (${durationMs}ms)\n`);
      continue;
    }

    await ledger.insertOne({ name: migration.name, appliedAt: new Date(), durationMs });
    console.log(`✓ ${migration.name} (${durationMs}ms)\n`);
  }

  console.log(isDryRun ? '[dry-run] complete — nothing was written.' : 'migrations complete.');
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('migration runner failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
