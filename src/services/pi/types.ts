/**
 * Pi Apps SDK type surface (verified against official docs:
 * https://pi-apps.github.io/pi-sdk-docs/platform/SDK_reference).
 * Only the subset v1 uses (init / authenticate / openShareDialog) is typed.
 * Payment methods are intentionally omitted (Spec §15: no payment system).
 */

export type Scope = "username" | "payments" | "wallet_address";

export interface PiUser {
  uid: string;
  username: string;
}

export interface AuthResult {
  accessToken: string;
  user: PiUser;
}

export interface PaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: object;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: { txid: string; verified: boolean; _link: string } | null;
}

export interface PiInitOptions {
  version: string;
  sandbox?: boolean;
}

/** Minimal window.Pi surface we depend on. */
export interface PiSdk {
  init(options: PiInitOptions): void | Promise<void>;
  authenticate(
    scopes: Scope[],
    onIncompletePaymentFound: (payment: PaymentDTO) => void,
  ): Promise<AuthResult>;
  openShareDialog(title: string, message: string): void;
}

declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

export {};
