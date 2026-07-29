/**
 * Creates the first administrator, or promotes an existing account to admin.
 *
 *   pnpm admin:create -- --email you@example.com --password '...' \
 *                        --first Rami --last Haddad
 *   pnpm admin:create -- --email existing@example.com --promote
 *
 * Registration always assigns the advertiser role, and changing a role through
 * the API requires an existing admin. A fresh database therefore has nobody who
 * can approve a reservation, which is why this bootstrap exists as an operator
 * script run with production credentials rather than as an HTTP endpoint: an
 * endpoint able to mint admins is a privilege-escalation hole no matter how it
 * is guarded.
 *
 * Idempotent: re-running against an existing admin reports and changes nothing.
 */
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import env from '@next/env';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { loadEnvConfig } = env;
loadEnvConfig(process.cwd());

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;
const COLLECTION = 'users';

// Deliberately stricter than `strongPasswordSchema` (8 chars, symbol optional):
// this is the account that can approve payments and change every other user's
// role, and it is created once by an operator rather than typed by a visitor.
const PASSWORD_RULES = [
  { message: 'be at least 12 characters long', test: (v) => v.length >= 12 },
  { message: 'contain a lowercase letter', test: (v) => /[a-z]/.test(v) },
  { message: 'contain an uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { message: 'contain a number', test: (v) => /\d/.test(v) },
  { message: 'contain a symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/** Never echo a password into the shell history or CI logs. */
async function promptForPassword() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question('New admin password (input is visible): ')).trim();
  } finally {
    rl.close();
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      password: { type: 'string' },
      first: { type: 'string' },
      last: { type: 'string' },
      promote: { type: 'boolean', default: false },
    },
  });

  if (!process.env.MONGODB_URI) fail('MONGODB_URI is not set.');
  if (!values.email) fail('Pass --email.');

  const email = values.email.trim().toLowerCase();

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME ?? 'billboard-hub',
  });

  const db = mongoose.connection.db;
  const users = db.collection(COLLECTION);
  const existing = await users.findOne({ email });

  console.log(`\ndatabase: ${db.databaseName}`);

  if (existing) {
    if (existing.role === 'admin' && existing.isActive) {
      console.log(`\n  ${email} is already an active admin. Nothing to do.\n`);
      return;
    }

    if (!values.promote) {
      fail(
        `${email} already exists with role "${existing.role}".\n` +
          '  Re-run with --promote to raise it to admin.',
      );
    }

    await users.updateOne(
      { _id: existing._id },
      { $set: { role: 'admin', isActive: true, updatedAt: new Date() } },
    );
    console.log(`\n  Promoted ${email} to admin.\n`);
    return;
  }

  if (values.promote) fail(`${email} does not exist, so there is nothing to promote.`);
  if (!values.first || !values.last) fail('Pass --first and --last for a new account.');

  const password = values.password ?? (await promptForPassword());
  const broken = PASSWORD_RULES.filter((rule) => !rule.test(password));
  if (broken.length > 0) {
    fail(`The password must ${broken.map((rule) => rule.message).join(', ')}.`);
  }

  const now = new Date();
  await users.insertOne({
    firstName: values.first.trim(),
    lastName: values.last.trim(),
    email,
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
    role: 'admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`\n  Created admin ${email}. Sign in at /login and change nothing else here.\n`);
}

main()
  .catch((error) => {
    console.error(`\n  ${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
