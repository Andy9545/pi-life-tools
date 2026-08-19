import { parseAmount } from "./format";

/**
 * UI-level per-field validation (Spec §12). Returns an i18n error *key* so the
 * input can show a localized message on the right field. Calculations still
 * re-validate defensively (defense in depth).
 */
export function amountFieldError(
  value: string,
  opts: { mustBePositive?: boolean } = {},
): string | null {
  if (value.trim() === "") return "errors.empty";
  const n = parseAmount(value);
  if (n === null) return "errors.notNumber";
  if (n < 0) return "errors.negative";
  if (opts.mustBePositive && n === 0) return "errors.zero";
  return null;
}

export function dateFieldError(value: string): string | null {
  if (value.trim() === "") return "errors.empty";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "errors.invalidDate";
  return null;
}
