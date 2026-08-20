import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  authenticatePi,
  getInitError,
  getPiUser,
  initPi,
  isPiAuthenticated,
  isPiAvailable,
  isPiInitialized,
  resetPiState,
  shareViaPi,
} from "@/services/pi/piService";
import type { PiSdk } from "@/services/pi/types";

beforeEach(() => {
  resetPiState();
  delete (window as unknown as { Pi?: PiSdk }).Pi;
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as unknown as { Pi?: PiSdk }).Pi;
});

describe("piService — graceful degrade without SDK", () => {
  it("reports unavailable when window.Pi is missing", () => {
    expect(isPiAvailable()).toBe(false);
  });

  it("init fails safely with pi-unavailable (never throws)", async () => {
    const r = await initPi();
    expect(r.ok).toBe(false);
    expect(r.error).toBe("pi-unavailable");
    expect(getInitError()).toBe("pi-unavailable");
    expect(isPiInitialized()).toBe(false);
  });

  it("authenticate resolves null when SDK missing", async () => {
    const user = await authenticatePi(["username"]);
    expect(user).toBeNull();
    expect(isPiAuthenticated()).toBe(false);
  });

  it("share returns false when no SDK and no Web Share", () => {
    expect(shareViaPi("title", "message")).toBe(false);
  });
});

describe("piService — with mocked SDK", () => {
  function mockPi(overrides: Partial<PiSdk> = {}): PiSdk {
    const pi: PiSdk = {
      init: vi.fn(),
      authenticate: vi.fn(async () => ({
        accessToken: "tok-123",
        user: { uid: "u1", username: "pioneer" },
      })),
      openShareDialog: vi.fn(),
      ...overrides,
    };
    (window as unknown as { Pi: PiSdk }).Pi = pi;
    return pi;
  }

  it("init succeeds and calls Pi.init with version + sandbox", async () => {
    const pi = mockPi();
    const r = await initPi();
    expect(r.ok).toBe(true);
    expect(pi.init).toHaveBeenCalledWith({
      version: "2.0",
      sandbox: expect.any(Boolean),
    });
  });

  it("authenticate returns the public user (token stays private)", async () => {
    mockPi();
    await initPi();
    const user = await authenticatePi(["username"]);
    expect(user).toEqual({ uid: "u1", username: "pioneer" });
    expect(getPiUser()?.username).toBe("pioneer");
    expect(isPiAuthenticated()).toBe(true);
    // access token must never be exposed via the service surface
    expect(JSON.stringify(user)).not.toContain("tok-123");
  });

  it("share uses openShareDialog and returns true", async () => {
    const pi = mockPi();
    await initPi();
    expect(shareViaPi("My Card", "summary")).toBe(true);
    expect(pi.openShareDialog).toHaveBeenCalledWith("My Card", "summary");
  });

  it("authenticate failure resolves null (never throws)", async () => {
    mockPi({
      authenticate: vi.fn(() => Promise.reject(new Error("denied"))),
    });
    await initPi();
    const user = await authenticatePi(["username"]);
    expect(user).toBeNull();
    expect(isPiAuthenticated()).toBe(false);
  });
});
