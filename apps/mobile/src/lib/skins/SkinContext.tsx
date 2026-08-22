// App-wide "which skin is active" state, plus the Pro "Custom" skin's user-chosen growth emojis.
// Both persist in the local key/value store, so they survive relaunches. Falls back to the default
// skin (and default custom emojis) with no provider, which keeps unit tests simple.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getDb } from '@/lib/db';
import { DEFAULT_SKIN, SKINS, isSkinId, type Skin, type SkinId, type StageKey } from './skins';

const FLAG = 'skin';
const FLAG_CUSTOM = 'skin.custom.emoji';

type StageEmoji = Record<StageKey, string>;

interface SkinContextValue {
  /** The active skin, with the user's custom emojis already merged in when Custom is selected. */
  skin: Skin;
  skinId: SkinId;
  setSkin: (id: SkinId) => void;
  /** The Custom skin's per-stage emojis (defaults until the user changes them). */
  customEmoji: StageEmoji;
  setCustomEmoji: (stage: StageKey, emoji: string) => void;
}

const SkinContext = createContext<SkinContextValue>({
  skin: DEFAULT_SKIN,
  skinId: DEFAULT_SKIN.id,
  setSkin: () => {},
  customEmoji: SKINS.custom.stageEmoji,
  setCustomEmoji: () => {},
});

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skinId, setSkinId] = useState<SkinId>(DEFAULT_SKIN.id);
  const [customEmoji, setCustomEmojiState] = useState<StageEmoji>(SKINS.custom.stageEmoji);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const db = await getDb();
        const [chosen, customJson] = await Promise.all([db.getFlag(FLAG), db.getFlag(FLAG_CUSTOM)]);
        if (!alive) return;
        if (chosen && isSkinId(chosen)) setSkinId(chosen);
        if (customJson) {
          const parsed = JSON.parse(customJson) as Partial<StageEmoji>;
          // Merge over defaults so a partial save (or a future new stage) still renders.
          setCustomEmojiState((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // No store / bad JSON — keep the defaults.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setSkin = (id: SkinId) => {
    setSkinId(id);
    getDb()
      .then((db) => db.setFlag(FLAG, id))
      .catch(() => {});
  };

  const setCustomEmoji = (stage: StageKey, emoji: string) => {
    setCustomEmojiState((prev) => {
      const next = { ...prev, [stage]: emoji };
      getDb()
        .then((db) => db.setFlag(FLAG_CUSTOM, JSON.stringify(next)))
        .catch(() => {});
      return next;
    });
  };

  const skin = useMemo<Skin>(
    () => (skinId === 'custom' ? { ...SKINS.custom, stageEmoji: customEmoji } : SKINS[skinId]),
    [skinId, customEmoji],
  );

  return (
    <SkinContext.Provider value={{ skin, skinId, setSkin, customEmoji, setCustomEmoji }}>
      {children}
    </SkinContext.Provider>
  );
}

/** The active skin (+ setters). Safe without a provider (returns the default skin). */
export const useSkin = () => useContext(SkinContext);
