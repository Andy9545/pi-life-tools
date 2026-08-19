import type { Locale } from "@/services/i18n";
import en from "./en/common.json";
import zhTW from "./zh-TW/common.json";
import zhCN from "./zh-CN/common.json";
import ja from "./ja/common.json";
import ko from "./ko/common.json";
import es from "./es/common.json";

/** Canonical dictionary shape derived from the English locale. */
export type Dictionary = typeof en;

/**
 * All locale dictionaries. Assigning each to `Dictionary` makes TypeScript
 * reject a locale that is missing a key present in English — a compile-time
 * parity guard complementing the runtime i18n completeness test.
 */
export const messages: Record<Locale, Dictionary> = {
  en,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  ja,
  ko,
  es,
};
