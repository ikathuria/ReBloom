// The SQLCipher key for the local DB. Generated once with a CSPRNG and stored in the
// platform keychain (iOS Keychain / Android Keystore) via expo-secure-store — device-only,
// never synced or backed up. See docs/02-privacy-and-consent.md.

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const KEY_NAME = 'rebloom_db_key_v1';

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

/** Return the existing DB key, or generate + persist a new 256-bit one. */
export async function getOrCreateDbKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_NAME);
  if (existing) return existing;

  const key = toHex(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(KEY_NAME, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}
