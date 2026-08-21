// "Leave with your data" — delete (docs/02 principle 6). Wipes the encrypted local store and,
// when a cloud deletion is provided, the user's synced copy too. Pure + injectable: the cloud
// step is a callback so this is unit-tested with the in-memory db and no network.

import type { ReBloomDb } from '@/lib/db';

export interface DeleteResult {
  local: true;
  cloud: 'skipped' | 'deleted';
}

/**
 * Delete everything. Removes the user's cloud rows first (if `deleteCloud` is given), then wipes
 * the local DB — so a failure mid-way never leaves the local copy gone but the cloud copy behind.
 */
export async function deleteAllData(
  db: ReBloomDb,
  deleteCloud?: () => Promise<void>,
): Promise<DeleteResult> {
  let cloud: DeleteResult['cloud'] = 'skipped';
  if (deleteCloud) {
    await deleteCloud();
    cloud = 'deleted';
  }
  await db.clearAll();
  return { local: true, cloud };
}
