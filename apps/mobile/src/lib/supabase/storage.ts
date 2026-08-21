// Supabase auth session storage backed by the device Keychain (expo-secure-store) instead of
// plaintext AsyncStorage — on-brand for a privacy-first app. SecureStore caps values at ~2KB,
// and a Supabase session can exceed that, so we chunk the value across keys.

import * as SecureStore from 'expo-secure-store';

const CHUNK = 1800;
const opts: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED };

export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const countStr = await SecureStore.getItemAsync(`${key}__n`, opts);
    if (!countStr) return null;
    const count = Number(countStr);
    let out = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}__${i}`, opts);
      if (part == null) return null;
      out += part;
    }
    return out;
  },
  async setItem(key: string, value: string): Promise<void> {
    await this.removeItem(key);
    const count = Math.max(1, Math.ceil(value.length / CHUNK));
    await SecureStore.setItemAsync(`${key}__n`, String(count), opts);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${key}__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK), opts);
    }
  },
  async removeItem(key: string): Promise<void> {
    const countStr = await SecureStore.getItemAsync(`${key}__n`, opts);
    if (countStr) {
      const count = Number(countStr);
      for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${key}__${i}`, opts);
    }
    await SecureStore.deleteItemAsync(`${key}__n`, opts);
  },
};
