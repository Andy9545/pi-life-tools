import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  parseAmount,
} from "@/utils/format";

describe("format utils", () => {
  it("formats numbers with locale grouping", () => {
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
  });

  it("tolerates unsupported locale tags without throwing", () => {
    const out = formatNumber(1234.5, "zz-ZZ");
    expect(typeof out).toBe("string");
    expect(out).not.toBe("—");
  });

  it("renders a dash for non-finite values (never NaN/Infinity)", () => {
    expect(formatNumber(Number.NaN, "en")).toBe("—");
    expect(formatNumber(Number.POSITIVE_INFINITY, "en")).toBe("—");
    expect(formatCurrency(Number.NaN, "en")).toBe("—");
    expect(formatPercent(Number.NaN, "en")).toBe("—");
  });

  it("formats currency via Intl", () => {
    expect(formatCurrency(1000, "en", "USD")).toMatch(/1,?000/);
  });

  it("formats percent via Intl", () => {
    expect(formatPercent(52, "en")).toBe("52%");
  });

  it("parses amount strings, tolerating thousands separators", () => {
    expect(parseAmount("1,234.5")).toBe(1234.5);
    expect(parseAmount("1000")).toBe(1000);
    expect(parseAmount(1000)).toBe(1000);
    expect(parseAmount("")).toBeNull();
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount("abc")).toBeNull();
  });
});
