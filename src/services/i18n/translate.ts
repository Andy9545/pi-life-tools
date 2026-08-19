import { defaultLocale, type Locale } from "./index";
import { messages } from "@/locales";

function resolve(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, seg) => {
    if (acc && typeof acc === "object" && seg in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[seg];
    }
    return undefined;
  }, obj);
}

function interpolate(
  str: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{${k}}`,
  );
}

/**
 * Translate a dot-path key for the given locale, falling back to the default
 * locale, then to the key itself. Never returns undefined (Spec §12).
 */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primary = resolve(messages[locale], key);
  if (typeof primary === "string") return interpolate(primary, params);
  const fallback = resolve(messages[defaultLocale], key);
  if (typeof fallback === "string") return interpolate(fallback, params);
  return key;
}
