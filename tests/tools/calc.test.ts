import { describe, expect, it } from "vitest";
import { ValidationError } from "@/utils/validate";
import { calculateFinancialHealth } from "@/tools/financial-health/calculate";
import { calculateCompoundInterest } from "@/tools/compound-interest/calculate";
import { calculateGoalPlanner } from "@/tools/goal-planner/calculate";
import { calculateLifeTime } from "@/tools/life-time/calculate";
import { calculateMortgage } from "@/tools/mortgage/calculate";
import { calculateDebtPayoff } from "@/tools/debt-payoff/calculate";
import { calculateLifeDecision } from "@/tools/life-decision/calculate";
import { calculateTimeValue } from "@/tools/time-value/calculate";

function expectErrorKey(fn: () => unknown, key: string) {
  try {
    fn();
    throw new Error("expected ValidationError but nothing was thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(ValidationError);
    expect((e as ValidationError).key).toBe(key);
  }
}

describe("financial-health", () => {
  it("scores a healthy profile", () => {
    const r = calculateFinancialHealth({
      monthlyIncome: 5000,
      monthlyExpenses: 3000,
      monthlySavings: 1000,
      debt: 0,
      emergencyFund: 18000,
    });
    expect(r.savingsRate).toBe(20);
    expect(r.emergencyFundMonths).toBe(6);
    expect(r.financialHealthScore).toBeGreaterThan(70);
    expect(r.flags.allGood).toBe(true);
  });

  it("flags weak areas", () => {
    const r = calculateFinancialHealth({
      monthlyIncome: 5000,
      monthlyExpenses: 4800,
      monthlySavings: 200,
      debt: 30000,
      emergencyFund: 1000,
    });
    expect(r.flags.lowSavings).toBe(true);
    expect(r.flags.lowEmergency).toBe(true);
    expect(r.flags.highDebt).toBe(true);
    expect(r.flags.highExpenses).toBe(true);
  });

  it("rejects zero income", () => {
    expectErrorKey(
      () =>
        calculateFinancialHealth({
          monthlyIncome: 0,
          monthlyExpenses: 0,
          monthlySavings: 0,
          debt: 0,
          emergencyFund: 0,
        }),
      "errors.zero",
    );
  });

  it("rejects negative", () => {
    expectErrorKey(
      () =>
        calculateFinancialHealth({
          monthlyIncome: -1,
          monthlyExpenses: 0,
          monthlySavings: 0,
          debt: 0,
          emergencyFund: 0,
        }),
      "errors.negative",
    );
  });
});

describe("compound-interest", () => {
  it("grows principal with contributions", () => {
    const r = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 100,
      annualRate: 7,
      years: 10,
    });
    expect(r.finalAmount).toBeGreaterThan(r.totalPrincipal);
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.annualGrowth).toHaveLength(11);
  });

  it("handles 0% rate as linear growth", () => {
    const r = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 100,
      annualRate: 0,
      years: 10,
    });
    expect(r.finalAmount).toBeCloseTo(13000, 5);
    expect(r.totalInterest).toBe(0);
  });

  it("handles 0 years", () => {
    const r = calculateCompoundInterest({
      principal: 1000,
      monthlyContribution: 100,
      annualRate: 7,
      years: 0,
    });
    expect(r.finalAmount).toBe(1000);
    expect(r.annualGrowth).toHaveLength(1);
  });
});

describe("goal-planner", () => {
  it("estimates completion and progress", () => {
    const r = calculateGoalPlanner({
      goalAmount: 10000,
      currentAmount: 2000,
      monthlyContribution: 200,
      annualRate: 5,
    });
    expect(r.progressPercent).toBeCloseTo(20, 5);
    expect(r.reachable).toBe(true);
    expect(r.estimatedMonths).not.toBeNull();
    expect(r.estimatedCompletionDate).not.toBeNull();
  });

  it("marks unreachable when contribution is 0 and rate is 0", () => {
    const r = calculateGoalPlanner({
      goalAmount: 10000,
      currentAmount: 2000,
      monthlyContribution: 0,
      annualRate: 0,
    });
    expect(r.reachable).toBe(false);
    expect(r.estimatedMonths).toBeNull();
  });

  it("computes monthly needed for a target date", () => {
    const future = new Date(Date.now() + 365.25 * 5 * 86400000)
      .toISOString()
      .slice(0, 10);
    const r = calculateGoalPlanner({
      goalAmount: 10000,
      currentAmount: 0,
      monthlyContribution: 100,
      annualRate: 0,
      targetDate: future,
    });
    expect(r.monthlyNeeded).not.toBeNull();
    expect(r.monthlyNeeded!).toBeGreaterThan(0);
  });

  it("rejects past target date", () => {
    expectErrorKey(
      () =>
        calculateGoalPlanner({
          goalAmount: 10000,
          currentAmount: 0,
          monthlyContribution: 100,
          annualRate: 0,
          targetDate: "2000-01-01",
        }),
      "errors.logicalConflict",
    );
  });
});

