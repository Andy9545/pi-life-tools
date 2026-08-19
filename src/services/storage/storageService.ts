import { isLocale } from "@/services/i18n";
import type { Locale } from "@/services/i18n";
import {
  STORAGE_ROOT_KEY,
  type PersistedState,
  type SavedDataCard,
  type ToolHistoryEntry,
} from "./storageKeys";
import { CURRENT_VERSION, MIGRATIONS, defaultState } from "./storageVersion";

/**
 * Unified storage service (Spec §7). Every persistence action in the app
 * flows through here — tools never call localStorage directly.
 *
 * Design: a single versioned blob under STORAGE_ROOT_KEY. Reads parse +
 * validate + migrate; writes are try/caught so quota / corruption never
 * surfaces as NaN/exceptions to the UI (Spec §12).
 */

let cache: PersistedState | null = null;

function readRaw(): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_ROOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeRaw(state: PersistedState): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_ROOT_KEY, JSON.stringify(state));
    return true;
  } catch {
    // Quota exceeded or storage disabled — degrade silently, keep in-memory cache.
    return false;
  }
}

/** Apply migrations sequentially from the blob's declared version to current. */
function migrate(raw: unknown): PersistedState {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  let version =
    typeof obj.version === "number" ? obj.version : CURRENT_VERSION;
  let data: Record<string, unknown> = obj;

  while (version < CURRENT_VERSION) {
    const fn = MIGRATIONS[version];
    if (!fn) break;
    data = fn(data) as Record<string, unknown>;
    version += 1;
  }

  // Merge validated fields onto a fresh default so missing keys are filled.
  const merged: PersistedState = {
    ...base,
    ...(data as Partial<PersistedState>),
    version: CURRENT_VERSION,
    settings: {
      ...base.settings,
      ...((data.settings as Partial<PersistedState["settings"]>) ?? {}),
    },
    dashboard: {
      ...base.dashboard,
      ...((data.dashboard as Partial<PersistedState["dashboard"]>) ?? {}),
    },
    toolHistory: Array.isArray(data.toolHistory)
      ? (data.toolHistory as ToolHistoryEntry[])
      : [],
    dataCards: Array.isArray(data.dataCards)
      ? (data.dataCards as SavedDataCard[])
      : [],
    results:
      data.results && typeof data.results === "object"
        ? (data.results as Record<string, unknown>)
        : {},
    language: isLocale(data.language) ? (data.language as Locale) : null,
  };
  return merged;
}

export function loadState(): PersistedState {
  if (cache) return cache;
  const raw = readRaw();
  cache = raw == null ? defaultState() : migrate(raw);
  // Persist normalized shape so future loads are stable.
  writeRaw(cache);
  return cache;
}

function persist(): void {
  if (cache) writeRaw(cache);
}

export function getState(): PersistedState {
  return loadState();
}

export function resetState(): PersistedState {
  cache = defaultState();
  writeRaw(cache);
  return cache;
}

// --- Language ---------------------------------------------------------------

export function getLanguage(): Locale | null {
  return loadState().language;
}

export function setLanguage(locale: Locale): void {
  const s = loadState();
  s.language = locale;
  persist();
}

// --- Settings ---------------------------------------------------------------

export function getSettings(): PersistedState["settings"] {
  return loadState().settings;
}

export function updateSettings(
  patch: Partial<PersistedState["settings"]>,
): void {
  const s = loadState();
  s.settings = { ...s.settings, ...patch };
  persist();
}

// --- Tool history -----------------------------------------------------------

export function getToolHistory(): ToolHistoryEntry[] {
  return loadState().toolHistory;
}

export function addToolHistory(tool: string): void {
  const s = loadState();
  s.toolHistory = [{ tool, usedAt: new Date().toISOString() }, ...s.toolHistory]
    .slice(0, 50);
  persist();
}

// --- Results ----------------------------------------------------------------

export function getResult<T = unknown>(key: string): T | null {
  const s = loadState();
  return (s.results[key] as T | undefined) ?? null;
}

export function setResult(key: string, value: unknown): void {
  const s = loadState();
  s.results[key] = value;
  persist();
}

// --- Data cards -------------------------------------------------------------

export function getDataCards(): SavedDataCard[] {
  return loadState().dataCards;
}

export function saveDataCard(card: SavedDataCard): void {
  const s = loadState();
  s.dataCards = [card, ...s.dataCards.filter((c) => c.id !== card.id)].slice(
    0,
    100,
  );
  persist();
}

export function deleteDataCard(id: string): void {
  const s = loadState();
  s.dataCards = s.dataCards.filter((c) => c.id !== id);
  persist();
}

// --- Dashboard --------------------------------------------------------------

export function getDashboard(): PersistedState["dashboard"] {
  return loadState().dashboard;
}

export function setDashboardLifeScore(score: number): void {
  const s = loadState();
  s.dashboard = { lifeScore: score, updatedAt: new Date().toISOString() };
  persist();
}
