import {
  asFiniteNumber,
  ensureNonNegative,
  ensureNotTooLarge,
  ValidationError,
} from "@/utils/validate";

export interface CompoundInterestInput {
  principal: number;
  monthlyContribution: number;
  annualRate: number; // %
  years: number;
}

export interface CompoundYear {
  year: number;
  balance: number;
  principal: number;
}

export interface CompoundInterestResult {
  finalAmount: number;
  totalPrincipal: number;
  totalInterest: number;
  annualGrowth: CompoundYear[];
}

/**
 * Compound Interest (Spec §3.2). Monthly compounding with monthly
 * contributions. Handles 0% rate (linear growth) and 0 years gracefully.
 */
export function calculateCompoundInterest(
  input: CompoundInterestInput,
): CompoundInterestResult {
  const principal = ensureNonNegative(asFiniteNumber(input.principal));
  const monthly = ensureNonNegative(asFiniteNumber(input.monthlyContribution));
  const annualRate = ensureNonNegative(asFiniteNumber(input.annualRate));
  const years = Math.max(0, Math.floor(asFiniteNumber(input.years)));

  if (years > 100) throw new ValidationError("errors.tooLarge");
  ensureNotTooLarge(principal + monthly * years * 12);

  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  let balance = principal;
  const annualGrowth: CompoundYear[] = [
    { year: 0, balance: principal, principal },
  ];
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    if (m % 12 === 0) {
      annualGrowth.push({
        year: m / 12,
        balance,
        principal: principal + monthly * m,
      });
    }
  }

  const totalPrincipal = principal + monthly * months;
  const totalInterest = balance - totalPrincipal;
  return { finalAmount: balance, totalPrincipal, totalInterest, annualGrowth };
}