describe("life-time", () => {
  it("computes elapsed and remaining years", () => {
    const r = calculateLifeTime({ birthDate: "1980-01-01", lifeExpectancy: 80 });
    expect(r.ageYears).toBeGreaterThan(40);
    expect(r.remainingYears).toBeGreaterThan(0);
    expect(r.lifeProgressPercent).toBeGreaterThan(0);
    expect(r.lifeProgressPercent).toBeLessThan(100);
  });

  it("rejects future birth date", () => {
    expectErrorKey(
      () => calculateLifeTime({ birthDate: "2999-01-01", lifeExpectancy: 80 }),
      "errors.invalidDate",
    );
  });

  it("rejects zero expectancy", () => {
    expectErrorKey(
      () => calculateLifeTime({ birthDate: "1980-01-01", lifeExpectancy: 0 }),
      "errors.zero",
    );
  });
});

describe("mortgage", () => {
  it("computes equal-installment payment", () => {
    const r = calculateMortgage({
      homePrice: 300000,
      downPayment: 60000,
      annualRate: 6,
      years: 30,
    });
    expect(r.loanAmount).toBe(240000);
    expect(r.monthlyPayment).toBeCloseTo(1438.92, 1);
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.interestRatio).toBeGreaterThan(0);
  });

  it("handles 0% rate as straight-line", () => {
    const r = calculateMortgage({
      homePrice: 120000,
      downPayment: 0,
      annualRate: 0,
      years: 10,
    });
    expect(r.monthlyPayment).toBeCloseTo(1000, 5);
    expect(r.totalInterest).toBe(0);
  });

  it("rejects down payment above price", () => {
    expectErrorKey(
      () =>
        calculateMortgage({
          homePrice: 100000,
          downPayment: 120000,
          annualRate: 6,
          years: 30,
        }),
      "errors.logicalConflict",
    );
  });
});

describe("debt-payoff", () => {
  it("simulates payoff", () => {
    const r = calculateDebtPayoff({
      debtAmount: 10000,
      annualRate: 18,
      monthlyPayment: 500,
    });
    expect(r.insufficientPayment).toBe(false);
    expect(r.payoffMonths).not.toBeNull();
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalPayment).toBeCloseTo(10000 + r.totalInterest, 5);
  });

  it("warns when payment does not cover interest", () => {
    const r = calculateDebtPayoff({
      debtAmount: 10000,
      annualRate: 18,
      monthlyPayment: 100,
    });
    expect(r.insufficientPayment).toBe(true);
    expect(r.payoffMonths).toBeNull();
  });
});

describe("life-decision", () => {
  it("averages rated criteria", () => {
    const r = calculateLifeDecision({
      ratings: { income: 8, growth: 7, risk: 6, time: 5, freedom: 9, family: 4 },
    });
    expect(r.ratedCount).toBe(6);
    expect(r.decisionScore).toBeCloseTo(6.5, 1);
    expect(r.strengths).toContain("income");
    expect(r.attentions).toContain("family");
  });

  it("rejects when nothing is rated", () => {
    expectErrorKey(() => calculateLifeDecision({ ratings: {} }), "errors.empty");
  });
});

describe("time-value", () => {
  it("computes hourly and minute value", () => {
    const r = calculateTimeValue({
      annualIncome: 60000,
      weeklyHours: 40,
      weeksPerYear: 52,
    });
    expect(r.hourlyRate).toBeCloseTo(28.846, 2);
    expect(r.minuteRate).toBeCloseTo(0.4808, 3);
  });

  it("converts an item price into work hours", () => {
    const r = calculateTimeValue({
      annualIncome: 60000,
      weeklyHours: 40,
      weeksPerYear: 52,
      itemPrice: 500,
    });
    expect(r.hoursForItem).not.toBeNull();
    expect(r.hoursForItem!).toBeCloseTo(17.34, 1);
  });

  it("rejects zero weekly hours", () => {
    expectErrorKey(
      () =>
        calculateTimeValue({
          annualIncome: 60000,
          weeklyHours: 0,
          weeksPerYear: 52,
        }),
      "errors.zero",
    );
  });
});
