import type { Locale } from "@/services/i18n";

/**
 * Centralized localStorage key registry. No tool may touch localStorage
 * directly (Spec §7) — all access goes through storageService.
 */
export const STORAGE_ROOT_KEY = "pi-life-tools:state";

/**
 * The versioned, on-disk shape of the whole app state blob.
 * Bump CURRENT_VERSION in storageVersion.ts when this changes; add a migration.
 */
export interface PersistedState {
  version: number;
  language: Locale | null;
  settings: {
    currency: string;
    reducedMotion: boolean;
  };
  toolHistory: ToolHistoryEntry[];
  results: Record<string, unknown>;
  dataCards: SavedDataCard[];
  dashboard: {
    lifeScore: number | null;
    updatedAt: string | null;
  };
}

export interface ToolHistoryEntry {
  tool: string;
  usedAt: string;
}

export interface SavedDataCard {
  id: string;
  tool: string;
  title: string;
  summary: string;
  fields: { label: string; value: string }[];
  createdAt: string;
  locale: Locale;
}
