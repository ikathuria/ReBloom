// Local encrypted store — public surface. See docs/02-privacy-and-consent.md + PLAN.md M2.
//
// Contract in ./types, schema in ./migrations, in-memory impl in ./memory (tests + fallback).
// The encrypted op-sqlite/SQLCipher driver (./opsqlite) is added with the EAS dev build and
// wired into `createDb()` for native platforms; until then `createDb()` returns the in-memory
// store so the app and tests run everywhere (including the iOS Simulator).

import { Platform } from 'react-native';

import type { ReBloomDb } from './types';
import { createInMemoryDb } from './memory';

export * from './types';
export { MIGRATIONS, SCHEMA_VERSION } from './migrations';
export { createInMemoryDb };

const inJest = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;

/**
 * Open a fresh local store. Uses the encrypted op-sqlite/SQLCipher store on a native dev build;
 * falls back to the in-memory store for tests, web, and Expo Go (where op-sqlite's native module
 * is absent) so the app still runs — data just won't persist across restarts there.
 */
export async function createDb(): Promise<ReBloomDb> {
  if (inJest || Platform.OS === 'web') return createInMemoryDb();
  try {
    const { createOpSqliteDb } = await import('./opsqlite');
    // createOpSqliteDb self-heals a stale/corrupt encrypted file (recreating a
    // fresh encrypted store), so reaching the catch below means op-sqlite itself
    // is unavailable — expected in Expo Go, a real problem in a dev/prod build.
    return await createOpSqliteDb();
  } catch (e) {
    console.warn(
      '[db] op-sqlite unavailable — falling back to a non-persistent, unencrypted ' +
        'in-memory store. Expected in Expo Go; on a native build this means DATA ' +
        'WILL NOT PERSIST and is NOT encrypted at rest.',
      e,
    );
    return createInMemoryDb();
  }
}

let dbPromise: Promise<ReBloomDb> | null = null;

/** App-wide singleton store. Use this in app code; `createDb()` is for tests that want isolation. */
export function getDb(): Promise<ReBloomDb> {
  if (!dbPromise) dbPromise = createDb();
  return dbPromise;
}

/** Test helper: drop the singleton so the next getDb() opens a fresh store. */
export function __resetDbSingleton(): void {
  dbPromise = null;
}
