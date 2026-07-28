# Migrations

Ordered, run-once changes to data that a Mongoose schema cannot make on its own.

Adding a field to a schema only affects documents written afterwards. Anything
that has to reshape existing documents — backfilling a new required field,
renaming, splitting a collection — belongs here.

## Running

```bash
pnpm migrate:status   # what has run, what is pending
pnpm migrate --dry-run
pnpm migrate          # apply everything pending, in order
```

Applied migrations are recorded in the `_migrations` collection, so re-running
is a no-op. The runner stops at the first failure rather than continuing, so a
partial run leaves later migrations pending rather than silently skipped.

## Writing one

Create `migrations/NNNN-short-name.mjs`, numbered one higher than the last:

```js
export const name = '0002-example';

/** @param {import('mongodb').Db} db */
export async function up(db, { dryRun, log }) {
  const pending = await db.collection('things').countDocuments({ field: null });
  log(`things to update: ${pending}`);
  if (dryRun) return;
  await db.collection('things').updateMany({ field: null }, { $set: { field: 'value' } });
}
```

Rules that keep these safe to run against production:

- **Idempotent.** Filter on the thing you are changing, so a second run does
  nothing.
- **Batched** if the collection can be large; do not load everything into memory.
- **Never destructive without an explicit flag.** Prefer adding over deleting.
- **Report what it skipped.** If a row cannot be migrated, say so rather than
  guessing at a value.
