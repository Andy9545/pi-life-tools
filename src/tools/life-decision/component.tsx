import { useState } from "react";
import { useI18n } from "@/services/i18n/context";
import { ResultCard } from "@/components/ui/ResultCard";
import { DataCardGate } from "@/components/ui/DataCardGate";
import { ValidationError } from "@/utils/validate";
import { formatNumber } from "@/utils/format";
import {
  CRITERIA,
  calculateLifeDecision,
  type Criterion,
  type LifeDecisionResult,
} from "./calculate";
import { addToolHistory, setResult as persistResult } from "@/services/storage/storageService";

export function LifeDecisionTool() {
  const { t, locale } = useI18n();
  const [ratings, setRatings] = useState<Record<Criterion, number>>(
    () =>
      Object.fromEntries(CRITERIA.map((c) => [c, 0])) as Record<Criterion, number>,
  );
  const [result, setResult] = useState<LifeDecisionResult | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const setRating = (c: Criterion, v: number) =>
    setRatings((s) => ({ ...s, [c]: v }));

  function handleCalculate() {
    try {
      const r = calculateLifeDecision({
        ratings: Object.fromEntries(
          CRITERIA.map((c) => [c, ratings[c] > 0 ? ratings[c] : null]),
        ),
      });
      setResult(r);
      setTopError(null);
      addToolHistory("life-decision");
      persistResult("life-decision:last", r);
    } catch (err) {
      if (err instanceof ValidationError) {
        setResult(null);
        setTopError(err.key);
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <p className="text-sm text-gray-500 mb-4">{t("tools.life-decision.intro")}</p>
        <div className="space-y-3">
          {CRITERIA.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-gray-700">
                {t(`tools.life-decision.criteria.${c}`)}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                value={ratings[c]}
                onChange={(e) => setRating(c, Number(e.target.value))}
                className="flex-1 accent-[var(--color-brand)]"
                aria-label={t(`tools.life-decision.criteria.${c}`)}
              />
              <span className="w-10 text-right text-sm font-medium text-gray-900">
                {ratings[c] > 0 ? ratings[c] : "—"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">{t("tools.life-decision.scoreLabel")}</p>
        <button type="button" onClick={handleCalculate} className="mt-4 w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium active:scale-[0.98] transition">
          {t("common.calculate")}
        </button>
        {topError && <p className="mt-3 text-sm text-red-500">{t(topError)}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <ResultCard
            label={t("tools.life-decision.results.decisionScore")}
            value={`${formatNumber(result.decisionScore, locale, 1)}/10`}
            highlight
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{t("tools.life-decision.results.strengths")}</p>
              {result.strengths.length ? (
                <p className="text-sm text-gray-900">
                  {result.strengths.map((c) => t(`tools.life-decision.criteria.${c}`)).join("、")}
                </p>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">{t("tools.life-decision.results.attentions")}</p>
              {result.attentions.length ? (
                <p className="text-sm text-gray-900">
                  {result.attentions.map((c) => t(`tools.life-decision.criteria.${c}`)).join("、")}
                </p>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">{t("tools.life-decision.conclusion")}</p>

          <DataCardGate
            cardInput={{
              tool: "life-decision",
              title: t("tools.life-decision.name"),
              summary: t("tools.life-decision.summary", { score: formatNumber(result.decisionScore, locale, 1) }),
              fields: [
                { label: t("tools.life-decision.results.decisionScore"), value: `${formatNumber(result.decisionScore, locale, 1)}/10` },
                ...result.perCriterion
                  .filter((r) => r.score !== null)
                  .map((r) => ({
                    label: t(`tools.life-decision.criteria.${r.criterion}`),
                    value: String(r.score),
                  })),
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
