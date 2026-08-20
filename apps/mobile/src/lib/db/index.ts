// Local encrypted store — public surface. See docs/02-privacy-and-consent.md + PLAN.md M2.
//
// Contract in ./types, schema in ./migrations, in-memory impl in ./memory (tests + fallback).
// The encrypted op-sqlite/SQLCipher driver (./opsqlite) is added with the EAS dev build and
// wired into `createDb()` for native platforms; until then `createDb()` returns the in-memory
// store so the app and tests run everywhere (including the iOS Simulator).

import type { ReBloomDb } from './types';
import { createInMemoryDb } from './memory';

export * from './types';
export { MIGRATIONS, SCHEMA_VERSION } from './migrations';
export { createInMemoryDb };

/**
 * Open the app's local store. TODO(M2 dev build): return the encrypted op-sqlite/SQLCipher
 * implementation on iOS/Android; keep in-memory for tests and web.
 */
export async function createDb(): Promise<ReBloomDb> {
  return createInMemoryDb();
}
