import type { PersistedState } from "./storageKeys";

/**
 * Storage schema versioning (Spec §7: versioned data structure + migration).
 * When PersistedState changes shape, bump CURRENT_VERSION and append a
 * migration to MIGRATIONS keyed by the source version.
 */
export const CURRENT_VERSION = 1;

type Migration = (data: unknown) => unknown;

/**
 * Map of: version the blob currently claims -> function to upgrade it to next.
 * Keep keys sorted ascending; storageService applies them in order.
 */
export const MIGRATIONS: Record<number, Migration> = {
  // Example for future use:
  // 1: (d) => ({ ...(d as object), settings: { currency: "USD", reducedMotion: false } }),
};

export function defaultState(): PersistedState {
  return {
    version: CURRENT_VERSION,
    language: null,
    settings: {
      currency: "USD",
      reducedMotion: false,
    },
    toolHistory: [],
    results: {},
    dataCards: [],
    dashboard: {
      lifeScore: null,
      updatedAt: null,
    },
  };
}
