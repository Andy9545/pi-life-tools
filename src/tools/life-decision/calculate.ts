import { ValidationError } from "@/utils/validate";

export type Criterion =
  | "income"
  | "growth"
  | "risk"
  | "time"
  | "freedom"
  | "family"
  | "interest"
  | "stability";

export const CRITERIA: Criterion[] = [
  "income",
  "growth",
  "risk",
  "time",
  "freedom",
  "family",
  "interest",
  "stability",
];

export interface LifeDecisionInput {
  ratings: Partial<Record<Criterion, number | null>>;
}

export interface CriterionScore {
  criterion: Criterion;
  score: number | null;
}

export interface LifeDecisionResult {
  decisionScore: number; // 1-10 average of rated criteria
  perCriterion: CriterionScore[];
  strengths: Criterion[];
  attentions: Criterion[];
  ratedCount: number;
}

function isValidScore(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 10;
}

/**
 * Life Decision (Spec §3.7). Structured thinking aid — NOT a decision maker.
 * Averages user-rated criteria (1-10); flags strengths (≥7) and factors to
 * watch (<5). Unrated criteria are excluded from the average and shown as "—".
 */
export function calculateLifeDecision(
  input: LifeDecisionInput,
): LifeDecisionResult {
  const perCriterion: CriterionScore[] = CRITERIA.map((c) => ({
    criterion: c,
    score: isValidScore(input.ratings[c]) ? (input.ratings[c] as number) : null,
  }));

  const rated = perCriterion.filter(
    (r): r is CriterionScore & { score: number } => r.score !== null,
  );
  if (rated.length === 0) throw new ValidationError("errors.empty");

  const decisionScore =
    Math.round((rated.reduce((s, r) => s + r.score, 0) / rated.length) * 10) /
    10;
  const strengths = rated.filter((r) => r.score >= 7).map((r) => r.criterion);
  const attentions = rated.filter((r) => r.score < 5).map((r) => r.criterion);

  return {
    decisionScore,
    perCriterion,
    strengths,
    attentions,
    ratedCount: rated.length,
  };
}
