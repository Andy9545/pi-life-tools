import { describe, expect, it } from "vitest";
import { ValidationError } from "@/utils/validate";
import { calculateLifeDays } from "@/tools/life-days/calculate";

function expectErrorKey(fn: () => unknown, key: string) {
  try {
    fn();
    throw new Error("expected ValidationError but nothing was thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(ValidationError);
    expect((e as ValidationError).key).toBe(key);
  }
}

describe("life-days", () => {
  it("same day yields 0 days (exclusion semantics)", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-01",
    });
    expect(r.daysLived).toBe(0);
    expect(r.nextMilestone).toBe(1000);
    expect(r.daysUntilMilestone).toBe(1000);
  });

  it("one day difference yields 1 day", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-02",
    });
    expect(r.daysLived).toBe(1);
  });

  it("computes a known normal date range", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-31",
    });
    expect(r.daysLived).toBe(30);
    expect(r.nextMilestone).toBe(1000);
    expect(r.daysUntilMilestone).toBe(970);
  });

  it("handles a leap year crossing", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2020-02-28",
      calculationDate: "2020-03-01",
    });
    expect(r.daysLived).toBe(2);
  });

  it("handles February 29 across leap years", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2020-02-29",
      calculationDate: "2024-02-29",
    });
    expect(r.daysLived).toBe(1461);
  });

  it("differs by exactly one day across a birthday boundary", () => {
    const before = calculateLifeDays({
      dateOfBirth: "2000-06-15",
      calculationDate: "2025-06-14",
    });
    const onDay = calculateLifeDays({
      dateOfBirth: "2000-06-15",
      calculationDate: "2025-06-15",
    });
    expect(before.daysLived).toBe(9130);
    expect(onDay.daysLived).toBe(9131);
    expect(onDay.daysLived - before.daysLived).toBe(1);
  });

  it("rejects a future birth date", () => {
    expectErrorKey(
      () =>
        calculateLifeDays({
          dateOfBirth: "2100-01-01",
          calculationDate: "2025-01-01",
        }),
      "errors.invalidDate",
    );
  });

  it("rejects a calculation date before birth", () => {
    expectErrorKey(
      () =>
        calculateLifeDays({
          dateOfBirth: "2000-01-02",
          calculationDate: "2000-01-01",
        }),
      "errors.invalidDate",
    );
  });

  it("rejects invalid dates", () => {
    expectErrorKey(
      () =>
        calculateLifeDays({
          dateOfBirth: "not-a-date",
          calculationDate: "2000-01-01",
        }),
      "errors.invalidDate",
    );
    expectErrorKey(
      () =>
        calculateLifeDays({
          dateOfBirth: "2000-01-01",
          calculationDate: "2020-13-01",
        }),
      "errors.invalidDate",
    );
  });

  it("rejects impossible dates without rollover", () => {
    expectErrorKey(
      () =>
        calculateLifeDays({
          dateOfBirth: "2024-02-30",
          calculationDate: "2024-03-01",
        }),
      "errors.invalidDate",
    );
    expectErrorKey(
      () =>
        calculateLifeDays({
          dateOfBirth: "2023-02-29",
          calculationDate: "2023-03-01",
        }),
      "errors.invalidDate",
    );
  });

  it("rejects empty inputs", () => {
    expectErrorKey(
      () =>
        calculateLifeDays({ dateOfBirth: "", calculationDate: "2000-01-01" }),
      "errors.empty",
    );
    expectErrorKey(
      () =>
        calculateLifeDays({ dateOfBirth: "2000-01-01", calculationDate: "" }),
      "errors.empty",
    );
  });

  it("computes the next 1000-day milestone", () => {
    // 2000-01-01 -> 2049-04-13 is exactly 18000 days.
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2049-04-13",
    });
    expect(r.daysLived).toBe(18000);
    expect(r.nextMilestone).toBe(19000);
    expect(r.daysUntilMilestone).toBe(1000);
  });

  it("treats an exact milestone as already reached (strictly greater)", () => {
    // 2000-01-01 -> 2002-09-27 is exactly 1000 days.
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2002-09-27",
    });
    expect(r.daysLived).toBe(1000);
    expect(r.nextMilestone).toBe(2000);
    expect(r.daysUntilMilestone).toBe(1000);
  });

  it("is deterministic for identical inputs", () => {
    const input = {
      dateOfBirth: "1990-05-20",
      calculationDate: "2025-09-14",
    };
    expect(calculateLifeDays(input)).toEqual(calculateLifeDays(input));
  });

  it("computes weeks as days divided by 7", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-31",
    });
    expect(r.weeksLived).toBeCloseTo(30 / 7, 10);
    const week = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-08",
    });
    expect(week.weeksLived).toBe(1);
  });

  it("computes years as days divided by 365.2425", () => {
    const r = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-31",
    });
    expect(r.yearsLived).toBeCloseTo(30 / 365.2425, 10);
    const zero = calculateLifeDays({
      dateOfBirth: "2000-01-01",
      calculationDate: "2000-01-01",
    });
    expect(zero.yearsLived).toBe(0);
  });
});
