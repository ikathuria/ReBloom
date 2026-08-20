// Schema for the encrypted local store. Applied by the op-sqlite implementation on open.
// Kept as plain SQL strings so they can be reviewed and unit-asserted without a native DB.

export const SCHEMA_VERSION = 1;

/** DDL applied in order on a fresh database. */
export const MIGRATIONS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS consent (
     id           INTEGER PRIMARY KEY CHECK (id = 1),  -- single row
     capture      INTEGER NOT NULL DEFAULT 0,
     analysis     INTEGER NOT NULL DEFAULT 0,
     updated_at   TEXT
   );`,
  `CREATE TABLE IF NOT EXISTS enrollments (
     track_id     TEXT PRIMARY KEY,
     cadence      TEXT NOT NULL,
     enrolled_at  TEXT NOT NULL
   );`,
  `CREATE TABLE IF NOT EXISTS track_points (
     id           TEXT PRIMARY KEY,
     track_id     TEXT NOT NULL,
     captured_at  TEXT NOT NULL,
     scores_json  TEXT NOT NULL,
     bloom        INTEGER NOT NULL
   );`,
  `CREATE INDEX IF NOT EXISTS idx_track_points_track_time
     ON track_points (track_id, captured_at);`,
];
