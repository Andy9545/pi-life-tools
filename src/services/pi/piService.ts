import type { AuthResult, PaymentDTO, PiSdk, Scope } from "./types";

/**
 * Pi integration layer (Spec §8). All window.Pi access is isolated here;
 * tool logic never calls the SDK. Init failure degrades gracefully — the
 * app keeps working; only Pi-specific features (auth, share) are unavailable.
 * The access token is kept private and never exposed to the UI (Spec §8).
 */

const SANDBOX = import.meta.env.VITE_PI_SANDBOX !== "false";

let initialized = false;
let initError: string | null = null;
let auth: AuthResult | null = null;

/** Reset module state — used by tests; safe to call anytime. */
export function resetPiState(): void {
  initialized = false;
  initError = null;
  auth = null;
}

function sdk(): PiSdk | null {
  if (typeof window === "undefined") return null;
  return window.Pi ?? null;
}

export function isPiAvailable(): boolean {
  return sdk() !== null;
}

export function isPiInitialized(): boolean {
  return initialized && initError === null;
}

export function isPiAuthenticated(): boolean {
  return auth !== null;
}

export function getInitError(): string | null {
  return initError;
}

export function getPiUser(): AuthResult["user"] | null {
  return auth ? auth.user : null;
}

/**
 * Initialize the Pi SDK. Safe to call multiple times; no-ops after success.
 * Catches all errors so a broken/missing SDK never crashes the app.
 */
export function initPi(): { ok: boolean; error: string | null } {
  if (initialized) return { ok: initError === null, error: initError };
  const pi = sdk();
  if (!pi) {
    initialized = true;
    initError = "pi-unavailable";
    return { ok: false, error: initError };
  }
  try {
    pi.init({ version: "2.0", sandbox: SANDBOX });
    initialized = true;
    initError = null;
    return { ok: true, error: null };
  } catch (e) {
    initialized = true;
    initError = e instanceof Error ? e.message : "pi-init-failed";
    return { ok: false, error: initError };
  }
}

function onIncompletePaymentFound(_payment: PaymentDTO): void {
  // v1 has no payment server. Incomplete payments are ignored safely.
}

/**
 * Authenticate with the given scopes. v1 uses ["username"] only.
 * Resolves to the public user object or null (never throws to callers).
 */
export async function authenticatePi(
  scopes: Scope[] = ["username"],
): Promise<AuthResult["user"] | null> {
  const pi = sdk();
  if (!pi || !initialized || initError) return null;
  try {
    const result = await pi.authenticate(scopes, onIncompletePaymentFound);
    auth = result;
    return result.user;
  } catch {
    auth = null;
    return null;
  }
}

/**
 * Open the native Pi share dialog. Falls back to the Web Share API, then to a
 * no-op. Returns true if any share channel succeeded.
 */
export function shareViaPi(title: string, message: string): boolean {
  const pi = sdk();
  if (pi && initialized && initError === null) {
    try {
      pi.openShareDialog(title, message);
      return true;
    } catch {
      // fall through to web share
    }
  }
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      void navigator.share({ title, text: message });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
