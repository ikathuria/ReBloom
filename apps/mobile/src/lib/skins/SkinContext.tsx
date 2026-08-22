// App-wide "which skin is active" state. Persists the choice in the local key/value store, so it
// survives relaunches. Falls back to the default skin with no provider (keeps unit tests simple).

import { createContext, useContext, useEffect, useState } from 'react';

import { getDb } from '@/lib/db';
import { DEFAULT_SKIN, SKINS, isSkinId, type Skin, type SkinId } from './skins';

const FLAG = 'skin';

interface SkinContextValue {
  skin: Skin;
  skinId: SkinId;
  setSkin: (id: SkinId) => void;
}

const SkinContext = createContext<SkinContextValue>({
  skin: DEFAULT_SKIN,
  skinId: DEFAULT_SKIN.id,
  setSkin: () => {},
});

export function SkinProvider({ children }: { children: React.ReactNode }) {
  const [skinId, setSkinId] = useState<SkinId>(DEFAULT_SKIN.id);

  useEffect(() => {
    let alive = true;
    getDb()
      .then((db) => db.getFlag(FLAG))
      .then((v) => {
        if (alive && v && isSkinId(v)) setSkinId(v);
      })
      .catch(() => {});
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

  return (
    <SkinContext.Provider value={{ skin: SKINS[skinId], skinId, setSkin }}>{children}</SkinContext.Provider>
  );
}

/** The active skin + a setter. Safe without a provider (returns the default skin). */
export const useSkin = () => useContext(SkinContext);
