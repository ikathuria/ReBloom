// Web stub for the native op-sqlite store. On web, `createDb()` (see ./index.ts) short-circuits to
// the in-memory store before this module is ever called — but Metro still statically follows the
// dynamic `import('./opsqlite')`, which pulls in @op-engineering/op-sqlite → better-sqlite3 and
// breaks the web bundle. This `.web.ts` variant keeps op-sqlite out of the web build entirely.
// It is never invoked at runtime; it throws only as a guard.

import type { ReBloomDb } from './types';

export function createOpSqliteDb(): Promise<ReBloomDb> {
  throw new Error('op-sqlite is native-only; web uses the in-memory store (see db/index.ts).');
}
