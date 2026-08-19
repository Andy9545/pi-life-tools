/**
 * Shared input validation for tool calculations (Spec §12). Calculations
 * throw {@link ValidationError} carrying an i18n *key* (not text) so the
 * logic stays language-independent while the UI can localize the message.
 */
export class ValidationError extends Error {
  readonly key: string;
  constructor(key: string) {
    super(key);
    this.name = "ValidationError";
    this.key = key;
  }
}

export function asFiniteNumber(
  value: number | null | undefined,
  key = "errors.notNumber",
): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    throw new ValidationError(key);
  }
  return value;
}

export function ensureNonNegative(value: number): number {
  if (value < 0) throw new ValidationError("errors.negative");
  return value;
}

/** Must be > 0 (distinguishes negative vs zero in the error key). */
export function ensurePositive(value: number): number {
  if (value < 0) throw new ValidationError("errors.negative");
  if (value === 0) throw new ValidationError("errors.zero");
  return value;
}

export function ensureNotTooLarge(value: number, max = 1e15): number {
  if (value > max) throw new ValidationError("errors.tooLarge");
  return value;
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}
