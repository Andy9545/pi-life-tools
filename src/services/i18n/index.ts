export type Locale = "zh-TW" | "zh-CN" | "en" | "ja" | "ko" | "es";

export const locales: Locale[] = ["zh-TW", "zh-CN", "en", "ja", "ko", "es"];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<Locale, { name: string; dir: "ltr" }> = {
  "zh-TW": { name: "繁體中文", dir: "ltr" },
  "zh-CN": { name: "简体中文", dir: "ltr" },
  en: { name: "English", dir: "ltr" },
  ja: { name: "日本語", dir: "ltr" },
  ko: { name: "한국어", dir: "ltr" },
  es: { name: "Español", dir: "ltr" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

/**
 * Map a browser language tag to a supported Locale.
 * Spec §4.2 — zh-TW→繁體, zh-CN→简体, en/ja/ko/es, unmatched→English.
 */
export function normalizeBrowserLang(lang: string): Locale | null {
  if (!lang) return null;
  const lower = lang.toLowerCase();
  if (lower.startsWith("zh")) {
    if (lower.includes("tw") || lower.includes("hant")) return "zh-TW";
    if (lower.includes("cn") || lower.includes("hans") || lower.includes("sg"))
      return "zh-CN";
    return "zh-TW";
  }
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("en")) return "en";
  return null;
}

/**
 * Detect locale from the browser environment. Falls back to defaultLocale.
 */
export function detectLocale(): Locale {
  if (typeof navigator !== "undefined") {
    const langs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];
    for (const l of langs) {
      const mapped = normalizeBrowserLang(l);
      if (mapped) return mapped;
    }
  }
  return defaultLocale;
}
