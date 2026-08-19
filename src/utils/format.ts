/**
 * Locale-aware formatting helpers (Spec §4.3: never hardcode separators /
 * decimals / dates / percents — always Intl). All functions are pure and
 * DOM-free so they are unit-testable independently of any tool. `locale`
 * accepts any BCP-47 string; Intl handles unsupported tags gracefully.
 */

export function formatNumber(
  value: number,
  locale: string,
  fractionDigits = 2,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatCurrency(
  value: number,
  locale: string,
  currency = "USD",
): string {
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return formatNumber(value, locale);
  }
}

export function formatPercent(
  value: number,
  locale: string,
  fractionDigits = 1,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}

export function formatDate(
  date: Date | string,
  locale: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Parse a user-entered numeric string into a finite number or null. */
export function parseAmount(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === "") return null;
  const n =
    typeof input === "number" ? input : Number(String(input).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}
